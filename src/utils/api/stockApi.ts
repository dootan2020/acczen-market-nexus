
import { BaseApiClient } from './baseClient';
import { SYSTEM_TOKEN, StockInfo } from './config';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { supabase } from '@/integrations/supabase/client';

export class StockApi extends BaseApiClient {
  /**
   * Kiểm tra cache trước khi gọi API
   */
  async getStockWithCache(
    kioskToken: string, 
    options: {
      forceFresh?: boolean;
      cacheTime?: number; // ms
      proxyType?: 'direct' | 'corsproxy.io' | 'admin';
    } = {}
  ): Promise<StockInfo> {
    try {
      // Kiểm tra circuit breaker
      const { data: apiHealth } = await supabase
        .from('api_health')
        .select('*')
        .eq('api_name', 'taphoammo')
        .single();
      
      if (apiHealth?.is_open && !options.forceFresh) {
        const { data: cache } = await supabase
          .from('inventory_cache')
          .select('*')
          .eq('kiosk_token', kioskToken)
          .single();
          
        if (cache) {
          return {
            kiosk_token: kioskToken,
            name: cache.name || 'Sản phẩm',
            stock_quantity: cache.stock_quantity,
            price: cache.price,
            cached: true,
            last_checked_at: cache.last_checked_at
          };
        }
        
        throw new TaphoammoError(
          "Dịch vụ tạm thời không khả dụng, vui lòng thử lại sau.",
          TaphoammoErrorCodes.API_TEMP_DOWN
        );
      }
      
      // Nếu không bắt buộc refresh, kiểm tra cache trước
      if (!options.forceFresh) {
        const dbCache = await this.checkDatabaseCache(kioskToken);
        
        if (dbCache.cached && dbCache.data) {
          return {
            kiosk_token: kioskToken,
            name: dbCache.data.name || 'Sản phẩm',
            stock_quantity: dbCache.data.stock_quantity,
            price: dbCache.data.price,
            cached: true
          };
        }
      }
      
      // Gọi API với in-memory cache nếu không bắt buộc refresh
      const cacheTime = options.forceFresh ? 0 : (options.cacheTime || 60000); // 1 phút mặc định
      
      const data = await this.callApiWithCache(
        'getStock',
        { kioskToken, userToken: SYSTEM_TOKEN },
        { enabled: !options.forceFresh, ttl: cacheTime }
      );
      
      const result = {
        kiosk_token: kioskToken,
        name: data.name || '',
        stock_quantity: data.stock ? parseInt(data.stock) : 0,
        price: data.price ? parseFloat(data.price) : 0,
        cached: false
      };
      
      // Cập nhật cache database
      this.updateStockCache(kioskToken, result).catch(err => {
        console.error("Không thể cập nhật cache:", err);
      });
      
      return result;
    } catch (error) {
      console.error('[TaphoaMMO API] Error getting stock with cache:', error);
      throw error;
    }
  }

  /**
   * Cập nhật cache database
   */
  private async updateStockCache(kioskToken: string, stockInfo: StockInfo): Promise<void> {
    try {
      // Tìm product_id từ kiosk_token
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('kiosk_token', kioskToken)
        .single();
      
      // Tạo cache expiry (15 phút)
      const cacheExpiry = new Date();
      cacheExpiry.setMinutes(cacheExpiry.getMinutes() + 15);
      
      // Kiểm tra xem đã có cache chưa
      const { data: existingCache } = await supabase
        .from('inventory_cache')
        .select('id')
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (existingCache) {
        // Update cache
        await supabase
          .from('inventory_cache')
          .update({
            stock_quantity: stockInfo.stock_quantity,
            price: stockInfo.price,
            name: stockInfo.name,
            last_checked_at: new Date().toISOString(),
            cached_until: cacheExpiry.toISOString(),
            last_sync_status: 'success',
            product_id: product?.id
          })
          .eq('id', existingCache.id);
      } else {
        // Insert new cache
        await supabase
          .from('inventory_cache')
          .insert({
            kiosk_token: kioskToken,
            stock_quantity: stockInfo.stock_quantity,
            price: stockInfo.price,
            name: stockInfo.name,
            cached_until: cacheExpiry.toISOString(),
            product_id: product?.id
          });
      }
    } catch (error) {
      console.error('Error updating stock cache:', error);
    }
  }

  /**
   * Phương thức gốc để tương thích ngược
   */
  async getStock(kioskToken: string): Promise<StockInfo> {
    try {
      // Always use SYSTEM_TOKEN
      const data = await this.callApi('getStock', { 
        kioskToken, 
        userToken: SYSTEM_TOKEN // Luôn sử dụng token cố định
      });
      
      return {
        kiosk_token: kioskToken,
        name: data.name || '',
        stock_quantity: data.stock ? parseInt(data.stock) : 0,
        price: data.price ? parseFloat(data.price) : 0
      };
    } catch (error) {
      console.error('[TaphoaMMO API] Error getting stock:', error);
      throw error;
    }
  }
}

export const stockApi = new StockApi();
