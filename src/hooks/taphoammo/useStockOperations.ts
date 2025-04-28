
import { useApiCommon } from './useApiCommon';
import { taphoammoApi } from '@/utils/api/taphoammoApi';
import type { TaphoammoProduct } from '@/types/products';

export const useStockOperations = () => {
  const { loading, setLoading, error, setError, retry, withRetry } = useApiCommon();

  const checkStockAvailability = async (quantity = 1, kioskToken: string): Promise<{
    available: boolean;
    message?: string;
    stockData?: TaphoammoProduct;
  }> => {
    try {
      const stockInfo = await taphoammoApi.stock.getStock(kioskToken);
      
      if (!stockInfo || stockInfo.stock_quantity < quantity) {
        return {
          available: false,
          message: "Product is not available in the requested quantity"
        };
      }
      
      return {
        available: true,
        stockData: stockInfo
      };
      
    } catch (err) {
      console.error("Stock check error:", err);
      return {
        available: false,
        message: err instanceof Error ? err.message : "Failed to check stock availability"
      };
    }
  };

  const getStock = async (
    kioskToken: string,
    proxyType: 'direct' | 'corsproxy.io' | 'admin'
  ): Promise<TaphoammoProduct> => {
    setLoading(true);
    setError(null);

    try {
      const data = await withRetry(async () => {
        return await taphoammoApi.stock.getStock(kioskToken);
      });

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
    loading,
    error,
    retry
  };
};
