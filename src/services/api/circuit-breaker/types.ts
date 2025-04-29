
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Trạng thái của circuit breaker
 */
export enum CircuitState {
  CLOSED = 'closed', // Bình thường, cho phép các request đi qua
  OPEN = 'open',     // Hệ thống không ổn định, không cho phép request
  HALF_OPEN = 'half-open' // Đang thử nghiệm lại hệ thống
}

/**
 * Tùy chọn cấu hình cho circuit breaker
 */
export interface CircuitBreakerOptions {
  failureThreshold?: number;  // Số lỗi tối đa trước khi mở circuit
  resetTimeout?: number;      // Thời gian đợi trước khi thử lại (ms)
  monitorInterval?: number;   // Thời gian cache trạng thái (ms)
}

/**
 * Dữ liệu sức khỏe API từ database
 */
export interface ApiHealthRecord {
  id: string;
  api_name: string;
  is_open: boolean;
  error_count: number;
  last_error: string | null;
  opened_at: string | null;
  updated_at: string;
  created_at: string;
  half_open: boolean | null;
  consecutive_success: number | null;
}

/**
 * Trạng thái đã cache của circuit
 */
export interface CachedCircuitState {
  isOpen: boolean;
  openedAt: string | null;
}

/**
 * Interface cho đối tượng lưu trữ dữ liệu circuit breaker
 */
export interface CircuitBreakerStorage {
  isOpen(): Promise<boolean>;
  recordFailure(error: Error): Promise<void>;
  recordSuccess(): Promise<void>;
  reset(): Promise<void>;
  initializeCircuitRecord(): Promise<void>;
  transitionToHalfOpen(): Promise<void>;
}
