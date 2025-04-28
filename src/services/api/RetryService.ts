
import { toast } from 'sonner';

export interface RetryOptions {
  baseDelay?: number;
  maxRetries?: number;
  maxDelay?: number;
  jitter?: boolean;
}

export interface RetryResult<T> {
  result: T;
  retries: number;
  responseTime: number;
  success: boolean;
}

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
      jitter = true
    } = options;
    
    let retries = 0;
    let lastError: Error | null = null;
    const startTime = Date.now();

    while (retries <= maxRetries) {
      try {
        // Execute the function
        const result = await fn();
        
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
        retries++;
        
        if (retries > maxRetries) {
          // We've exhausted all retries
          break;
        }

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
        if (retries > 1) {
          toast.info(`Yêu cầu bị lỗi. Đang thử lại lần ${retries}/${maxRetries}...`);
        }
        
        // Wait before retrying
        await this.delay(delay);
      }
    }

    // If we get here, we've failed after all retries
    const totalTime = Date.now() - startTime;
    throw lastError || new Error('Maximum retries exceeded');
  }

  /**
   * Simple promise-based delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
