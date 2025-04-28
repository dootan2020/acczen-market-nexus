
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitorInterval?: number;
}

export class CircuitBreaker {
  private apiName = 'taphoammo'; // Default API name
  private failureThreshold: number;
  private resetTimeout: number;
  private monitorInterval: number;
  private notifiedUser: boolean = false;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute default
    this.monitorInterval = options.monitorInterval || 10000; // 10 seconds
  }

  /**
   * Check if the circuit is currently open
   */
  public async isOpen(): Promise<boolean> {
    try {
      const { data: apiHealth } = await supabase
        .from('api_health')
        .select('*')
        .eq('api_name', this.apiName)
        .single();
        
      if (apiHealth?.is_open) {
        const openedAt = new Date(apiHealth.opened_at).getTime();
        const now = new Date().getTime();
        
        if (now - openedAt > this.resetTimeout) {
          // If reset timeout has passed, try to close the circuit
          // But don't actually close it yet - we'll let the next successful call do that
          // This implements a "half-open" state
          return false;
        }
        
        // If circuit is open and we haven't notified the user yet, do so
        if (!this.notifiedUser) {
          toast.warning("Kết nối API tạm thời không khả dụng. Đang sử dụng dữ liệu cache.", {
            duration: 5000,
            id: "circuit-breaker-notification"
          });
          this.notifiedUser = true;
        }
        
        return true;
      }
      
      // Reset the notification flag when circuit is closed
      this.notifiedUser = false;
      return false;
    } catch (err) {
      console.error('Error checking circuit breaker state:', err);
      return false; // Default to closed if we can't check
    }
  }

  /**
   * Record a failure in the circuit breaker
   */
  public async recordFailure(error: Error): Promise<void> {
    try {
      const { data: errorCountData } = await supabase.rpc('increment_error_count');
      const { data: shouldOpenCircuit } = await supabase.rpc('check_if_should_open_circuit');
      const { data: openedAtValue } = await supabase.rpc('update_opened_at_if_needed');
      
      await supabase
        .from('api_health')
        .update({
          error_count: errorCountData || 1,
          last_error: error.message,
          is_open: shouldOpenCircuit || false,
          opened_at: openedAtValue || null,
          updated_at: new Date().toISOString()
        })
        .eq('api_name', this.apiName);

      // Log the failure
      await supabase.from('api_logs').insert({
        api: this.apiName,
        endpoint: 'unknown',
        status: 'error',
        details: {
          error: error.message,
          circuit_opened: shouldOpenCircuit || false
        }
      });
      
      // If circuit just opened, notify the user
      if (shouldOpenCircuit && !this.notifiedUser) {
        toast.error("Kết nối API không ổn định. Đang chuyển sang sử dụng dữ liệu cache.", {
          duration: 8000,
          id: "circuit-breaker-open-notification"
        });
        this.notifiedUser = true;
      }
    } catch (err) {
      console.error('Error recording failure in circuit breaker:', err);
    }
  }

  /**
   * Reset the circuit breaker after successful calls
   */
  public async reset(): Promise<void> {
    try {
      await supabase
        .from('api_health')
        .update({
          is_open: false,
          error_count: 0,
          opened_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('api_name', this.apiName);
        
      // Reset notification flag
      this.notifiedUser = false;
      
      // Log circuit reset
      await supabase.from('api_logs').insert({
        api: this.apiName,
        endpoint: 'circuit_breaker',
        status: 'reset',
        details: {
          message: 'Circuit breaker reset'
        }
      });
    } catch (err) {
      console.error('Error resetting circuit breaker:', err);
    }
  }
}
