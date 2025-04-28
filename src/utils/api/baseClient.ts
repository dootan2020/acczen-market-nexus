
import { supabase } from '@/integrations/supabase/client';
import { ProxyType } from '@/utils/corsProxy';
import { API_CONFIG } from './config';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

// Luôn sử dụng AllOrigins làm proxy mặc định
const ALLORIGINS_PROXY = "https://api.allorigins.win/raw?url=";

export class BaseApiClient {
  // Cache lưu trữ tạm thời kết quả API
  private static memoryCache: Map<string, { data: any; expiry: number }> = new Map();
  
  /**
   * Lấy dữ liệu từ cache hoặc gọi API nếu cache hết hạn
   */
  protected async callApiWithCache(
    endpoint: string, 
    params: Record<string, string | number>, 
    cacheOptions: { 
      enabled: boolean; 
      ttl?: number; // Time to live in ms
    } = { enabled: true, ttl: 60000 } // Default 1 phút
  ): Promise<any> {
    // Tạo cache key
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    
    // Kiểm tra cache nếu bật
    if (cacheOptions.enabled) {
      const cachedItem = BaseApiClient.memoryCache.get(cacheKey);
      const now = Date.now();
      
      if (cachedItem && cachedItem.expiry > now) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[TaphoaMMO API] Cache hit for ${endpoint}`);
        }
        return cachedItem.data;
      }
    }
    
    // Gọi API vì không có cache hoặc cache đã hết hạn
    const result = await this.callApi(endpoint, params);
    
    // Lưu kết quả vào cache
    if (cacheOptions.enabled) {
      const ttl = cacheOptions.ttl || 60000; // Default 1 phút
      BaseApiClient.memoryCache.set(cacheKey, {
        data: result,
        expiry: Date.now() + ttl
      });
    }
    
    return result;
  }

  /**
   * Kiểm tra cache DB trước khi gọi API
   */
  protected async checkDatabaseCache(kioskToken: string): Promise<{
    cached: boolean;
    data?: {
      stock_quantity: number;
      price: number;
      name?: string;
    };
    cacheId?: string;
  }> {
    try {
      // Kiểm tra cache trong database
      const { data: cache } = await supabase
        .from('inventory_cache')
        .select('*')
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (cache && new Date(cache.cached_until) > new Date()) {
        return {
          cached: true,
          data: {
            stock_quantity: cache.stock_quantity,
            price: cache.price,
            name: cache.name
          },
          cacheId: cache.id
        };
      }
      
      return { cached: false };
    } catch (error) {
      console.warn('Error checking database cache:', error);
      return { cached: false };
    }
  }

  /**
   * Core API call method
   */
  protected async callApi(endpoint: string, params: Record<string, string | number>): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TaphoaMMO API] Calling ${endpoint} with params:`, params);
      }
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      // Construct API URL with AllOrigins proxy
      const apiUrl = `${API_CONFIG.baseUrl}/${endpoint}?${queryParams.toString()}`;
      const proxyUrl = ALLORIGINS_PROXY + encodeURIComponent(apiUrl);
      
      // Add timeout to avoid hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": API_CONFIG.userAgent,
          "Accept": "application/json"
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      // Đặc biệt xử lý "Order in processing!" như một phản hồi hợp lệ
      if (data.success === "false") {
        if (data.description === "Order in processing!" || 
            data.message === "Order in processing!") {
          return data; // Trả về kết quả nguyên trạng cho các đơn hàng đang xử lý
        }
        
        if (data.message === "Kiosk is pending!" || 
            data.description === "Kiosk is pending!" ||
            data.message?.includes("pending") ||
            data.description?.includes("pending")) {
          throw new TaphoammoError(
            "Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.",
            TaphoammoErrorCodes.KIOSK_PENDING
          );
        }
        
        throw new Error(data.message || data.description || 'API returned an error');
      }
      
      return data;
    } catch (error: any) {
      console.error(`[TaphoaMMO API] Error in ${endpoint}:`, error);
      
      // Cập nhật circuit breaker nếu có lỗi
      try {
        await this.recordApiFailure(error);
      } catch (circuitError) {
        console.error('Error updating circuit breaker:', circuitError);
      }
      
      throw error;
    }
  }
  
  /**
   * Ghi nhận lỗi API vào circuit breaker
   */
  private async recordApiFailure(error: Error): Promise<void> {
    try {
      const { data: apiHealth } = await supabase
        .from('api_health')
        .select('*')
        .eq('api_name', 'taphoammo')
        .single();
      
      if (!apiHealth) {
        return;
      }
      
      const newErrorCount = apiHealth.error_count + 1;
      const shouldOpen = newErrorCount >= 3; // Ngưỡng để mở circuit breaker
      
      await supabase
        .from('api_health')
        .update({
          error_count: newErrorCount,
          last_error: error.message,
          is_open: shouldOpen,
          opened_at: shouldOpen ? new Date().toISOString() : apiHealth.opened_at
        })
        .eq('api_name', 'taphoammo');
    } catch (err) {
      console.error('Failed to update circuit breaker:', err);
    }
  }
}
