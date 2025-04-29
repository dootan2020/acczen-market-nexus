
import { toast } from 'sonner';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

export interface RetryOptions {
  baseDelay?: number;
  maxRetries?: number;
  maxDelay?: number;
  jitter?: boolean;
  timeout?: number;
  retryableErrors?: string[];
  showToasts?: boolean;
}

export interface RetryResult<T> {
  result: T;
  retries: number;
  responseTime: number;
  success: boolean;
}

/**
 * Provides retry functionality with exponential backoff,
 * timeout handling, and jitter for API requests
 */
export class RetryService {
  /**
   * Execute a function with automatic retries and exponential backoff
   */
  public async execute<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const {
      baseDelay = 1000,
      maxDelay = 30000,
      jitter = true,
      timeout = 30000,
      showToasts = true,
      retryableErrors = []
    } = options;
    
    let retries = 0;
    let lastError: Error | null = null;
    const startTime = Date.now();

    // Add timeout wrapper
    const executeWithTimeout = async (): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new TaphoammoError(
            'Request timed out',
            TaphoammoErrorCodes.TIMEOUT,
            retries,
            timeout
          ));
        }, timeout);
        
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
    };

    while (retries <= maxRetries) {
      try {
        // Execute the function with timeout
        const result = await executeWithTimeout();
        
        const responseTime = Date.now() - startTime;
        
        // Return success result
        return {
          result,
          retries,
          responseTime,
          success: true
        };
      } catch (error: any) {
        lastError = error;
        
        // Check if we've exhausted all retries
        if (retries >= maxRetries) {
          break;
        }
        
        // Check if error is retryable
        const errorMessage = error?.message?.toLowerCase() || '';
        const isRetryable = 
          // Network errors are always retryable
          errorMessage.includes('network') ||
          errorMessage.includes('cors') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('timeout') ||
          // Check against custom list of retryable errors
          retryableErrors.some(errMsg => errorMessage.includes(errMsg.toLowerCase())) ||
          // Specific TaphoammoError codes
          (error instanceof TaphoammoError && 
            error.code !== TaphoammoErrorCodes.KIOSK_PENDING &&
            error.code !== TaphoammoErrorCodes.ORDER_PROCESSING);
            
        // If error is not retryable, don't retry
        if (!isRetryable) {
          break;
        }
        
        retries++;

        // Calculate the backoff delay with exponential increase
        let delay = Math.min(
          maxDelay,
          baseDelay * Math.pow(2, retries - 1)
        );
        
        // Add some randomness to prevent thundering herd
        if (jitter) {
          delay = delay * (0.5 + Math.random() * 0.5);
        }
        
        console.log(`Retry ${retries}/${maxRetries} in ${Math.round(delay / 1000)}s...`, error);
        
        // Only show toast for user-visible retries (not the first one)
        if (showToasts && retries > 1) {
          toast.info(`Yêu cầu bị lỗi. Đang thử lại lần ${retries}/${maxRetries}...`);
        }
        
        // Wait before retrying
        await this.delay(delay);
      }
    }

    // If we get here, we've failed after all retries
    const totalTime = Date.now() - startTime;
    
    // Create a new error with retry information instead of modifying read-only properties
    let finalError: TaphoammoError;
    
    if (lastError instanceof TaphoammoError) {
      // Create a new error instance rather than modifying the readonly properties
      finalError = new TaphoammoError(
        lastError.message,
        lastError.code,
        retries,
        totalTime
      );
    } else {
      // Wrap other errors in TaphoammoError
      finalError = new TaphoammoError(
        lastError?.message || 'Unknown error after maximum retries',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        retries,
        totalTime
      );
    }
    
    throw finalError;
  }

  /**
   * Simple promise-based delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
