
import { supabase } from '@/integrations/supabase/client';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ApiService, ApiOptions } from './api/ApiService';
import { toast } from 'sonner';
import { ProxyType, markProxySuccess, markProxyFailure } from '@/utils/corsProxy';

// Local cache to prevent duplicate API calls with the same parameters
const apiCache = new Map<string, {
  data: any; 
  timestamp: number;
  expiresAt: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache validity

export interface TaphoammoProduct {
  kiosk_token: string;
  name: string;
  stock_quantity: number;
  price: number;
  description?: string;
  slug?: string;
  sku?: string;
}

export class TaphoammoApiService {
  private apiService: ApiService;
  private apiRequestQueue = new Map<string, Promise<any>>();
  
  constructor() {
    this.apiService = ApiService.getInstance();
  }
  
  /**
   * Generate cache key for API calls
   */
  private generateCacheKey(method: string, params: Record<string, any>): string {
    return `${method}:${JSON.stringify(params)}`;
  }
  
  /**
   * Execute API call with caching, queue management, and retries
   */
  private async executeApiCall<T>(
    method: string, 
    params: Record<string, any>, 
    options: ApiOptions = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(method, params);
    
    // Check options for cache behavior
    const useCache = options.useCache !== false;
    const forceRefresh = options.forceRefresh === true;
    const proxyType = options.proxyType || 'allorigins'; // Default to allorigins
    
    // Check if we should use cached data
    if (useCache && !forceRefresh) {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData && cachedData.expiresAt > Date.now()) {
        console.log(`[TaphoammoApiService] Using cached data for ${method}`, { cached: true });
        return cachedData.data;
      }
    }
    
    // Check if there's already a request in progress for this operation
    // This prevents duplicate simultaneous requests
    if (this.apiRequestQueue.has(cacheKey)) {
      console.log(`[TaphoammoApiService] Reusing in-flight request for ${method}`);
      return this.apiRequestQueue.get(cacheKey)!;
    }
    
    // Create a new request promise
    const requestPromise = new Promise<T>(async (resolve, reject) => {
      try {
        const { data, error } = await supabase.functions.invoke('taphoammo-api', {
          body: { 
            ...params,
            proxy_type: proxyType, // Add proxy type to the request
            action: method 
          }
        });
        
        if (error) {
          console.error(`[TaphoammoApiService] Error in ${method}:`, error);
          markProxyFailure(proxyType as ProxyType);
          throw new TaphoammoError(
            error.message || 'API request failed',
            TaphoammoErrorCodes.NETWORK_ERROR,
            0,
            0
          );
        }
        
        // FIXED: Changed string check "false" to boolean check false
        if (data && data.success === false) {
          console.error(`[TaphoammoApiService] ${method} returned failure:`, data.message);
          markProxyFailure(proxyType as ProxyType);
          throw new TaphoammoError(
            data.message || 'Unknown API error',
            TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
            0,
            0
          );
        }
        
        // Validate response data
        this.validateResponse(method, data);
        
        // Cache the result
        if (useCache) {
          apiCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + CACHE_TTL
          });
        }
        
        // Mark proxy as successful
        markProxySuccess(proxyType as ProxyType);
        
        resolve(data as T);
      } catch (error) {
        reject(error);
      } finally {
        // Remove from queue once completed
        setTimeout(() => {
          this.apiRequestQueue.delete(cacheKey);
        }, 0);
      }
    });
    
    // Add to queue
    this.apiRequestQueue.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * Validate API response
   */
  private validateResponse(method: string, data: any): void {
    if (!data) {
      throw new TaphoammoError(
        'Không nhận được dữ liệu từ API',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        0,
        0
      );
    }
    
    // Method-specific validations
    if (method === 'get_product' && !data.product) {
      throw new TaphoammoError(
        'Không tìm thấy thông tin sản phẩm trong phản hồi API',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        0,
        0
      );
    }
  }
  
  /**
   * Get stock information for a product
   */
  public async getStock(
    kioskToken: string, 
    options: ApiOptions = {}
  ): Promise<TaphoammoProduct> {
    try {
      const data = await this.executeApiCall<any>(
        'get_product', 
        { 
          kiosk_token: kioskToken,
          debug_mock: options.useMockData ? 'true' : 'false' // Add debug mode flag
        },
        options
      );
      
      if (!data.product) {
        throw new TaphoammoError(
          'Không nhận được thông tin sản phẩm từ API',
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
          0,
          0
        );
      }
      
      // Log API call to database
      await this.logApiCall('getStock', {
        kioskToken,
        result: {
          cached: !!data.source && data.source === 'mock',
          name: data.product.name,
          stock: data.product.stock_quantity,
          source: data.source || 'api'
        }
      });
      
      return data.product;
    } catch (error) {
      console.error('[TaphoammoApiService] getStock error:', error);
      
      // Rethrow as TaphoammoError if it isn't one already
      if (!(error instanceof TaphoammoError)) {
        throw new TaphoammoError(
          error instanceof Error ? error.message : 'Unknown error getting stock',
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
          0,
          0
        );
      }
      
      throw error;
    }
  }
  
  /**
   * Check if kiosk is active and available
   */
  public async checkKioskActive(kioskToken: string, proxyType: ProxyType = 'allorigins'): Promise<boolean> {
    try {
      const stockInfo = await this.getStock(kioskToken, {
        forceRefresh: true, // Always get fresh data for active check
        proxyType: proxyType
      });
      
      // Check quantity and ensure kiosk is operational
      if (!stockInfo || stockInfo.stock_quantity <= 0) {
        return false;
      }
      return true;
    } catch (err: any) {
      // Check if error is due to kiosk unavailability
      if (err instanceof TaphoammoError) {
        if (err.code === TaphoammoErrorCodes.API_TEMP_DOWN || 
            err.code === TaphoammoErrorCodes.KIOSK_PENDING) {
          return false;
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      // Check if error is related to pending kiosk
      if (errorMessage.includes('Kiosk is pending') || 
          errorMessage.includes('tạm thời không khả dụng') ||
          errorMessage.includes('pending')) {
        return false;
      }
      
      console.error("Lỗi kiểm tra kiosk:", err);
      throw err;
    }
  }
  
  /**
   * Buy products from the API
   */
  public async buyProducts(
    kioskToken: string, 
    quantity: number = 1, 
    userToken: string = 'system',
    promotion?: string,
    proxyType: ProxyType = 'allorigins'
  ): Promise<any> {
    const { data, error } = await this.apiService.callTaphoammoAPI(
      'buyProducts', 
      { 
        kioskToken, 
        userToken, 
        quantity,
        promotion,
        proxy_type: proxyType
      },
      {
        useCache: false, // Never cache purchase requests
        maxRetries: 1 // Lower retry count for purchases to avoid duplicate orders
      }
    );
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new TaphoammoError(
        'Không nhận được dữ liệu từ API',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        0,
        0
      );
    }
    
    // Fix: Add type assertion to data
    const responseData = data as { order_id?: string };
    
    this.logApiCall('buyProducts', {
      kioskToken,
      quantity,
      order_id: responseData.order_id
    });
    
    return data;
  }
  
  /**
   * Get products information from an order
   */
  public async getProducts(
    orderId: string, 
    userToken: string = 'system',
    proxyType: ProxyType = 'allorigins'
  ): Promise<any> {
    const { data, error } = await this.apiService.callTaphoammoAPI(
      'getProducts', 
      { 
        orderId,
        userToken,
        proxy_type: proxyType
      }
    );
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new TaphoammoError(
        'Không nhận được dữ liệu từ API',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        0,
        0
      );
    }
    
    this.logApiCall('getProducts', {
      orderId,
      result: data
    });
    
    return data;
  }

  /**
   * Test connection to the API
   */
  public async testConnection(kioskToken: string, proxyType: ProxyType = 'allorigins'): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: 'test_connection',
          kiosk_token: kioskToken,
          proxy_type: proxyType
        }
      });

      if (response.error) {
        markProxyFailure(proxyType);
        return {
          success: false,
          message: `Lỗi kết nối API: ${response.error.message}`
        };
      }

      markProxySuccess(proxyType);
      return response.data;
    } catch (err) {
      console.error('Test connection error:', err);
      markProxyFailure(proxyType);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Lỗi không xác định khi kiểm tra kết nối'
      };
    }
  }
  
  /**
   * Clear API cache
   */
  public clearCache(): void {
    apiCache.clear();
    toast.success('Đã xóa cache API thành công');
  }
  
  /**
   * Log API calls to the database for monitoring and debugging
   */
  private async logApiCall(endpoint: string, details: any): Promise<void> {
    try {
      await supabase.from('api_logs').insert({
        api: 'taphoammo',
        endpoint,
        status: 'success',
        details
      });
    } catch (err) {
      console.error('Error logging API call:', err);
    }
  }
}

// Export singleton instance
export const taphoammoApiService = new TaphoammoApiService();
