
import { useState, useEffect, useCallback } from 'react';
import { useApiCommon } from './useApiCommon';
import { taphoammoApi } from '@/utils/api/taphoammoApi';
import type { TaphoammoProduct } from '@/types/products';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StockCacheInfo extends TaphoammoProduct {
  cached?: boolean;
  cacheUpdatedAt?: Date;
  cacheExpiresAt?: Date;
}

export const useStockOperations = () => {
  const { loading, setLoading, error, setError, retry, withRetry } = useApiCommon();
  const [cacheInfo, setCacheInfo] = useState<{
    lastChecked?: Date;
    expiresAt?: Date;
    isCached?: boolean;
  }>({});

  /**
   * Kiểm tra tồn kho và giá với hỗ trợ cache
   */
  const checkStockAvailability = async (quantity = 1, kioskToken: string): Promise<{
    available: boolean;
    message?: string;
    stockData?: StockCacheInfo;
    cached?: boolean;
  }> => {
    try {
      // Kiểm tra cache
      const { data: cacheData } = await supabase
        .from('inventory_cache')
        .select('*')
        .eq('kiosk_token', kioskToken)
        .single();

      let stockInfo: StockCacheInfo;
      
      // Nếu có cache và chưa hết hạn
      if (cacheData && new Date(cacheData.cached_until) > new Date()) {
        stockInfo = {
          kiosk_token: kioskToken,
          name: cacheData.name || 'Sản phẩm',
          stock_quantity: cacheData.stock_quantity,
          price: cacheData.price,
          cached: true,
          cacheUpdatedAt: new Date(cacheData.last_checked_at),
          cacheExpiresAt: new Date(cacheData.cached_until)
        };
        
        setCacheInfo({
          lastChecked: new Date(cacheData.last_checked_at),
          expiresAt: new Date(cacheData.cached_until),
          isCached: true
        });
      } else {
        // Không có cache hoặc cache hết hạn, gọi API
        try {
          stockInfo = await taphoammoApi.stock.getStockWithCache(kioskToken, {
            forceFresh: true
          });
          
          setCacheInfo({
            lastChecked: new Date(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
            isCached: false
          });
        } catch (apiError) {
          // Nếu có lỗi và có cache cũ, sử dụng cache cũ
          if (cacheData) {
            console.warn('Using expired cache due to API error');
            
            stockInfo = {
              kiosk_token: kioskToken,
              name: cacheData.name || 'Sản phẩm (cache)',
              stock_quantity: cacheData.stock_quantity,
              price: cacheData.price,
              cached: true,
              cacheUpdatedAt: new Date(cacheData.last_checked_at),
              cacheExpiresAt: new Date(cacheData.cached_until)
            };
            
            toast.warning("Đang sử dụng dữ liệu cache do không thể kết nối với server", {
              duration: 5000
            });
            
            setCacheInfo({
              lastChecked: new Date(cacheData.last_checked_at),
              expiresAt: new Date(cacheData.cached_until),
              isCached: true
            });
          } else {
            throw apiError;
          }
        }
      }
      
      // Kiểm tra số lượng tồn kho
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

  /**
   * Lấy thông tin tồn kho với retry logic
   */
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
        return await taphoammoApi.stock.getStockWithCache(kioskToken, {
          forceFresh: options.forceFresh,
          proxyType: options.proxyType
        });
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

  /**
   * Đồng bộ tồn kho cho một sản phẩm cụ thể
   */
  const syncProductStock = async (kioskToken: string): Promise<{
    success: boolean;
    message?: string;
    stockData?: TaphoammoProduct;
    oldQuantity?: number;
    newQuantity?: number;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: JSON.stringify({
          kioskToken,
          syncType: 'manual'
        })
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Đồng bộ thất bại');
      }
      
      const stockData: TaphoammoProduct = {
        kiosk_token: kioskToken,
        name: data.name,
        stock_quantity: data.new_quantity,
        price: data.new_price
      };
      
      setCacheInfo({
        lastChecked: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
        isCached: false
      });
      
      return {
        success: true,
        message: `Đồng bộ thành công. Tồn kho: ${data.old_quantity} → ${data.new_quantity}`,
        stockData,
        oldQuantity: data.old_quantity,
        newQuantity: data.new_quantity
      };
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in syncProductStock:', errorMsg);
      setError(errorMsg);
      
      return {
        success: false,
        message: `Lỗi đồng bộ: ${errorMsg}`
      };
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
