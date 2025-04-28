
import { supabase } from '@/integrations/supabase/client';
import { API_CONFIG } from './config';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ApiCache } from './cache/ApiCache';
import { CircuitBreaker } from './cache/CircuitBreaker';
import { DatabaseCache } from './cache/DatabaseCache';

export class BaseApiClient {
  protected async callApiWithCache(
    endpoint: string, 
    params: Record<string, string | number>, 
    cacheOptions: { 
      enabled: boolean; 
      ttl?: number;
    } = { enabled: true, ttl: 60000 }
  ): Promise<any> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    
    if (cacheOptions.enabled) {
      const cachedData = ApiCache.get(cacheKey);
      if (cachedData) return cachedData;
    }
    
    const result = await this.callApi(endpoint, params);
    
    if (cacheOptions.enabled) {
      const ttl = cacheOptions.ttl || 60000;
      ApiCache.set(cacheKey, result, ttl);
    }
    
    return result;
  }

  protected async checkDatabaseCache(kioskToken: string) {
    return DatabaseCache.get(kioskToken);
  }

  protected async callEdgeFunction(
    functionName: string,
    params: Record<string, any>
  ): Promise<{ data: any; error: any }> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Edge Function] Calling ${functionName} with params:`, params);
      }
      
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: JSON.stringify(params)
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`[Edge Function] ${functionName} responded in ${responseTime}ms`);
      
      if (error) {
        throw new TaphoammoError(
          error.message || "Edge function call failed",
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
          0,
          responseTime
        );
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`[Edge Function] Error in ${functionName}:`, error);
      await CircuitBreaker.recordFailure(error);
      
      return { 
        data: null, 
        error: error instanceof TaphoammoError ? error : 
          new TaphoammoError(
            error.message || "Edge function error",
            TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
            0,
            0
          )
      };
    }
  }

  protected async callApi(endpoint: string, params: Record<string, string | number>): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TaphoaMMO API] Calling ${endpoint} with params:`, params);
      }
      
      // First, try to call via Edge Function to avoid CORS issues
      try {
        const { data, error } = await this.callEdgeFunction('taphoammo-api', {
          endpoint,
          ...params
        });
        
        if (!error) {
          return data;
        }
      } catch (edgeError) {
        console.warn(`[TaphoaMMO API] Edge Function failed, falling back to direct API call:`, edgeError);
        // Continue with direct API call as fallback
      }
      
      // Direct API call as fallback, which may fail due to CORS
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      const apiUrl = `${API_CONFIG.baseUrl}/${endpoint}?${queryParams.toString()}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const startTime = Date.now();
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": API_CONFIG.userAgent,
          "Accept": "application/json"
        }
      });
      
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      console.log(`[TaphoaMMO API] ${endpoint} responded in ${responseTime}ms`);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new TaphoammoError(
            "API rate limit exceeded. Please try again later.",
            TaphoammoErrorCodes.RATE_LIMIT,
            0,
            responseTime
          );
        }
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      if (data.success === "false") {
        if (data.description === "Order in processing!" || 
            data.message === "Order in processing!") {
          return data;
        }
        
        if (data.message === "Kiosk is pending!" || 
            data.description === "Kiosk is pending!" ||
            data.message?.includes("pending") ||
            data.description?.includes("pending")) {
          throw new TaphoammoError(
            "Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.",
            TaphoammoErrorCodes.KIOSK_PENDING,
            0,
            responseTime
          );
        }
        
        throw new Error(data.message || data.description || 'API returned an error');
      }
      
      return data;
    } catch (error: any) {
      console.error(`[TaphoaMMO API] Error in ${endpoint}:`, error);
      
      await CircuitBreaker.recordFailure(error);
      
      if (error.name === 'AbortError') {
        throw new TaphoammoError(
          "API request timed out. Please try again later.",
          TaphoammoErrorCodes.TIMEOUT,
          0,
          API_CONFIG.timeout
        );
      } else if (error instanceof TaphoammoError) {
        throw error;
      } else if (error.message?.includes('fetch') || error.message?.includes('CORS')) {
        throw new TaphoammoError(
          "Network error while calling API. Please check your connection.",
          TaphoammoErrorCodes.NETWORK_ERROR,
          0,
          0
        );
      }
      
      throw error;
    }
  }
}
