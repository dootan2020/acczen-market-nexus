
import { supabase } from '@/integrations/supabase/client';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ProxyType, getProxyUrl } from '@/utils/corsProxy';
import { TaphoammoApiCache } from './TaphoammoApiCache';
import { TaphoammoResponseValidator } from './TaphoammoResponseValidator';

export interface TaphoammoApiOptions {
  proxyType?: ProxyType;
  useMockData?: boolean;
  useCache?: boolean;
  forceRefresh?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface TaphoammoResponse<T = any> {
  data: T;
  source?: 'cache' | 'api' | 'mock';
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
  
  constructor() {
    this.apiCache = new TaphoammoApiCache();
    this.validator = new TaphoammoResponseValidator();
  }
  
  /**
   * Execute API call with proper error handling and proxy support
   */
  public async executeApiCall<T = any>(
    method: string, 
    params: Record<string, any>, 
    options: TaphoammoApiOptions = {}
  ): Promise<TaphoammoResponse<T>> {
    const { 
      proxyType = 'allorigins',
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
      console.log(`[TaphoammoApiClient] Calling ${method} with proxy ${proxyType}`);
      const requestPromise = supabase.functions.invoke('taphoammo-api', {
        body: { 
          ...params,
          proxy_type: proxyType,
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
   * Generate cache key from method and params
   */
  private generateCacheKey(method: string, params: Record<string, any>): string {
    // Remove proxy_type and debug_mock from cache key
    const { proxy_type, debug_mock, ...cacheParams } = params;
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

