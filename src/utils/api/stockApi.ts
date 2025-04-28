
import { BaseApiClient } from './baseClient';
import { SYSTEM_TOKEN, StockResponse, TaphoammoProduct } from './config';
import { DatabaseCache } from './cache/DatabaseCache';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

export class StockApi extends BaseApiClient {
  async getStock(
    kioskToken: string,
    userToken: string = SYSTEM_TOKEN
  ): Promise<StockResponse> {
    try {
      // Use Edge Function instead of direct API call
      const { data, error } = await this.callEdgeFunction('taphoammo-api', {
        endpoint: 'getStock',
        kioskToken,
        userToken: SYSTEM_TOKEN // Always use system token
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('[TaphoaMMO API] Error fetching stock:', error);
      throw error;
    }
  }

  async getStockWithCache(
    kioskToken: string, 
    options: { 
      forceFresh?: boolean; 
      proxyType?: 'direct' | 'corsproxy.io' | 'admin';
    } = {}
  ): Promise<TaphoammoProduct> {
    let cachedData = null;
    
    // Kiểm tra cache trước khi gọi API nếu không yêu cầu dữ liệu mới
    if (!options.forceFresh) {
      try {
        const { cached, data, cacheId } = await this.checkDatabaseCache(kioskToken);
        if (cached && data) {
          console.log('[TaphoaMMO API] Using cached data:', data);
          return {
            ...data,
            cached: true,
            cacheId
          };
        }
      } catch (cacheError) {
        console.warn('[TaphoaMMO API] Cache check failed:', cacheError);
        // Continue to API call if cache check fails
      }
    }
    
    try {
      // Gọi API để lấy dữ liệu mới
      const stockInfo = await this.getStock(kioskToken);
      
      // Cập nhật cache với dữ liệu mới
      await DatabaseCache.set(kioskToken, {
        stock_quantity: stockInfo.stock_quantity,
        price: stockInfo.price,
        name: stockInfo.name
      });
      
      return {
        stock_quantity: stockInfo.stock_quantity,
        price: stockInfo.price,
        name: stockInfo.name,
        cached: false
      };
      
    } catch (error: any) {
      // Nếu API fails, thử dùng cache nếu có
      if (!options.forceFresh) {
        try {
          const { cached, data } = await this.checkDatabaseCache(kioskToken);
          if (cached && data) {
            console.log('[TaphoaMMO API] API call failed, using cached data as fallback');
            return {
              ...data,
              cached: true,
              emergency: true
            };
          }
        } catch (secondaryCacheError) {
          // Bỏ qua lỗi kiểm tra cache
        }
      }
      
      // Nếu không có dữ liệu cache hoặc cache check cũng lỗi, ném ra lỗi gốc
      if (error instanceof TaphoammoError) {
        throw error;
      } else {
        throw new TaphoammoError(
          error.message || "Could not get stock information",
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
          0,
          0
        );
      }
    }
  }
}

export const stockApi = new StockApi();
