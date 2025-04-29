
import { toast } from 'sonner';

/**
 * Quản lý thông báo cho circuit breaker
 */
export class CircuitBreakerNotificationManager {
  private notifiedUser: boolean = false;
  private apiName: string;

  /**
   * Khởi tạo notification manager 
   * @param apiName Tên API
   */
  constructor(apiName: string) {
    this.apiName = apiName;
    this.notifiedUser = false;
  }

  /**
   * Thông báo khi circuit chuyển sang trạng thái mở
   */
  public notifyCircuitOpen(): void {
    if (!this.notifiedUser) {
      toast.error(`Kết nối API ${this.apiName} không ổn định. Đang chuyển sang sử dụng dữ liệu cache.`, {
        duration: 8000,
        id: "circuit-breaker-open-notification"
      });
      this.notifiedUser = true;
    }
  }

  /**
   * Thông báo khi circuit đang mở và đang sử dụng cache
   */
  public notifyUsingCache(): void {
    if (!this.notifiedUser) {
      toast.warning(`Kết nối API ${this.apiName} tạm thời không khả dụng. Đang sử dụng dữ liệu cache.`, {
        duration: 5000,
        id: "circuit-breaker-notification"
      });
      this.notifiedUser = true;
    }
  }

  /**
   * Thông báo khi circuit chuyển sang trạng thái half-open
   */
  public notifyHalfOpen(): void {
    toast.info(`Đang thử kết nối lại với API ${this.apiName}...`, {
      duration: 3000,
      id: "circuit-half-open-notification"
    });
  }

  /**
   * Thông báo khi circuit được reset
   */
  public notifyReset(): void {
    toast.success(`Kết nối API ${this.apiName} đã được khôi phục.`, {
      duration: 3000,
      id: "circuit-reset-notification"
    });
  }

  /**
   * Reset trạng thái đã thông báo
   */
  public resetNotificationState(): void {
    this.notifiedUser = false;
  }

  /**
   * Kiểm tra xem đã thông báo chưa
   */
  public hasNotified(): boolean {
    return this.notifiedUser;
  }
}
