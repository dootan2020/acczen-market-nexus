
import { supabase } from '@/integrations/supabase/client';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { toast } from 'sonner';

interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTime?: number;
}

export class TaphoammoApiService {
  private static instance: TaphoammoApiService;
  private failureThreshold: number;
  private recoveryTime: number;

  private constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.recoveryTime = options.recoveryTime || 120000; // 2 minutes
  }

  public static getInstance(options?: CircuitBreakerOptions): TaphoammoApiService {
    if (!this.instance) {
      this.instance = new TaphoammoApiService(options);
    }
    return this.instance;
  }

  private async checkCircuitBreakerState(): Promise<{ isOpen: boolean }> {
    const { data, error } = await supabase
      .from('api_health')
      .select('is_open, opened_at')
      .eq('api_name', 'taphoammo')
      .single();

    if (error) {
      console.error('Error checking circuit breaker:', error);
      return { isOpen: false };
    }

    if (data.is_open) {
      const openedAt = new Date(data.opened_at);
      const now = new Date();
      const timeSinceOpen = now.getTime() - openedAt.getTime();

      if (timeSinceOpen > this.recoveryTime) {
        // Auto-close circuit after recovery time
        await this.resetCircuitBreaker();
        return { isOpen: false };
      }

      return { isOpen: true };
    }

    return { isOpen: false };
  }

  private async recordFailure(error: Error): Promise<void> {
    // Using raw SQL by including it in the update call without sql tag
    const { data, error: updateError } = await supabase
      .from('api_health')
      .update({
        error_count: supabase.rpc('increment_error_count'),
        last_error: error.message,
        is_open: supabase.rpc('check_if_should_open_circuit'),
        opened_at: supabase.rpc('update_opened_at_if_needed')
      })
      .eq('api_name', 'taphoammo');

    if (updateError) {
      console.error('Failed to record API failure:', updateError);
    }
  }

  private async resetCircuitBreaker(): Promise<void> {
    await supabase
      .from('api_health')
      .update({
        is_open: false,
        error_count: 0,
        opened_at: null
      })
      .eq('api_name', 'taphoammo');
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>, 
    maxRetries = 5
  ): Promise<T> {
    let retryCount = 0;
    const startTime = Date.now();

    while (retryCount < maxRetries) {
      try {
        const { isOpen } = await this.checkCircuitBreakerState();
        
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

        const backoffDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        retryCount++;
      }
    }

    throw new Error('Max retries exceeded');
  }

  public async fetchTaphoammo<T>(
    endpoint: string, 
    params: Record<string, any>
  ): Promise<T> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`https://taphoammo.net/api/${endpoint}?${new URLSearchParams(params)}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TAPHOAMMO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new TaphoammoError(
          `API Error: ${response.statusText}`, 
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE, 
          0, 
          0
        );
      }

      const data = await response.json();
      
      if (data.success === 'false') {
        throw new TaphoammoError(
          data.message || 'Unknown API error', 
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE, 
          0, 
          0
        );
      }

      return data as T;
    });
  }
}

export const taphoammoApi = TaphoammoApiService.getInstance();
