/**
 * Circuit Breaker pattern implementation
 * Prevents repeated calls to failing services by "breaking the circuit" after
 * a specified number of failures, allowing the service to recover.
 */
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private failureThreshold: number;
  private successThreshold: number;
  private resetTimeout: number;
  private monitorInterval: number;
  private healthCheckHandler?: () => Promise<boolean>;
  private monitorIntervalId?: number;
  
  constructor(options: {
    failureThreshold: number;
    successThreshold?: number;
    resetTimeout: number;
    monitorInterval?: number;
    healthCheck?: () => Promise<boolean>;
  }) {
    this.failureThreshold = options.failureThreshold;
    this.successThreshold = options.successThreshold || 2;
    this.resetTimeout = options.resetTimeout;
    this.monitorInterval = options.monitorInterval || 30000;
    this.healthCheckHandler = options.healthCheck;
    
    // Start monitoring
    this.startMonitoring();
  }
  
  /**
   * Records a failed operation
   */
  async recordFailure(error?: any): Promise<void> {
    this.failureCount++;
    this.successCount = 0;
    this.lastFailureTime = Date.now();
    
    // Log the failure with the error
    console.warn(`CircuitBreaker: Recorded failure ${this.failureCount}/${this.failureThreshold}`, 
      error ? (error.message || error) : 'No error details');
    
    // Check if the failure threshold has been reached
    if (this.state === 'CLOSED' && this.failureCount >= this.failureThreshold) {
      this.tripBreaker();
    }
  }
  
  /**
   * Records a successful operation
   */
  async recordSuccess(): Promise<void> {
    this.failureCount = 0;
    
    // If the circuit is half-open, increment the success counter
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      
      // Reset the circuit if success threshold is reached
      if (this.successCount >= this.successThreshold) {
        await this.reset();
      }
    }
  }
  
  /**
   * Resets the circuit breaker to closed state
   */
  async reset(): Promise<void> {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    console.info('CircuitBreaker: Circuit reset to CLOSED state');
  }
  
  /**
   * Checks if the circuit is currently open (preventing requests)
   */
  async isOpen(): Promise<boolean> {
    // If circuit is closed, allow requests
    if (this.state === 'CLOSED') {
      return false;
    }
    
    // If circuit is open, check if enough time has passed to try again
    if (this.state === 'OPEN') {
      const now = Date.now();
      const timePassedSinceFailure = now - this.lastFailureTime;
      
      // If enough time has passed, allow a test request through
      if (timePassedSinceFailure >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.info('CircuitBreaker: Circuit changed from OPEN to HALF_OPEN');
        return false;
      }
      
      return true;
    }
    
    // If circuit is half-open, allow requests (but they'll be monitored closely)
    return false;
  }
  
  /**
   * Trips the circuit breaker to open state
   */
  private tripBreaker(): void {
    this.state = 'OPEN';
    console.warn('CircuitBreaker: Circuit OPEN - preventing requests');
  }
  
  /**
   * Starts the monitoring loop
   */
  private startMonitoring(): void {
    // Clear any existing interval
    if (this.monitorIntervalId) {
      clearInterval(this.monitorIntervalId);
    }
    
    // Set up a new interval
    this.monitorIntervalId = window.setInterval(async () => {
      await this.monitor();
    }, this.monitorInterval);
  }
  
  /**
   * Monitors the circuit and performs health checks
   */
  private async monitor(): Promise<void> {
    // If circuit is open and enough time has passed, try to perform a health check
    if (this.state === 'OPEN') {
      const timePassedSinceFailure = Date.now() - this.lastFailureTime;
      
      if (timePassedSinceFailure >= this.resetTimeout && this.healthCheckHandler) {
        try {
          console.info('CircuitBreaker: Performing health check...');
          const isHealthy = await this.healthCheckHandler();
          
          if (isHealthy) {
            this.state = 'HALF_OPEN';
            console.info('CircuitBreaker: Health check passed, circuit HALF_OPEN');
          } else {
            // Health check failed, keep circuit open and reset timer
            this.lastFailureTime = Date.now();
            console.warn('CircuitBreaker: Health check failed, circuit remains OPEN');
          }
        } catch (error) {
          // Health check threw an error, keep circuit open and reset timer
          this.lastFailureTime = Date.now();
          console.error('CircuitBreaker: Health check error', error);
        }
      }
    }
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.monitorIntervalId) {
      clearInterval(this.monitorIntervalId);
    }
  }
}
