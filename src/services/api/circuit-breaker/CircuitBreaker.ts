
import { CircuitBreakerOptions, CircuitState } from './types';
import { SupabaseCircuitBreakerStorage } from './storage-adapter';
import { CircuitBreakerNotificationManager } from './notification-manager';

/**
 * CircuitBreaker ngăn chặn lỗi dây chuyền bằng cách dừng việc gọi API
 * khi dịch vụ bên ngoài không ổn định.
 * 
 * Nó triển khai ba trạng thái:
 * - CLOSED: Hoạt động bình thường, các request đi qua
 * - OPEN: Dịch vụ được coi là không khả dụng, các request thất bại nhanh chóng
 * - HALF_OPEN: Kiểm tra xem dịch vụ đã phục hồi chưa
 */
export class CircuitBreaker {
  private apiName: string;
  private failureThreshold: number;
  private resetTimeout: number;
  private monitorInterval: number;
  private storage: SupabaseCircuitBreakerStorage;
  private notificationManager: CircuitBreakerNotificationManager;

  constructor(options: CircuitBreakerOptions = {}) {
    this.apiName = 'taphoammo'; // API mặc định
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeout = options.resetTimeout || 60000; // 1 phút mặc định
    this.monitorInterval = options.monitorInterval || 10000; // 10 giây

    // Khởi tạo các thành phần
    this.storage = new SupabaseCircuitBreakerStorage(
      this.apiName, 
      this.failureThreshold,
      this.monitorInterval
    );
    this.notificationManager = new CircuitBreakerNotificationManager(this.apiName);
  }

  /**
   * Kiểm tra nếu circuit hiện đang mở
   */
  public async isOpen(): Promise<boolean> {
    try {
      const isCircuitOpen = await this.storage.isOpen();
      
      if (isCircuitOpen) {
        // Thông báo cho người dùng khi circuit đang mở
        this.notificationManager.notifyUsingCache();
        
        // Kiểm tra xem có nên chuyển sang trạng thái half-open
        await this.checkTransitionToHalfOpen();
      } else {
        // Reset trạng thái thông báo khi circuit đóng
        this.notificationManager.resetNotificationState();
      }
      
      return isCircuitOpen;
    } catch (err) {
      console.error('Error checking circuit breaker state:', err);
      return false;
    }
  }

  /**
   * Kiểm tra xem có nên chuyển sang trạng thái half-open
   */
  private async checkTransitionToHalfOpen(): Promise<void> {
    // TODO: Implement logic to check if enough time has passed to transition to half-open
  }

  /**
   * Ghi nhận lỗi trong circuit breaker
   */
  public async recordFailure(error: Error): Promise<void> {
    try {
      await this.storage.recordFailure(error);
    } catch (err) {
      console.error('Error recording failure in circuit breaker:', err);
    }
  }

  /**
   * Ghi nhận thành công khi ở trạng thái half-open
   */
  public async recordSuccess(): Promise<void> {
    try {
      await this.storage.recordSuccess();
    } catch (err) {
      console.error('Error recording success in circuit breaker:', err);
    }
  }

  /**
   * Reset circuit breaker sau khi gọi thành công
   */
  public async reset(): Promise<void> {
    try {
      await this.storage.reset();
      this.notificationManager.resetNotificationState();
    } catch (err) {
      console.error('Error resetting circuit breaker:', err);
    }
  }

  /**
   * Chuyển circuit sang trạng thái half-open để kiểm tra phục hồi
   */
  private async transitionToHalfOpen(): Promise<void> {
    try {
      await this.storage.transitionToHalfOpen();
      this.notificationManager.notifyHalfOpen();
    } catch (err) {
      console.error('Error transitioning to half-open state:', err);
    }
  }

  /**
   * Khởi tạo bản ghi circuit breaker nếu chưa tồn tại
   */
  private async initializeCircuitRecord(): Promise<void> {
    try {
      await this.storage.initializeCircuitRecord();
    } catch (err) {
      console.error('Error initializing circuit breaker record:', err);
    }
  }
  
  /**
   * Thiết lập tên API mà circuit breaker giám sát
   * @param apiName Tên API cần giám sát
   */
  public setApiName(apiName: string): void {
    this.apiName = apiName;
  }
}

// Export enum trạng thái circuit để sử dụng bên ngoài
export { CircuitState, CircuitBreakerOptions } from './types';
