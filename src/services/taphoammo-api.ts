
import { supabase } from '@/integrations/supabase/client';
import { DatabaseCache } from '@/utils/api/cache/DatabaseCache';
import { CircuitBreaker } from '@/utils/api/circuitBreaker/CircuitBreaker';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { toast } from 'sonner';

interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTime?: number;
  maxRetries?: number;
}

export class TaphoammoApiService {
  private static instance: TaphoammoApiService;
  private failureThreshold: number;
  private recoveryTime: number;
  private maxRetries: number;
  private retryDelays: number[];

  private constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.recoveryTime = options.recoveryTime || 120000; // 2 minutes
    this.maxRetries = options.maxRetries || 5;
    // Exponential backoff: 2s, 4s, 8s, 16s, 32s
    this.retryDelays = Array.from({ length: this.maxRetries }, (_, i) => Math.pow(2, i + 1) * 1000);
  }

  public static getInstance(options?: CircuitBreakerOptions): TaphoammoApiService {
    if (!this.instance) {
      this.instance = new TaphoammoApiService(options);
    }
    return this.instance;
  }

  private async checkCircuitBreakerState(): Promise<boolean> {
    return CircuitBreaker.isOpen();
  }

  private async recordFailure(error: Error): Promise<void> {
    await CircuitBreaker.recordFailure(error);
  }

  private async resetCircuitBreaker(): Promise<void> {
    await CircuitBreaker.reset();
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>, 
    maxRetries = this.maxRetries
  ): Promise<T> {
    let retryCount = 0;
    const startTime = Date.now();

    while (retryCount < maxRetries) {
      try {
        const isOpen = await this.checkCircuitBreakerState();
        
        if (isOpen) {
          throw new TaphoammoError(
            'API is temporarily unavailable', 
            TaphoammoErrorCodes.API_TEMP_DOWN, 
            retryCount, 
            Date.now() - startTime
          );
        }

        const result = await fn();
        await this.resetCircuitBreaker(); // Reset on success
        return result;
      } catch (error) {
        console.warn(`Taphoammo API call failed (Attempt ${retryCount + 1}):`, error);
        
        await this.recordFailure(error as Error);
        
        if (retryCount === maxRetries - 1) {
          throw error;
        }

        const backoffDelay = this.retryDelays[retryCount] || 32000; // Max 32s delay
        console.log(`Retrying in ${backoffDelay/1000} seconds...`);
        
        if (retryCount > 0) {
          // Only show toast notifications after the first retry
          toast.info(`API request failed. Retrying in ${backoffDelay/1000}s (${retryCount+1}/${maxRetries})...`);
        }
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        retryCount++;
      }
    }

    throw new Error('Max retries exceeded');
  }

  public async fetchTaphoammo<T>(
    endpoint: string, 
    params: Record<string, any>,
    options: {
      forceFresh?: boolean;
      cacheKey?: string;
      cacheTTL?: number;  // in milliseconds
    } = {}
  ): Promise<T> {
    const { forceFresh = false, cacheKey, cacheTTL = 1800000 } = options; // Default 30 min TTL
    
    // Check cache first if we have a cache key and aren't forcing fresh data
    if (cacheKey && !forceFresh) {
      try {
        const cachedData = await DatabaseCache.get(cacheKey);
        if (cachedData.cached && cachedData.data) {
          console.log(`[TaphoaMMO API] Using cached data for ${endpoint}:`, cachedData.data);
          return cachedData.data as T;
        }
      } catch (cacheError) {
        console.warn('[TaphoaMMO API] Cache check failed:', cacheError);
        // Continue to API call if cache check fails
      }
    }
    
    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      
      // Use edge function instead of calling API directly
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: JSON.stringify({
          endpoint,
          ...params
        })
      });

      const responseTime = Date.now() - startTime;
      
      if (error) {
        console.error(`[TaphoaMMO API] Error calling ${endpoint}:`, error);
        throw new TaphoammoError(
          `API Error: ${error.message}`, 
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE, 
          0, 
          responseTime
        );
      }
      
      // If API response indicates failure
      if (data && data.success === "false") {
        console.error(`[TaphoaMMO API] ${endpoint} returned failure:`, data.message);
        throw new TaphoammoError(
          data.message || 'Unknown API error', 
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE, 
          0, 
          responseTime
        );
      }
      
      // Update cache with new data if we have a cache key
      if (cacheKey) {
        try {
          await DatabaseCache.set(cacheKey, data, cacheTTL);
        } catch (cacheError) {
          console.warn('[TaphoaMMO API] Failed to update cache:', cacheError);
          // Continue without caching if it fails
        }
      }
      
      return data as T;
    });
  }
}

export const taphoammoApi = TaphoammoApiService.getInstance();
