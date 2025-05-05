
import { useApiCommon } from './useApiCommon';
import { toast } from 'sonner';  
import { supabase } from '@/integrations/supabase/client';
import { TaphoammoIntegration } from '@/services/taphoammo/TaphoammoIntegration';
import { TaphoammoProduct } from '@/services/taphoammo/TaphoammoProductService';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import type { ProxyType } from '@/utils/corsProxy';

// Create a singleton instance of TaphoammoIntegration
const taphoammoIntegration = new TaphoammoIntegration();

// Interface for cached stock information
export interface StockCacheInfo {
  kiosk_token: string;
  name?: string;
  stock_quantity: number;
  price: number;
  cached: boolean;
  cacheId: string;
  emergency?: boolean;
}

export const useStockOperations = () => {
  const { loading, setLoading, error, setError, retry, withRetry, usingCache } = useApiCommon();

  // Get stock cache from database or memory
  const checkStockCache = async (kioskToken: string): Promise<{
    cached: boolean;
    data?: StockCacheInfo;
  }> => {
    try {
      // Check database for cached stock info
      const { data, error } = await supabase
        .from('inventory_cache')
        .select('*')
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (error || !data) {
        return { cached: false };
      }
      
      // Check if cache is still valid
      const now = new Date();
      const cacheUntil = new Date(data.cached_until);
      
      if (now > cacheUntil) {
        return { cached: false };
      }
      
      // Return cached data
      return {
        cached: true,
        data: {
          kiosk_token: data.kiosk_token,
          name: data.name || 'Unknown Product',
          stock_quantity: data.stock_quantity,
          price: data.price,
          cached: true,
          cacheId: data.id,
          emergency: false
        }
      };
    } catch (err) {
      console.error('Error checking stock cache:', err);
      return { cached: false };
    }
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
      const { data, error } = await supabase.functions.invoke('sync-stock', {
        body: {
          product_id: productId,
          kiosk_token: kioskToken
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

  // Check if stock is available for purchase
  const checkStockAvailability = async (
    quantity = 1, 
    kioskToken: string
  ): Promise<{
    available: boolean;
    message?: string;
    stockData?: StockCacheInfo;
    cached?: boolean;
  }> => {
    try {
      // First check cache
      const { cached, data: cachedData } = await checkStockCache(kioskToken);
      
      let stockInfo: StockCacheInfo;
      
      if (cached && cachedData) {
        stockInfo = cachedData;
      } else {
        try {
          // Use withRetry to get stock with error handling
          const apiStock = await withRetry(
            async () => taphoammoIntegration.getStock(kioskToken, { forceRefresh: true }),
            'getStock',
            async () => {
              // Fallback to old cache if available
              const { data } = await supabase
                .from('inventory_cache')
                .select('*')
                .eq('kiosk_token', kioskToken)
                .single();
              
              if (!data) throw new Error('No cache available');
              
              return {
                kiosk_token: kioskToken,
                name: data.name || 'Unknown Product',
                stock_quantity: data.stock_quantity,
                price: data.price,
                cached: true,
                emergency: true
              } as TaphoammoProduct;
            }
          );
          
          // Convert TaphoammoProduct to StockCacheInfo
          stockInfo = {
            kiosk_token: kioskToken,
            name: apiStock.name,
            stock_quantity: apiStock.stock_quantity,
            price: apiStock.price || 0,
            cached: apiStock.cached || false,
            cacheId: '',
            emergency: apiStock.emergency || false
          };
          
          // Update cache in database
          if (!apiStock.cached && !apiStock.emergency) {
            await supabase
              .from('inventory_cache')
              .upsert({
                kiosk_token: kioskToken,
                stock_quantity: apiStock.stock_quantity,
                price: apiStock.price || 0,
                name: apiStock.name || 'Unknown Product',
                last_checked_at: new Date().toISOString(),
                cached_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
                last_sync_status: 'success'
              }, {
                onConflict: 'kiosk_token'
              });
          }
          
        } catch (apiError) {
          if (cachedData) {
            console.warn('Using expired cache due to API error:', apiError);
            stockInfo = {
              ...cachedData,
              emergency: true
            };
            toast.warning("Using cached data due to API connectivity issues", {
              duration: 5000
            });
          } else {
            throw apiError;
          }
        }
      }
      
      if (!stockInfo || stockInfo.stock_quantity < quantity) {
        return {
          available: false,
          message: "Insufficient stock for requested quantity",
          stockData: stockInfo,
          cached: stockInfo?.cached
        };
      }
      
      return {
        available: true,
        stockData: stockInfo,
        cached: stockInfo.cached
      };
      
    } catch (err) {
      console.error("Stock check error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to check stock";
      
      // Show user-friendly message for common errors
      if (err instanceof TaphoammoError) {
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
    }
  };

  // Get stock information
  const getStock = async (
    kioskToken: string,
    options: {
      forceFresh?: boolean;
      proxyType?: ProxyType;
    } = {}
  ): Promise<TaphoammoProduct> => {
    setLoading(true);
    setError(null);

    try {
      // Use withRetry to get stock with error handling
      const data = await withRetry(
        async () => taphoammoIntegration.getStock(kioskToken, options),
        'getStock',
        async () => {
          // Fallback to cache if available
          const { data } = await supabase
            .from('inventory_cache')
            .select('*')
            .eq('kiosk_token', kioskToken)
            .single();
          
          if (!data) throw new Error('No cache available');
          
          return {
            kiosk_token: kioskToken,
            name: data.name || 'Unknown Product',
            stock_quantity: data.stock_quantity,
            price: data.price,
            cached: true,
            emergency: true
          } as TaphoammoProduct;
        }
      );

      return data;
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
    loading,
    error,
    retry,
    usingCache
  };
};
