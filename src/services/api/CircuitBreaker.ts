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

// Updated interface to match DB schema
interface ApiHealthRecord {
  id: string;
  api_name: string;
  is_open: boolean;
  error_count: number;
  last_error: string | null;
  opened_at: string | null;
  updated_at: string;
  created_at: string;
  half_open?: boolean;
  consecutive_success?: number;
}

/**
 * CircuitBreaker prevents cascading failures by stopping API calls 
 * when the external service is unstable.
 * 
 * It implements three states:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service considered unavailable, requests fail fast
 * - HALF_OPEN: Testing if service has recovered
 */
export class CircuitBreaker {
  private apiName = 'taphoammo'; // Default API name
  private failureThreshold: number;
  private resetTimeout: number;
  private monitorInterval: number;
  private notifiedUser: boolean = false;
  private lastStatusCheck: number = 0;
  private cachedState: { isOpen: boolean; openedAt: string | null } | null = null;

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
      // Throttle database calls - use cached state if checked recently
      const now = Date.now();
      if (this.cachedState && now - this.lastStatusCheck < this.monitorInterval) {
        return this.cachedState.isOpen;
      }

      // Fetch current circuit state from database
      const { data: apiHealth } = await supabase
        .from('api_health')
        .select('*')
        .eq('api_name', this.apiName)
        .single();
        
      if (!apiHealth) {
        // Initialize circuit breaker record if it doesn't exist
        await this.initializeCircuitRecord();
        this.cachedState = { isOpen: false, openedAt: null };
        this.lastStatusCheck = now;
        return false;
      }
        
      // Check if circuit is open
      if (apiHealth.is_open) {
        const openedAt = apiHealth.opened_at ? new Date(apiHealth.opened_at).getTime() : now;
        
        // If reset timeout has passed, transition to half-open state
        if (now - openedAt > this.resetTimeout) {
          console.log('Circuit breaker reset timeout elapsed, transitioning to half-open state');
          
          await this.transitionToHalfOpen();
          
          // Update cached state
          this.cachedState = { isOpen: false, openedAt: null };
          this.lastStatusCheck = now;
          return false;
        }
        
        // Circuit is open and within reset timeout - notify user if not already done
        if (!this.notifiedUser) {
          toast.warning("Kết nối API tạm thời không khả dụng. Đang sử dụng dữ liệu cache.", {
            duration: 5000,
            id: "circuit-breaker-notification"
          });
          this.notifiedUser = true;
        }
        
        // Update cached state
        this.cachedState = { isOpen: true, openedAt: apiHealth.opened_at };
        this.lastStatusCheck = now;
        return true;
      }
      
      // Circuit is closed
      this.notifiedUser = false;
      this.cachedState = { isOpen: false, openedAt: null };
      this.lastStatusCheck = now;
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
      // Get current error count
      const { data: apiHealth } = await supabase
        .from('api_health')
        .select('error_count, is_open')
        .eq('api_name', this.apiName)
        .single();
        
      if (!apiHealth) {
        await this.initializeCircuitRecord();
        return;
      }
      
      // Increment error count
      const newErrorCount = (apiHealth.error_count || 0) + 1;
      
      // Check if we should open the circuit
      const shouldOpenCircuit = newErrorCount >= this.failureThreshold && !apiHealth.is_open;
      const openedAt = shouldOpenCircuit ? new Date().toISOString() : null;
      
      // Update database record
      await supabase
        .from('api_health')
        .update({
          error_count: newErrorCount,
          last_error: error.message,
          is_open: shouldOpenCircuit || apiHealth.is_open,
          opened_at: shouldOpenCircuit ? openedAt : apiHealth.is_open ? apiHealth.opened_at : null,
          updated_at: new Date().toISOString()
        })
        .eq('api_name', this.apiName);

      // Log the failure
      await supabase.from('api_logs').insert({
        api: this.apiName,
        endpoint: 'circuit_breaker',
        status: 'error',
        details: {
          error: error.message,
          circuit_opened: shouldOpenCircuit
        }
      });
      
      // Invalidate cache
      this.cachedState = null;
      
      // If circuit just opened, notify the user
      if (shouldOpenCircuit) {
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
   * Transition circuit to half-open state to test recovery
   */
  private async transitionToHalfOpen(): Promise<void> {
    try {
      // Check if half_open column exists in the table
      const { data, error } = await supabase
        .from('api_health')
        .update({
          is_open: false,
          updated_at: new Date().toISOString()
        })
        .eq('api_name', this.apiName);
        
      // Try to update half_open field if it exists
      try {
        await supabase.rpc('set_circuit_half_open', { api_name_param: this.apiName });
      } catch (halfOpenErr) {
        console.log('Half-open state not supported in current DB schema, using fallback behavior');
      }
        
      // Log transition
      await supabase.from('api_logs').insert({
        api: this.apiName,
        endpoint: 'circuit_breaker',
        status: 'half_open',
        details: {
          message: 'Transitioning to half-open state to test recovery'
        }
      });
      
      // Notify user
      toast.info("Đang thử kết nối lại với API...", {
        duration: 3000,
        id: "circuit-half-open-notification"
      });
    } catch (err) {
      console.error('Error transitioning to half-open state:', err);
    }
  }

  /**
   * Reset the circuit breaker after successful calls
   */
  public async reset(): Promise<void> {
    try {
      // Check if half_open column exists
      let wasOpen = false;
      
      try {
        const { data } = await supabase
          .from('api_health')
          .select('is_open')
          .eq('api_name', this.apiName)
          .single();
          
        // Only notify when transitioning from open to closed
        wasOpen = !!data?.is_open;
      } catch (err) {
        console.error('Error checking circuit state:', err);
      }
      
      // Reset circuit state
      await supabase
        .from('api_health')
        .update({
          is_open: false,
          error_count: 0,
          opened_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('api_name', this.apiName);
       
      // Try to reset half_open field if it exists
      try {
        await supabase.rpc('reset_circuit_half_open', { api_name_param: this.apiName });
      } catch (halfOpenErr) {
        console.log('Half-open state not supported in current DB schema');
      }
        
      // Clear cached state
      this.cachedState = null;
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
      
      // Notify user if we were previously in open state
      if (wasOpen) {
        toast.success("Kết nối API đã được khôi phục.", {
          duration: 3000,
          id: "circuit-reset-notification"
        });
      }
    } catch (err) {
      console.error('Error resetting circuit breaker:', err);
    }
  }

  /**
   * Initialize circuit breaker record if it doesn't exist
   */
  private async initializeCircuitRecord(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('api_health')
        .insert({
          api_name: this.apiName,
          is_open: false,
          error_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error initializing circuit breaker record:', error);
      }
    } catch (err) {
      console.error('Error initializing circuit breaker record:', err);
    }
  }
}
