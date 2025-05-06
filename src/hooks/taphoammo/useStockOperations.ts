
import { useApiCommon } from './useApiCommon';
import { toast } from 'sonner';  
import { supabase } from '@/integrations/supabase/client';
import { TaphoammoIntegration } from '@/services/taphoammo/TaphoammoIntegration';
import { TaphoammoProduct } from '@/services/taphoammo/TaphoammoProductService';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { TaphoammoApiOptions } from '@/services/taphoammo/TaphoammoApiClient';
import { useState } from 'react';

// Create a singleton instance of TaphoammoIntegration
const taphoammoIntegration = new TaphoammoIntegration();

// Interface for stock information
export interface StockInfo {
  kiosk_token: string;
  name?: string;
  stock_quantity: number;
  price: number;
  cached: boolean;
  emergency?: boolean;
  cacheId?: string;
  last_checked?: Date;
}

export const useStockOperations = () => {
  const { loading, setLoading, error, setError, retry, withRetry, usingCache } = useApiCommon();
  const [stockData, setStockData] = useState<StockInfo | null>(null);

  // Get product name from database if not already in stock info
  const enrichStockDataIfNeeded = async (stock: StockInfo): Promise<StockInfo> => {
    if (stock.name) return stock;
    
    try {
      // Try to get name from products table
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('kiosk_token', stock.kiosk_token)
        .single();
        
      if (product?.name) {
        return {
          ...stock,
          name: product.name
        };
      }
    } catch (err) {
      console.warn("Could not enrich stock data with product name", err);
    }
    
    return stock;
  };

  // Sync product stock with database
  const syncProductStock = async (
    productId: string,
    kioskToken: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> => {
    try {
      // Call Edge Function to sync stock
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: {
          product_id: productId,
          kiosk_token: kioskToken,
          syncType: 'manual'
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        success: true,
        message: 'Stock synchronized successfully',
        data
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to synchronize stock'
      };
    }
  };

  // Check if stock is available for purchase with improved error handling
  const checkStockAvailability = async (
    quantity = 1, 
    kioskToken: string,
    options: {
      forceRefresh?: boolean;
      showToasts?: boolean;
    } = {}
  ): Promise<{
    available: boolean;
    message?: string;
    stockData?: StockInfo;
    cached?: boolean;
  }> => {
    const { forceRefresh = false, showToasts = true } = options;
    setLoading(true);
    
    try {
      // Get stock with withRetry to handle potential errors
      const stock = await withRetry<StockInfo>(
        async () => {
          const stock = await taphoammoIntegration.getStock(kioskToken, { 
            forceRefresh,
            maxRetries: 2 // Allow 2 retries for better reliability
          });
          
          // Update the state with fetched stock data
          const stockInfo: StockInfo = {
            kiosk_token: kioskToken,
            name: stock.name,
            stock_quantity: stock.stock_quantity,
            price: stock.price || 0,
            cached: !!stock.cached,
            emergency: !!stock.emergency,
            last_checked: stock.last_checked
          };
          
          // Enrich with product name if needed
          const enrichedStock = await enrichStockDataIfNeeded(stockInfo);
          setStockData(enrichedStock);
          return enrichedStock;
        },
        'getStock',
        // Fallback function in case all retries fail
        async () => {
          try {
            // Try to get from database cache as last resort
            const { data, error } = await supabase
              .from('inventory_cache')
              .select('*')
              .eq('kiosk_token', kioskToken)
              .single();
            
            if (error || !data) throw new Error('No cache available');
            
            // Get product name from products table
            let productName = "Unknown Product";
            if (data.product_id) {
              const { data: product } = await supabase
                .from('products')
                .select('name')
                .eq('id', data.product_id)
                .single();
                
              if (product) {
                productName = product.name;
              }
            }
            
            const stockInfo: StockInfo = {
              kiosk_token: kioskToken,
              name: productName,
              stock_quantity: data.stock_quantity,
              price: data.price,
              cached: true,
              emergency: true,
              cacheId: data.id,
              last_checked: data.last_checked_at ? new Date(data.last_checked_at) : undefined
            };
            
            if (showToasts) {
              toast.warning("Using cached product data due to API issues", {
                description: "Product information may not be up-to-date"
              });
            }
            
            setStockData(stockInfo);
            return stockInfo;
          } catch (cacheError) {
            throw new Error('Failed to retrieve stock information');
          }
        }
      );
      
      // Check if stock is sufficient
      if (!stock || stock.stock_quantity < quantity) {
        return {
          available: false,
          message: stock ? "Insufficient stock for requested quantity" : "Product information not available",
          stockData: stock,
          cached: stock?.cached
        };
      }
      
      // If using emergency cache, show a toast
      if (stock.emergency && showToasts) {
        toast.warning("Using cached product data", {
          description: "Product information may not be up-to-date"
        });
      }
      
      return {
        available: true,
        stockData: stock,
        cached: stock.cached || false
      };
      
    } catch (err) {
      console.error("Stock check error:", err);
      
      // Format error message
      const errorMessage = err instanceof Error ? err.message : "Failed to check stock";
      setError(errorMessage);
      
      // Show user-friendly message for common errors
      if (err instanceof TaphoammoError && showToasts) {
        if (err.code === TaphoammoErrorCodes.API_TEMP_DOWN) {
          toast.error("API service is temporarily unavailable. Please try again later.");
        } else if (err.code === TaphoammoErrorCodes.KIOSK_PENDING) {
          toast.error("This product is currently unavailable.");
        }
      }
      
      return {
        available: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Get stock information with improved caching
  const getStock = async (
    kioskToken: string,
    options: {
      forceFresh?: boolean;
      showToasts?: boolean;
    } = {}
  ): Promise<TaphoammoProduct> => {
    const { forceFresh = false, showToasts = true } = options;
    setLoading(true);
    setError(null);

    try {
      // Convert the options to match TaphoammoApiOptions
      const apiOptions: TaphoammoApiOptions = {
        forceRefresh: forceFresh,
        useCache: !forceFresh,
        maxRetries: 2
      };

      // Use withRetry for better reliability
      const product = await withRetry(
        async () => {
          return await taphoammoIntegration.getStock(kioskToken, apiOptions);
        },
        'getStock',
        async () => {
          // Fallback to database cache
          const { data, error } = await supabase
            .from('inventory_cache')
            .select('*')
            .eq('kiosk_token', kioskToken)
            .single();
          
          if (error || !data) throw new Error('No cache available');
          
          // Get product name from products table
          let productName = "Unknown Product";
          if (data.product_id) {
            const { data: product } = await supabase
              .from('products')
              .select('name')
              .eq('id', data.product_id)
              .single();
              
            if (product) {
              productName = product.name;
            }
          }
          
          if (showToasts) {
            toast.warning("Using cached product data due to API issues", {
              description: "Product information may not be up-to-date"
            });
          }
          
          return {
            kiosk_token: kioskToken,
            name: productName,
            stock_quantity: data.stock_quantity,
            price: data.price,
            cached: true,
            emergency: true,
            last_checked: data.last_checked_at ? new Date(data.last_checked_at) : new Date()
          } as TaphoammoProduct;
        }
      );

      // Update database cache if we have fresh data
      if (!product.cached && !product.emergency) {
        try {
          // Find the product ID first
          const { data: productData } = await supabase
            .from('products')
            .select('id')
            .eq('kiosk_token', kioskToken)
            .single();
            
          if (productData?.id) {
            // Update both inventory_cache and products tables
            await supabase
              .from('inventory_cache')
              .upsert({
                kiosk_token: kioskToken,
                product_id: productData.id,
                stock_quantity: product.stock_quantity,
                price: product.price || 0,
                last_checked_at: new Date().toISOString(),
                cached_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
                last_sync_status: 'success'
              }, {
                onConflict: 'kiosk_token'
              });
            
            await supabase
              .from('products')
              .update({
                stock_quantity: product.stock_quantity,
                updated_at: new Date().toISOString()
              })
              .eq('id', productData.id);
          }
        } catch (cacheError) {
          console.error("Failed to update database cache:", cacheError);
          // Non-critical error, continue without failing
        }
      }

      return product;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in getStock:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getStock,
    checkStockAvailability,
    syncProductStock,
    stockData,
    loading,
    error,
    retry,
    usingCache
  };
};
