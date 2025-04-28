
import { BaseApiClient } from './baseClient';
import { SYSTEM_TOKEN, StockResponse } from './config';
import { DatabaseCache } from './cache/DatabaseCache';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { TaphoammoProduct } from '@/types/products';

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
    
    // Check cache before calling API if fresh data not required
    if (!options.forceFresh) {
      try {
        const cacheResult = await DatabaseCache.get(kioskToken);
        if (cacheResult.cached && cacheResult.data) {
          console.log('[TaphoaMMO API] Using cached data:', cacheResult.data);
          const product: TaphoammoProduct = {
            kiosk_token: kioskToken,
            stock_quantity: cacheResult.data.stock_quantity,
            price: cacheResult.data.price,
            name: cacheResult.data.name,
            cached: true,
            cacheId: cacheResult.data.cacheId
          };
          return product;
        }
      } catch (cacheError) {
        console.warn('[TaphoaMMO API] Cache check failed:', cacheError);
        // Continue to API call if cache check fails
      }
    }
    
    try {
      // Call API to get fresh data
      const stockInfo = await this.getStock(kioskToken);
      
      // Update cache with new data
      await DatabaseCache.set(kioskToken, {
        stock_quantity: stockInfo.stock_quantity,
        price: stockInfo.price,
        name: stockInfo.name
      });
      
      // Create a properly typed TaphoammoProduct object
      const product: TaphoammoProduct = {
        kiosk_token: kioskToken,
        stock_quantity: stockInfo.stock_quantity,
        price: stockInfo.price,
        name: stockInfo.name,
        cached: false
      };
      
      return product;
      
    } catch (error: any) {
      // If API fails, try to use cache if available
      if (!options.forceFresh) {
        try {
          const cacheResult = await DatabaseCache.get(kioskToken);
          if (cacheResult.cached && cacheResult.data) {
            console.log('[TaphoaMMO API] API call failed, using cached data as fallback');
            const emergencyProduct: TaphoammoProduct = {
              kiosk_token: kioskToken,
              stock_quantity: cacheResult.data.stock_quantity,
              price: cacheResult.data.price,
              name: cacheResult.data.name,
              cached: true,
              emergency: true
            };
            return emergencyProduct;
          }
        } catch (secondaryCacheError) {
          // Ignore secondary cache check errors
        }
      }
      
      // If no cache data or cache check fails, throw original error
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
