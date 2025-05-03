
/**
 * A simple circuit breaker implementation for API calls
 */
export enum CircuitState {
  CLOSED = 'closed',  // Normal operation, requests proceed
  OPEN = 'open',      // Failing state, requests are rejected
  HALF_OPEN = 'half-open' // Testing state, limited requests allowed
}

export interface CircuitBreakerOptions {
  failureThreshold: number;  // Number of failures before opening
  resetTimeout: number;      // Time in ms before attempting reset
  maxRetries: number;        // Maximum number of retries
}

export class CircuitBreaker {
  private static state: CircuitState = CircuitState.CLOSED;
  private static failureCount: number = 0;
  private static lastFailureTime: number = 0;
  private static readonly failureThreshold: number = 3;
  private static readonly resetTimeout: number = 60000; // 1 minute

  /**
   * Checks if the circuit is open (failing)
   */
  public static async isOpen(): Promise<boolean> {
    // If it's been long enough since the last failure, try to reset
    if (this.state === CircuitState.OPEN && 
        Date.now() - this.lastFailureTime > this.resetTimeout) {
      console.log('Circuit breaker attempting reset (half-open)');
      this.state = CircuitState.HALF_OPEN;
    }
    
    return this.state === CircuitState.OPEN;
  }

  /**
   * Records a failure and potentially opens the circuit
   */
  public static async recordFailure(error: Error): Promise<void> {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    // Log the failure for monitoring
    console.error(`Circuit breaker recorded failure ${this.failureCount}/${this.failureThreshold}:`, error.message);
    
    if (this.failureCount >= this.failureThreshold) {
      if (this.state !== CircuitState.OPEN) {
        console.warn(`Circuit breaker OPENED after ${this.failureCount} failures`);
      }
      this.state = CircuitState.OPEN;
    }
    
    // If in half-open state and failed, go back to open
    if (this.state === CircuitState.HALF_OPEN) {
      console.warn('Circuit breaker test failed, reopening circuit');
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Resets the circuit breaker after successful operations
   */
  public static async reset(): Promise<void> {
    if (this.state !== CircuitState.CLOSED) {
      console.log('Circuit breaker reset to CLOSED state');
    }
    
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
  }

  /**
   * Gets the current state of the circuit breaker
   */
  public static getState(): CircuitState {
    return this.state;
  }
  
  /**
   * Gets the number of consecutive failures
   */
  public static getFailureCount(): number {
    return this.failureCount;
  }
  
  /**
   * Gets the time of the last failure
   */
  public static getLastFailureTime(): number {
    return this.lastFailureTime;
  }
}
