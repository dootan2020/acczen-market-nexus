
import { useApiCommon } from './useApiCommon';
import { useStockCache } from './useStockCache';
import { useStockSync } from './useStockSync';
import { toast } from 'sonner';
import { taphoammoApi } from '@/utils/api/taphoammoApi';
import type { TaphoammoProduct } from '@/types/products';
import type { StockCacheInfo } from './useStockCache';

export const useStockOperations = () => {
  const { loading, setLoading, error, setError, retry, withRetry } = useApiCommon();
  const { cacheInfo, checkStockCache } = useStockCache();
  const { syncProductStock } = useStockSync();

  const checkStockAvailability = async (quantity = 1, kioskToken: string): Promise<{
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
          stockInfo = await taphoammoApi.stock.getStockWithCache(kioskToken, {
            forceFresh: true
          });
        } catch (apiError) {
          if (cachedData) {
            console.warn('Using expired cache due to API error');
            stockInfo = cachedData;
            toast.warning("Đang sử dụng dữ liệu cache do không thể kết nối với server", {
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
          message: "Sản phẩm không có đủ số lượng yêu cầu",
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
      return {
        available: false,
        message: err instanceof Error ? err.message : "Không thể kiểm tra tồn kho"
      };
    }
  };

  const getStock = async (
    kioskToken: string,
    options: {
      forceFresh?: boolean;
      proxyType?: 'direct' | 'corsproxy.io' | 'admin';
    } = {}
  ): Promise<TaphoammoProduct> => {
    setLoading(true);
    setError(null);

    try {
      const data = await withRetry(async () => {
        return await taphoammoApi.stock.getStockWithCache(kioskToken, options);
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
    syncProductStock,
    cacheInfo,
    loading,
    error,
    retry
  };
};
