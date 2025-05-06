
import { BaseApiClient } from './baseClient';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StockData {
  kiosk_token: string;
  name: string;
  stock_quantity: number;
  price: number;
  cached?: boolean;
  emergency?: boolean;
  last_checked?: Date;
}

export class StockApi extends BaseApiClient {
  /**
   * Get stock information directly from API
   */
  async getStock(kioskToken: string, options: { forceRefresh?: boolean } = {}): Promise<StockData> {
    try {
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: 'getStock',
          kioskToken,
          forceRefresh: options.forceRefresh
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new TaphoammoError(
          data.message || 'Failed to get stock information',
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE
        );
      }
      
      return {
        kiosk_token: kioskToken,
        name: data.name || 'Unknown Product',
        stock_quantity: data.stock_quantity || 0,
        price: data.price || 0,
        cached: data.cached || false,
        emergency: data.emergency || false,
        last_checked: data.last_checked ? new Date(data.last_checked) : new Date()
      };
    } catch (error) {
      console.error("Error in getStock:", error);
      throw error;
    }
  }
  
  /**
   * Get stock with intelligent caching
   */
  async getStockWithCache(kioskToken: string, options: { 
    forceRefresh?: boolean,
    maxRetries?: number
  } = {}): Promise<StockData> {
    try {
      let attempts = 0;
      const maxRetries = options.maxRetries || 1;
      
      while (attempts <= maxRetries) {
        try {
          const { data, error } = await supabase.functions.invoke('taphoammo-api', {
            body: {
              action: 'getStockWithCache',
              kioskToken,
              forceRefresh: options.forceRefresh && attempts === 0 // Only force refresh on first attempt
            }
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          if (!data.success) {
            throw new TaphoammoError(
              data.message || 'Failed to get stock information',
              TaphoammoErrorCodes.UNEXPECTED_RESPONSE
            );
          }
          
          return {
            kiosk_token: kioskToken,
            name: data.name || 'Unknown Product',
            stock_quantity: data.stock_quantity || 0,
            price: data.price || 0,
            cached: data.cached || false,
            emergency: data.emergency || false,
            last_checked: data.last_checked ? new Date(data.last_checked) : new Date()
          };
        } catch (attemptError) {
          attempts++;
          
          // If we've used all retries, throw the last error
          if (attempts > maxRetries) {
            throw attemptError;
          }
          
          // Wait a bit before retrying (with exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempts)));
        }
      }
      
      // This should never be reached due to the throw in the retry loop
      throw new Error("Failed to get stock after retries");
    } catch (error) {
      console.error("Error in getStockWithCache:", error);
      throw error;
    }
  }
  
  /**
   * Sync inventory data with database by calling the edge function
   */
  async syncStockWithDatabase(kioskToken: string, productId: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: {
          kiosk_token: kioskToken,
          product_id: productId,
          syncType: 'manual'
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        success: true,
        message: "Stock synchronized successfully",
        data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error synchronizing stock"
      };
    }
  }

  /**
   * Get stock information from database cache
   */
  async getStockFromDatabase(productId: string, kioskToken: string): Promise<StockData | null> {
    try {
      let query = supabase
        .from('inventory_cache')
        .select('*');
      
      if (productId) {
        query = query.eq('product_id', productId);
      } else if (kioskToken) {
        query = query.eq('kiosk_token', kioskToken);
      } else {
        return null;
      }
      
      const { data, error } = await query.single();
      
      if (error || !data) {
        return null;
      }
      
      // Get product name from products table if not in cache
      let productName = "Unknown Product";
      if (productId) {
        const { data: product } = await supabase
          .from('products')
          .select('name')
          .eq('id', productId)
          .single();
          
        if (product) {
          productName = product.name;
        }
      }
      
      return {
        kiosk_token: data.kiosk_token,
        name: productName,
        stock_quantity: data.stock_quantity,
        price: data.price || 0,
        cached: true,
        emergency: true,
        last_checked: data.last_checked_at ? new Date(data.last_checked_at) : new Date()
      };
    } catch (error) {
      console.error("Error in getStockFromDatabase:", error);
      return null;
    }
  }
}

export const stockApi = new StockApi();
