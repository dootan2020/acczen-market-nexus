
import { supabase } from '@/integrations/supabase/client';
import { CircuitBreaker } from './circuit-breaker';
import { RetryService } from './RetryService';
import { CacheService } from './CacheService';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

export interface ApiOptions {
  useCache?: boolean;
  cacheTTL?: number;
  forceRefresh?: boolean;
  maxRetries?: number;
  retryDelays?: number[];
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
  cached?: boolean;
  responseTime?: number;
  retries?: number;
}

export class ApiService {
  private static instance: ApiService;
  private circuitBreaker: CircuitBreaker;
  private retryService: RetryService;
  private cacheService: CacheService;
  
  private constructor() {
    this.circuitBreaker = new CircuitBreaker();
    this.retryService = new RetryService();
    this.cacheService = new CacheService();
  }

  public static getInstance(): ApiService {
    if (!this.instance) {
      this.instance = new ApiService();
    }
    return this.instance;
  }

  /**
   * Make an API call through the Edge Function with circuit breaking, retry, and caching
   */
  public async call<T>(
    edgeFunctionName: string, 
    params: Record<string, any>, 
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      useCache = true,
      cacheTTL = 60000, // 1 minute default
      forceRefresh = false,
      maxRetries = 3,
      timeout = 30000
    } = options;

    // Generate cache key based on function name and parameters
    const cacheKey = `${edgeFunctionName}:${JSON.stringify(params)}`;
    
    // Check circuit breaker first
    const isCircuitOpen = await this.circuitBreaker.isOpen();
    if (isCircuitOpen) {
      console.log(`Circuit is OPEN for ${edgeFunctionName}, falling back to cache`);
      
      // Try to get from cache if circuit is open
      if (useCache) {
        const cachedData = await this.cacheService.get<T>(cacheKey);
        if (cachedData) {
          return { 
            data: cachedData, 
            error: null,
            cached: true 
          };
        }
      }
      
      // If no cache available, return error
      return {
        data: null,
        error: new TaphoammoError(
          "API tạm thời không khả dụng do trục trặc kết nối. Vui lòng thử lại sau.",
          TaphoammoErrorCodes.API_TEMP_DOWN,
          0,
          0
        ),
        cached: false
      };
    }

    // Check cache first if not forcing refresh
    if (useCache && !forceRefresh) {
      const cachedData = await this.cacheService.get<T>(cacheKey);
      if (cachedData) {
        return { 
          data: cachedData, 
          error: null,
          cached: true 
        };
      }
    }

    // Use retry service to make the actual call
    try {
      const { result, retries, responseTime } = await this.retryService.execute(
        async () => {
          const startTime = Date.now();
          
          const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
            body: JSON.stringify(params)
          });
          
          const callDuration = Date.now() - startTime;
          
          // Check for API-level errors (edge functions return { success: false, message: "..." })
          if (data && typeof data === 'object' && 'success' === false) {
            throw new TaphoammoError(
              data.message || 'API Error',
              data.code || TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
              retries,
              callDuration
            );
          }
          
          if (error) {
            // Map Supabase errors to our error types
            let errorCode = TaphoammoErrorCodes.UNEXPECTED_RESPONSE;
            if (error.message?.includes('timeout')) {
              errorCode = TaphoammoErrorCodes.TIMEOUT;
            } else if (error.message?.includes('network')) {
              errorCode = TaphoammoErrorCodes.NETWORK_ERROR;
            }
            
            throw new TaphoammoError(
              error.message,
              errorCode,
              retries,
              callDuration
            );
          }
          
          return data;
        },
        maxRetries
      );

      // Cache successful result if caching is enabled
      if (useCache && result) {
        await this.cacheService.set(cacheKey, result, cacheTTL);
      }

      // Reset circuit breaker on successful call
      await this.circuitBreaker.reset();

      return { 
        data: result as T, 
        error: null,
        cached: false,
        responseTime,
        retries 
      };
    } catch (error: any) {
      // Record failure in circuit breaker
      await this.circuitBreaker.recordFailure(error);
      
      console.error(`API call to ${edgeFunctionName} failed:`, error);

      // If we have a cache, return it as fallback even after error
      if (useCache) {
        const cachedData = await this.cacheService.get<T>(cacheKey);
        if (cachedData) {
          return { 
            data: cachedData, 
            error: error,
            cached: true 
          };
        }
      }

      // If no cache available, return the error
      return { 
        data: null, 
        error: error instanceof Error ? error : new TaphoammoError(
          String(error),
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
          0,
          0
        ),
        cached: false
      };
    }
  }

  /**
   * Direct call to the TaphoaMMO API, preferred to use through the edge function
   */
  public async callTaphoammoAPI<T>(
    endpoint: string, 
    params: Record<string, any>, 
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return await this.call<T>('taphoammo-api', {
      endpoint,
      ...params
    }, options);
  }

  /**
   * Execute a purchase safely
   */
  public async executePurchase(
    productId: string,
    kioskToken: string,
    quantity: number,
    options: ApiOptions = {}
  ): Promise<ApiResponse> {
    // For purchases, we use lower cache TTL and always validate with fresh data first
    return await this.call('process-taphoammo-order', {
      action: 'buy_product',
      productId,
      kioskToken,
      quantity,
    }, {
      ...options,
      useCache: false, // Never cache purchase requests
      maxRetries: 2, // Lower retry count for purchases to avoid duplicate orders
    });
  }

  /**
   * Check stock for a product
   */
  public async checkStock(
    kioskToken: string,
    quantity = 1,
    options: ApiOptions = {}
  ): Promise<ApiResponse> {
    return await this.call('process-taphoammo-order', {
      action: 'check_stock',
      kioskToken,
      quantity,
    }, {
      ...options,
      cacheTTL: 30000, // Short TTL for stock checks (30 seconds)
    });
  }
}

// Export a singleton instance
export const apiService = ApiService.getInstance();
