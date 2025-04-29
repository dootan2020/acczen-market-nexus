
import { useState } from 'react';
import { taphoammoApiService } from '@/services/taphoammo';
import { TaphoammoProduct, TaphoammoApiOptions } from '@/services/taphoammo';
import { TaphoammoError } from '@/types/taphoammo-errors';
import { toast } from 'sonner';
import { ProxyType } from '@/utils/corsProxy';

export interface UseTaphoammoOptions {
  autoRetry?: boolean;
  useCache?: boolean;
  showToasts?: boolean;
}

export const useTaphoammoAPI = (options: UseTaphoammoOptions = {}) => {
  const { 
    autoRetry = true,
    useCache = true,
    showToasts = true
  } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Get stock information for a kiosk token
   */
  const getStock = async (
    kioskToken: string, 
    forceFresh: boolean = false, 
    proxyType: ProxyType = 'allorigins'
  ): Promise<TaphoammoProduct> => {
    setLoading(true);
    setError(null);
    
    try {
      const apiOptions: TaphoammoApiOptions = {
        proxyType,
        forceRefresh: forceFresh,
        useCache
      };
      
      const result = await taphoammoApiService.getStock(kioskToken, apiOptions);
      return result;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      
      if (showToasts) {
        toast.error('Lỗi lấy dữ liệu sản phẩm', {
          description: errorMsg,
          duration: 5000
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Check if stock is available for purchase
   */
  const checkStockAvailability = async (
    kioskToken: string, 
    quantity: number = 1, 
    proxyType: ProxyType = 'allorigins'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      return await taphoammoApiService.checkStockAvailability(kioskToken, quantity, proxyType);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      
      // Return an error object
      return {
        available: false,
        message: "Không thể kiểm tra tồn kho: " + errorMsg
      };
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Buy products from the API
   */
  const buyProducts = async (
    kioskToken: string,
    quantity: number = 1,
    userToken: string = 'system',
    promotion?: string,
    proxyType: ProxyType = 'allorigins'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // First check availability to prevent failed purchases
      const { available, message } = await checkStockAvailability(kioskToken, quantity, proxyType);
      
      if (!available) {
        if (showToasts) {
          toast.error('Không thể mua sản phẩm', {
            description: message,
            duration: 5000
          });
        }
        throw new Error(message);
      }
      
      return await taphoammoApiService.buyProducts(kioskToken, quantity, userToken, promotion, proxyType);
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      
      if (showToasts) {
        toast.error('Lỗi mua hàng', {
          description: errorMsg,
          duration: 5000
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get products from an order
   */
  const getProducts = async (
    orderId: string, 
    userToken: string = 'system',
    proxyType: ProxyType = 'allorigins'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      return await taphoammoApiService.getProducts(orderId, userToken, proxyType);
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      
      if (showToasts) {
        toast.error('Lỗi lấy thông tin sản phẩm', {
          description: errorMsg,
          duration: 5000
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Test the connection to the API
   */
  const testConnection = async (
    kioskToken: string, 
    proxyType: ProxyType = 'allorigins'
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      return await taphoammoApiService.testConnection(kioskToken, proxyType);
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      
      return {
        success: false,
        message: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Clear cache
   */
  const clearCache = () => {
    taphoammoApiService.clearCache();
  };
  
  return {
    getStock,
    checkStockAvailability,
    buyProducts,
    getProducts,
    testConnection,
    clearCache,
    loading,
    error
  };
};
