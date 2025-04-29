
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
}

export interface TaphoammoResponse<T = any> {
  data: T;
  source?: 'cache' | 'api' | 'mock';
  timestamp?: number;
}

/**
 * Core API client for Taphoammo API
 * Handles direct communication with the Edge Function
 */
export class TaphoammoApiClient {
  private apiCache: TaphoammoApiCache;
  private validator: TaphoammoResponseValidator;
  
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
      forceRefresh = false
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
          timestamp: cachedData.timestamp
        };
      }
    }
    
    try {
      // Call edge function
      console.log(`[TaphoammoApiClient] Calling ${method} with proxy ${proxyType}`);
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: { 
          ...params,
          proxy_type: proxyType,
          action: method,
          debug_mock: useMockData ? 'true' : 'false'
        }
      });
      
      // Handle possible errors
      if (error) {
        console.error(`[TaphoammoApiClient] Error in ${method}:`, error);
        
        throw new TaphoammoError(
          error.message || 'API request failed',
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
          0,
          0
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
        timestamp: Date.now()
      };
    } catch (error) {
      throw this.enhanceError(error, method);
    }
  }
  
  /**
   * Generate cache key from method and params
   */
  private generateCacheKey(method: string, params: Record<string, any>): string {
    return `${method}:${JSON.stringify(params)}`;
  }
  
  /**
   * Enhance error with additional context
   */
  private enhanceError(error: any, method: string): Error {
    if (error instanceof TaphoammoError) {
      return error;
    }
    
    return new TaphoammoError(
      `Error in ${method}: ${error.message || 'Unknown error'}`,
      TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
      0,
      0
    );
  }
  
  /**
   * Clear API cache
   */
  public clearCache(): void {
    this.apiCache.clear();
  }
}
