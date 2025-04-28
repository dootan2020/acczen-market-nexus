
import { useState } from 'react';
import { taphoammoApiService, TaphoammoProduct } from '@/services/TaphoammoApiService';
import { TaphoammoError } from '@/types/taphoammo-errors';
import { toast } from 'sonner';

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
  const getStock = async (kioskToken: string, forceFresh: boolean = false): Promise<TaphoammoProduct> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await taphoammoApiService.getStock(kioskToken, {
        forceRefresh: forceFresh,
        useCache: useCache
      });
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
  const checkStockAvailability = async (kioskToken: string, quantity: number = 1): Promise<{
    available: boolean;
    message?: string;
    stockData?: TaphoammoProduct;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if kiosk is active at all
      const isActive = await taphoammoApiService.checkKioskActive(kioskToken);
      if (!isActive) {
        return {
          available: false,
          message: "Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác."
        };
      }
      
      // Then get stock data to check quantity
      const stockData = await taphoammoApiService.getStock(kioskToken);
      
      const available = stockData.stock_quantity >= quantity;
      
      return {
        available,
        message: available ? 
          `Sản phẩm sẵn có (${stockData.stock_quantity} sản phẩm)` : 
          `Không đủ số lượng trong kho (yêu cầu: ${quantity}, có sẵn: ${stockData.stock_quantity})`,
        stockData
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      
      if (err instanceof TaphoammoError) {
        return {
          available: false,
          message: err.message
        };
      }
      
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
    promotion?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // First check availability to prevent failed purchases
      const { available, message } = await checkStockAvailability(kioskToken, quantity);
      
      if (!available) {
        if (showToasts) {
          toast.error('Không thể mua sản phẩm', {
            description: message,
            duration: 5000
          });
        }
        throw new Error(message);
      }
      
      return await taphoammoApiService.buyProducts(kioskToken, quantity, userToken, promotion);
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
  const getProducts = async (orderId: string, userToken: string = 'system') => {
    setLoading(true);
    setError(null);
    
    try {
      return await taphoammoApiService.getProducts(orderId, userToken);
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
  const testConnection = async (kioskToken: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const stockData = await taphoammoApiService.getStock(kioskToken);
      return {
        success: true,
        message: `Kết nối thành công - Sản phẩm: ${stockData.name} (Số lượng: ${stockData.stock_quantity})`
      };
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
  
  return {
    getStock,
    checkStockAvailability,
    buyProducts,
    getProducts,
    testConnection,
    loading,
    error
  };
};
