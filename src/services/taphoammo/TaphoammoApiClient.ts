
import { supabase } from '@/integrations/supabase/client';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { TaphoammoApiCache } from './TaphoammoApiCache';
import { TaphoammoResponseValidator } from './TaphoammoResponseValidator';
import { TaphoammoProduct } from './TaphoammoProductService';

export interface TaphoammoApiOptions {
  useMockData?: boolean;
  useCache?: boolean;
  forceRefresh?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface TaphoammoResponse<T = any> {
  data: T;
  source?: 'cache' | 'api' | 'mock' | 'database';
  timestamp?: number;
  responseTime?: number;
}

/**
 * Core API client for Taphoammo API
 * Handles direct communication with the Edge Function
 */
export class TaphoammoApiClient {
  private apiCache: TaphoammoApiCache;
  private validator: TaphoammoResponseValidator;
  private defaultTimeout: number = 10000; // 10 seconds default timeout
  private productCache: Map<string, TaphoammoProduct> = new Map();
  
  constructor() {
    this.apiCache = new TaphoammoApiCache();
    this.validator = new TaphoammoResponseValidator();
  }
  
  /**
   * Execute API call with proper error handling
   */
  public async executeApiCall<T = any>(
    method: string, 
    params: Record<string, any>, 
    options: TaphoammoApiOptions = {}
  ): Promise<TaphoammoResponse<T>> {
    const { 
      useMockData = false,
      useCache = true,
      forceRefresh = false,
      timeout = this.defaultTimeout
    } = options;
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(method, params);
    
    // Check if we should use cached data
    if (useCache && !forceRefresh) {
      const cachedData = this.apiCache.get<T>(cacheKey);
      if (cachedData) {
        console.log(`[TaphoammoApiClient] Using cached data for ${method}`, { cached: true });
        return {
          data: cachedData.data,
          source: 'cache',
          timestamp: cachedData.timestamp,
          responseTime: 0 // No response time for cached data
        };
      }
    }
    
    const startTime = Date.now();
    
    try {
      // Setup timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new TaphoammoError(
          `Request timeout after ${timeout}ms`, 
          TaphoammoErrorCodes.TIMEOUT
        )), timeout);
      });
      
      // Call edge function
      console.log(`[TaphoammoApiClient] Calling ${method}`);
      const requestPromise = supabase.functions.invoke('taphoammo-api', {
        body: { 
          ...params,
          action: method,
          debug_mock: useMockData ? 'true' : 'false'
        }
      });
      
      // Race the promises
      const { data, error } = await Promise.race([requestPromise, timeoutPromise]);
      
      const responseTime = Date.now() - startTime;
      
      // Handle possible errors
      if (error) {
        console.error(`[TaphoammoApiClient] Error in ${method}:`, error);
        
        throw new TaphoammoError(
          error.message || 'API request failed',
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
          0,
          responseTime
        );
      }
      
      // Validate response
      this.validator.validate(method, data);
      
      // Cache successful result
      if (useCache) {
        this.apiCache.set(cacheKey, data);
      }
      
      // Return formatted response
      return {
        data: data as T,
        source: data.source === 'mock' ? 'mock' : 'api',
        timestamp: Date.now(),
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw this.enhanceError(error, method, responseTime);
    }
  }
  
  /**
   * Call TaphoaMMO API with the provided parameters
   * This method is used by TaphoammoProductService
   */
  public async callTaphoaMMO(
    method: string,
    params: Record<string, any>
  ): Promise<any> {
    const response = await this.executeApiCall(method, params);
    return response.data;
  }
  
  /**
   * Cache a product for later retrieval
   */
  public cacheProduct(kioskToken: string, product: TaphoammoProduct): void {
    this.productCache.set(kioskToken, product);
  }
  
  /**
   * Get a cached product by kiosk token
   */
  public getCachedProduct(kioskToken: string): TaphoammoProduct | null {
    return this.productCache.get(kioskToken) || null;
  }

  /**
   * Get product from database cache
   */
  public async getProductFromDatabaseCache(kioskToken: string): Promise<TaphoammoProduct | null> {
    try {
      const { data, error } = await supabase
        .from('inventory_cache')
        .select('*')
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      // Get product name from products table if not in cache
      let productName = "Unknown Product";
      if (data.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('name')
          .eq('id', data.product_id)
          .single();
          
        if (product) {
          productName = product.name;
        }
      }
      
      return {
        kiosk_token: data.kiosk_token,
        name: productName,
        stock_quantity: data.stock_quantity,
        price: data.price,
        cached: true,
        last_checked: new Date(data.last_checked_at),
        emergency: true
      };
    } catch (error) {
      console.error(`[TaphoammoApiClient] Error getting product from database cache:`, error);
      return null;
    }
  }
  
  /**
   * Generate cache key from method and params
   */
  private generateCacheKey(method: string, params: Record<string, any>): string {
    // Remove debug_mock from cache key
    const { debug_mock, ...cacheParams } = params;
    return `${method}:${JSON.stringify(cacheParams)}`;
  }
  
  /**
   * Enhance error with additional context
   */
  private enhanceError(error: any, method: string, responseTime: number): Error {
    if (error instanceof TaphoammoError) {
      error.responseTime = responseTime;
      return error;
    }
    
    // Check if it's a network error
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('Network request failed')) {
      return new TaphoammoError(
        `Network error in ${method}: ${error.message}`,
        TaphoammoErrorCodes.NETWORK_ERROR,
        0,
        responseTime
      );
    }
    
    return new TaphoammoError(
      `Error in ${method}: ${error.message || 'Unknown error'}`,
      TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
      0,
      responseTime
    );
  }
  
  /**
   * Clear API cache
   */
  public clearCache(): void {
    this.apiCache.clear();
    this.productCache.clear();
  }
  
  /**
   * Helper method to create validator if not available
   */
  public getValidator(): TaphoammoResponseValidator {
    if (!this.validator) {
      this.validator = new TaphoammoResponseValidator();
    }
    return this.validator;
  }
}
