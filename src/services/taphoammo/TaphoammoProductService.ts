import { TaphoammoApiClient } from './TaphoammoApiClient';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { toast } from 'sonner';

export interface TaphoammoProduct {
  kiosk_token: string;
  name: string;
  description?: string;
  stock_quantity: number;
  price: number;
  cached?: boolean;
  emergency?: boolean;
  last_checked?: Date;
  ttl?: number; // Time-to-live for cache in milliseconds
}

export class TaphoammoProductService {
  private apiClient: TaphoammoApiClient;
  private DEFAULT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  
  constructor(apiClient: TaphoammoApiClient) {
    this.apiClient = apiClient;
  }
  
  /**
   * Get stock information for a product with improved caching and error handling
   */
  public async getStock(
    kioskToken: string, 
    options: {
      forceRefresh?: boolean;
      useMockData?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<TaphoammoProduct> {
    try {
      const { forceRefresh = false, useMockData = false, maxRetries = 2 } = options;

      // Use mock data if specified (for testing)
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
          kiosk_token: kioskToken,
          name: 'Mock Product ' + kioskToken.substring(0, 5),
          stock_quantity: Math.floor(Math.random() * 10) + 1,
          price: Math.floor(Math.random() * 50000) + 10000,
          cached: false,
          last_checked: new Date()
        };
      }
      
      // Check in-memory cache if not forcing refresh
      if (!forceRefresh) {
        const cachedProduct = this.apiClient.getCachedProduct(kioskToken);
        if (cachedProduct && this.isCacheValid(cachedProduct)) {
          return {
            ...cachedProduct,
            cached: true
          };
        }
      }
      
      // Call API to get stock information with retry mechanism
      let attempt = 0;
      let lastError: Error | null = null;
      
      while (attempt < maxRetries) {
        try {
          // Call API with a specific timeout
          const productData = await this.apiClient.callTaphoaMMO(
            'getStockWithCache',
            { 
              kioskToken,
              forceRefresh: forceRefresh,
              includePrice: true 
            }
          );
          
          if (!productData.success) {
            throw new TaphoammoError(
              productData.message || 'Failed to retrieve product information',
              TaphoammoErrorCodes.UNEXPECTED_RESPONSE
            );
          }

          // Create a well-structured product with valid values
          const product: TaphoammoProduct = {
            kiosk_token: kioskToken,
            name: productData.name || 'Unknown Product',
            description: productData.description || '',
            stock_quantity: this.parseStockQuantity(productData),
            price: this.parsePrice(productData),
            cached: productData.cached || false,
            emergency: productData.emergency || false,
            last_checked: new Date(),
            ttl: this.DEFAULT_CACHE_TTL
          };
          
          // Update cache
          this.apiClient.cacheProduct(kioskToken, product);
          
          // If this is fresh data, update the database cache too
          if (!product.cached && !product.emergency) {
            this.updateDatabaseCache(product).catch(err => 
              console.error("Failed to update database cache:", err)
            );
          }
          
          return product;
        } catch (error) {
          lastError = error as Error;
          attempt++;
          
          // Only show toast on final retry
          if (attempt >= maxRetries) {
            if (error instanceof TaphoammoError) {
              if (error.code === TaphoammoErrorCodes.API_TEMP_DOWN) {
                toast.warning("Product information may be outdated. Service is temporarily unavailable.", {
                  duration: 5000
                });
              }
            }
          }
          
          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
          }
        }
      }
      
      // All attempts failed, try to use database cache as fallback
      const databaseCache = await this.apiClient.getProductFromDatabaseCache(kioskToken);
      if (databaseCache) {
        return {
          ...databaseCache,
          cached: true,
          emergency: true
        };
      }
      
      // If we get here, all attempts failed and no cache is available
      throw lastError || new Error('Failed to get product information after multiple attempts');
    } catch (error) {
      console.error(`Error getting stock for ${kioskToken}:`, error);
      throw error;
    }
  }
  
  /**
   * Update the database cache with the latest product information
   */
  private async updateDatabaseCache(product: TaphoammoProduct): Promise<void> {
    try {
      // Find the product ID first by kiosk_token
      const { data: productData } = await supabase
        .from('products')
        .select('id')
        .eq('kiosk_token', product.kiosk_token)
        .single();
        
      if (!productData?.id) {
        console.warn(`Cannot update cache: No product found with kiosk_token ${product.kiosk_token}`);
        return;
      }
      
      // Update the inventory_cache table
      await supabase
        .from('inventory_cache')
        .upsert({
          kiosk_token: product.kiosk_token,
          product_id: productData.id,
          stock_quantity: product.stock_quantity,
          price: product.price || 0,
          last_checked_at: new Date().toISOString(),
          cached_until: new Date(Date.now() + this.DEFAULT_CACHE_TTL).toISOString(),
          last_sync_status: 'success',
          sync_message: null
        }, {
          onConflict: 'kiosk_token'
        });
        
      // Also update product stock in products table
      await supabase
        .from('products')
        .update({
          stock_quantity: product.stock_quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', productData.id);
    } catch (error) {
      console.error("Error updating database cache:", error);
      // Non-critical error, so we don't re-throw
    }
  }
  
  /**
   * Test connection to TaphoaMMO API
   */
  public async testConnection(
    kioskToken: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await this.apiClient.callTaphoaMMO(
        'test_connection',
        { kioskToken }
      );
      
      return {
        success: response.success === true,
        message: response.message || 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if a kiosk is active and has stock
   */
  public async checkKioskActive(
    kioskToken: string
  ): Promise<boolean> {
    try {
      const stockInfo = await this.getStock(kioskToken);
      return stockInfo && stockInfo.stock_quantity > 0;
    } catch (error) {
      if (error instanceof TaphoammoError) {
        if (error.code === TaphoammoErrorCodes.KIOSK_PENDING ||
            error.code === TaphoammoErrorCodes.API_TEMP_DOWN ||
            error.code === TaphoammoErrorCodes.STOCK_UNAVAILABLE) {
          return false;
        }
      }
      
      throw error;
    }
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(product: TaphoammoProduct): boolean {
    if (!product.last_checked || !product.ttl) {
      return false;
    }
    
    const now = new Date();
    const expiryTime = new Date(product.last_checked.getTime() + product.ttl);
    
    return now < expiryTime;
  }
  
  /**
   * Safely parse stock quantity from API response
   */
  private parseStockQuantity(data: any): number {
    // First try direct stock field
    if (data.stock_quantity !== undefined && !isNaN(Number(data.stock_quantity))) {
      return Number(data.stock_quantity);
    }
    
    // Then try stock field
    if (data.stock !== undefined && !isNaN(Number(data.stock))) {
      return Number(data.stock);
    }
    
    // Try to extract from message if it's a string containing "Stock: X"
    if (data.message && typeof data.message === 'string') {
      const stockMatch = data.message.match(/Stock:\s*(\d+)/i);
      if (stockMatch && stockMatch[1]) {
        return Number(stockMatch[1]);
      }
    }
    
    // Default to 0 if no valid stock quantity found
    return 0;
  }
  
  /**
   * Safely parse price from API response
   */
  private parsePrice(data: any): number {
    // First check for price field
    if (data.price !== undefined && !isNaN(Number(data.price))) {
      return Number(data.price);
    }
    
    // Default to 0 if no valid price found
    return 0;
  }
}
