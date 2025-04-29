
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ApiHealthRecord, CircuitBreakerStorage } from './types';

/**
 * Adapter lưu trữ circuit breaker data trong Supabase
 */
export class SupabaseCircuitBreakerStorage implements CircuitBreakerStorage {
  private apiName: string;
  private failureThreshold: number;
  private lastStatusCheck: number = 0;
  private cachedState: { isOpen: boolean; openedAt: string | null } | null = null;
  private monitorInterval: number;
  
  /**
   * Khởi tạo storage adapter
   * @param apiName Tên của API được giám sát
   * @param failureThreshold Số lỗi trước khi mở circuit
   * @param monitorInterval Thời gian cache trạng thái (ms)
   */
  constructor(apiName: string, failureThreshold: number, monitorInterval: number) {
    this.apiName = apiName;
    this.failureThreshold = failureThreshold;
    this.monitorInterval = monitorInterval;
  }

  /**
   * Kiểm tra nếu circuit đang mở
   */
  public async isOpen(): Promise<boolean> {
    try {
      // Sử dụng trạng thái đã cache nếu còn mới
      const now = Date.now();
      if (this.cachedState && now - this.lastStatusCheck < this.monitorInterval) {
        return this.cachedState.isOpen;
      }

      // Lấy trạng thái hiện tại từ database
      const { data: apiHealth, error } = await supabase
        .from('api_health')
        .select('*')
        .eq('api_name', this.apiName)
        .single();
        
      if (error || !apiHealth) {
        // Khởi tạo bản ghi circuit breaker nếu chưa tồn tại
        await this.initializeCircuitRecord();
        this.cachedState = { isOpen: false, openedAt: null };
        this.lastStatusCheck = now;
        return false;
      }
        
      // Cập nhật cache và trả về trạng thái
      this.cachedState = { 
        isOpen: apiHealth.is_open, 
        openedAt: apiHealth.opened_at 
      };
      this.lastStatusCheck = now;
      return apiHealth.is_open;
    } catch (err) {
      console.error('Error checking circuit breaker state:', err);
      return false; // Mặc định là đóng nếu không thể kiểm tra
    }
  }

  /**
   * Ghi nhận lỗi trong circuit breaker
   */
  public async recordFailure(error: Error): Promise<void> {
    try {
      // Lấy số lỗi hiện tại
      const { data: apiHealth } = await supabase
        .from('api_health')
        .select('error_count, is_open, opened_at')
        .eq('api_name', this.apiName)
        .single();
        
      if (!apiHealth) {
        await this.initializeCircuitRecord();
        return;
      }
      
      // Tăng số lỗi
      const newErrorCount = (apiHealth.error_count || 0) + 1;
      
      // Kiểm tra xem có nên mở circuit
      const shouldOpenCircuit = newErrorCount >= this.failureThreshold && !apiHealth.is_open;
      const openedAt = shouldOpenCircuit ? new Date().toISOString() : (apiHealth.opened_at || null);
      
      // Cập nhật bản ghi database
      await supabase
        .from('api_health')
        .update({
          error_count: newErrorCount,
          last_error: error.message,
          is_open: shouldOpenCircuit || apiHealth.is_open,
          opened_at: openedAt,
          updated_at: new Date().toISOString()
        })
        .eq('api_name', this.apiName);

      // Ghi log lỗi
      await supabase.from('api_logs').insert({
        api: this.apiName,
        endpoint: 'circuit_breaker',
        status: 'error',
        details: {
          error: error.message,
          circuit_opened: shouldOpenCircuit
        }
      });
      
      // Xóa cache
      this.cachedState = null;
    } catch (err) {
      console.error('Error recording failure in circuit breaker:', err);
    }
  }

  /**
   * Ghi nhận thành công trong trạng thái half-open
   */
  public async recordSuccess(): Promise<void> {
    try {
      // Lấy trạng thái hiện tại
      const { data, error } = await supabase
        .from('api_health')
        .select('half_open, consecutive_success')
        .eq('api_name', this.apiName)
        .single();
      
      // Xử lý lỗi database hoặc bản ghi không tồn tại
      if (error || !data) {
        console.error('Error fetching circuit state:', error);
        return; 
      }
      
      // Truy cập an toàn các thuộc tính sau khi kiểm tra kiểu
      const healthRecord = data as ApiHealthRecord;
      
      if (!healthRecord.half_open) {
        return; // Chỉ tăng số lần thành công trong trạng thái half-open
      }
      
      // Tăng số lần thành công liên tiếp
      const newSuccessCount = (healthRecord.consecutive_success || 0) + 1;
      
      // Cập nhật số lần thành công liên tiếp
      await supabase
        .from('api_health')
        .update({
          consecutive_success: newSuccessCount,
          updated_at: new Date().toISOString()
        })
        .eq('api_name', this.apiName);
      
      // Nếu đủ số lần thành công liên tiếp, reset circuit
      if (newSuccessCount >= 3) { // 3 lần thành công liên tiếp để đóng circuit
        await this.reset();
      }
    } catch (err) {
      console.error('Error recording success in circuit breaker:', err);
    }
  }

  /**
   * Reset circuit breaker sau khi gọi API thành công
   */
  public async reset(): Promise<void> {
    try {
      // Kiểm tra xem chúng ta đã ở trạng thái mở chưa
      let wasOpen = false;
      
      try {
        const { data } = await supabase
          .from('api_health')
          .select('is_open')
          .eq('api_name', this.apiName)
          .single();
          
        // Chỉ thông báo khi chuyển từ trạng thái mở sang đóng
        wasOpen = !!data?.is_open;
      } catch (err) {
        console.error('Error checking circuit state:', err);
      }
      
      // Reset trạng thái circuit
      await supabase
        .from('api_health')
        .update({
          is_open: false,
          half_open: false,
          error_count: 0,
          opened_at: null,
          consecutive_success: 0,
          updated_at: new Date().toISOString()
        })
        .eq('api_name', this.apiName);
      
      // Xóa trạng thái đã cache
      this.cachedState = null;
      
      // Ghi log reset circuit
      await supabase.from('api_logs').insert({
        api: this.apiName,
        endpoint: 'circuit_breaker',
        status: 'reset',
        details: {
          message: 'Circuit breaker reset'
        }
      });
      
      // Thông báo cho người dùng nếu trước đó ở trạng thái mở
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
   * Chuyển circuit sang trạng thái half-open để thử lại
   */
  public async transitionToHalfOpen(): Promise<void> {
    try {
      // Cập nhật database trực tiếp
      await supabase
        .from('api_health')
        .update({
          is_open: false,
          half_open: true,
          consecutive_success: 0,
          updated_at: new Date().toISOString()
        })
        .eq('api_name', this.apiName);
        
      // Ghi log chuyển đổi
      await supabase.from('api_logs').insert({
        api: this.apiName,
        endpoint: 'circuit_breaker',
        status: 'half_open',
        details: {
          message: 'Transitioning to half-open state to test recovery'
        }
      });
      
      // Thông báo cho người dùng
      toast.info("Đang thử kết nối lại với API...", {
        duration: 3000,
        id: "circuit-half-open-notification"
      });
    } catch (err) {
      console.error('Error transitioning to half-open state:', err);
    }
  }

  /**
   * Khởi tạo bản ghi circuit breaker nếu chưa tồn tại
   */
  public async initializeCircuitRecord(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('api_health')
        .insert({
          api_name: this.apiName,
          is_open: false,
          half_open: false,
          error_count: 0,
          consecutive_success: 0,
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
