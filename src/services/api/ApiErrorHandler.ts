
import { toast } from 'sonner';
import { CircuitBreaker } from './CircuitBreaker';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { supabase } from '@/integrations/supabase/client';

interface ApiErrorHandlerOptions {
  serviceName: string;
  maxRetries?: number;
  retryDelays?: number[];
  timeout?: number;
  showToasts?: boolean;
}

interface ApiRequestParams {
  endpoint: string;
  operation: string;
  params?: Record<string, any>;
}

/**
 * ApiErrorHandler provides unified error handling, circuit breaking, 
 * retry logic, and monitoring for API calls.
 */
export class ApiErrorHandler {
  private serviceName: string;
  private maxRetries: number;
  private retryDelays: number[];
  private timeout: number;
  private showToasts: boolean;
  private circuitBreaker: CircuitBreaker;

  constructor(options: ApiErrorHandlerOptions) {
    this.serviceName = options.serviceName;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelays = options.retryDelays || [1000, 3000, 7000]; // 1s, 3s, 7s
    this.timeout = options.timeout || 30000; // 30s default
    this.showToasts = options.showToasts !== false;
    
    // Initialize circuit breaker
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitorInterval: 10000 // 10 seconds
    });
  }

  /**
   * Execute API request with full error handling
   */
  public async executeRequest<T>(
    fn: () => Promise<T>, 
    requestParams: ApiRequestParams,
    cacheFallbackFn?: () => Promise<T>
  ): Promise<T> {
    const { endpoint, operation, params } = requestParams;
    const startTime = Date.now();
    let retryCount = 0;
    let errorLogged = false;

    // First check if circuit is open
    const isCircuitOpen = await this.circuitBreaker.isOpen();
    if (isCircuitOpen) {
      console.warn(`Circuit is open for ${this.serviceName} - using cache fallback`);
      
      // Try cache fallback if provided
      if (cacheFallbackFn) {
        try {
          const cachedResult = await cacheFallbackFn();
          await this.logApiCall({
            endpoint,
            operation,
            status: 'cache-fallback',
            responseTime: Date.now() - startTime,
            details: {
              circuitOpen: true,
              params
            }
          });
          return cachedResult;
        } catch (fallbackError) {
          console.error('Cache fallback failed:', fallbackError);
        }
      }

      // If no fallback or fallback failed
      throw new TaphoammoError(
        `Service ${this.serviceName} is temporarily unavailable`,
        TaphoammoErrorCodes.API_TEMP_DOWN,
        0,
        0
      );
    }

    // Retry logic with exponential backoff
    let lastError: any;
    
    while (retryCount <= this.maxRetries) {
      try {
        // Execute with timeout
        const result = await this.executeWithTimeout(fn);
        
        // Success - reset circuit breaker
        this.circuitBreaker.reset().catch(err => {
          console.error('Failed to reset circuit breaker:', err);
        });

        // Log successful API call
        await this.logApiCall({
          endpoint,
          operation,
          status: 'success',
          responseTime: Date.now() - startTime,
          details: {
            retries: retryCount,
            params
          }
        });

        return result;
      } catch (error) {
        lastError = error;
        
        // Record failure in circuit breaker
        await this.circuitBreaker.recordFailure(error);
        
        // Log error on final attempt
        if (retryCount === this.maxRetries && !errorLogged) {
          errorLogged = true;
          await this.logApiCall({
            endpoint,
            operation,
            status: 'error',
            responseTime: Date.now() - startTime,
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
              retries: retryCount,
              params
            }
          });
        }

        // Check if we should retry
        if (retryCount < this.maxRetries && this.isRetryable(error)) {
          const delay = this.retryDelays[retryCount] || 10000;
          retryCount++;
          
          console.warn(`Retrying ${operation} (${retryCount}/${this.maxRetries}) in ${delay}ms...`);
          
          // Show toast for user awareness (only for user-visible operations)
          if (this.showToasts && retryCount > 1) {
            toast.info(`Đang thử lại kết nối (${retryCount}/${this.maxRetries})...`, {
              duration: delay - 500, // Toast disappears just before next attempt
              id: `retry-${endpoint}-${retryCount}`
            });
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If we get here, we've exhausted retries or error is not retryable
        break;
      }
    }

    // If we reach here, we've exhausted all retries
    if (lastError instanceof TaphoammoError) {
      throw lastError; // Re-throw specific error
    }
    
    // Wrap other errors
    throw new TaphoammoError(
      lastError?.message || `${operation} failed after ${retryCount} retries`,
      TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
      retryCount,
      Date.now() - startTime
    );
  }

  /**
   * Execute a function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Set timeout
      const timeoutId = setTimeout(() => {
        reject(new TaphoammoError(
          `Request timed out after ${this.timeout}ms`,
          TaphoammoErrorCodes.TIMEOUT,
          0,
          this.timeout
        ));
      }, this.timeout);
      
      // Execute function
      fn()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(err => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: any): boolean {
    // Don't retry certain error types
    if (error instanceof TaphoammoError) {
      // Some errors shouldn't be retried
      if (
        error.code === TaphoammoErrorCodes.KIOSK_PENDING ||
        error.code === TaphoammoErrorCodes.ORDER_PROCESSING
      ) {
        return false;
      }
    }
    
    // Network errors, timeouts, and CORS issues are retryable
    const errorMsg = error?.message?.toLowerCase() || '';
    if (
      errorMsg.includes('network') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('cors') ||
      errorMsg.includes('gateway') ||
      errorMsg.includes('unavailable') ||
      errorMsg.includes('connectivity')
    ) {
      return true;
    }
    
    // Default to true for most errors
    return true;
  }

  /**
   * Log API call to the database for monitoring
   */
  private async logApiCall(data: {
    endpoint: string;
    operation: string;
    status: string;
    responseTime: number;
    details?: Record<string, any>;
  }): Promise<void> {
    try {
      await supabase.from('api_logs').insert({
        api: this.serviceName,
        endpoint: data.endpoint,
        status: data.status,
        response_time: data.responseTime,
        details: data.details || {}
      });
    } catch (error) {
      console.error('Failed to log API call:', error);
    }
  }
}
