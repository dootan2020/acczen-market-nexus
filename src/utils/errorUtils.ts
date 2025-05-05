
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

export interface ErrorDetails {
  message: string;
  code?: string;
  statusCode?: number;
  technical?: string;
  action?: string;
}

/**
 * Parse error object from any source into a standardized format
 */
export function parseError(error: unknown): ErrorDetails {
  // Handle TaphoammoError
  if (error instanceof TaphoammoError) {
    return parseTaphoammoError(error);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message || 'Đã xảy ra lỗi không xác định',
      technical: error.stack,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
    };
  }

  // Handle Supabase errors or other objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: String(error.message),
      code: ('code' in error) ? String(error.code) : undefined,
      statusCode: ('status' in error) ? Number(error.status) : undefined,
      technical: JSON.stringify(error),
    };
  }

  // Default fallback
  return {
    message: 'Đã xảy ra lỗi không xác định',
    technical: error ? JSON.stringify(error) : 'Unknown error',
  };
}

/**
 * Parse TaphoammoError into user-friendly messages
 */
function parseTaphoammoError(error: TaphoammoError): ErrorDetails {
  const baseMessage = error.message;
  let userMessage = 'Đã xảy ra lỗi khi xử lý yêu cầu.';
  let action = 'Vui lòng thử lại sau.';
  
  switch (error.code) {
    case TaphoammoErrorCodes.INSUFFICIENT_FUNDS:
      userMessage = 'Số dư tài khoản không đủ để thực hiện giao dịch này.';
      action = 'Vui lòng nạp thêm tiền vào tài khoản của bạn.';
      break;
    
    case TaphoammoErrorCodes.STOCK_UNAVAILABLE:
      userMessage = 'Sản phẩm hiện không còn hàng.';
      action = 'Vui lòng thử lại sau hoặc chọn sản phẩm khác.';
      break;
    
    case TaphoammoErrorCodes.INVALID_CREDENTIALS:
      userMessage = 'Thông tin xác thực không hợp lệ.';
      action = 'Vui lòng kiểm tra lại thông tin đăng nhập.';
      break;
    
    case TaphoammoErrorCodes.API_TEMP_DOWN:
      userMessage = 'Dịch vụ tạm thời không khả dụng.';
      action = 'Vui lòng thử lại sau vài phút.';
      break;
      
    case TaphoammoErrorCodes.NETWORK_ERROR:
      userMessage = 'Lỗi kết nối mạng.';
      action = 'Vui lòng kiểm tra kết nối internet của bạn và thử lại.';
      break;
      
    case TaphoammoErrorCodes.TIMEOUT:
      userMessage = 'Yêu cầu đã hết thời gian.';
      action = 'Kết nối mạng có thể chậm. Vui lòng thử lại.';
      break;
      
    case TaphoammoErrorCodes.RATE_LIMIT:
      userMessage = 'Quá nhiều yêu cầu trong thời gian ngắn.';
      action = 'Vui lòng đợi một chút trước khi thử lại.';
      break;
  }

  return {
    message: userMessage,
    technical: baseMessage,
    code: error.code,
    action: action
  };
}

/**
 * Get standardized error message for form validation errors
 */
export function getValidationErrorMessage(field: string): string {
  const fieldMessages: Record<string, string> = {
    email: 'Email không hợp lệ',
    password: 'Mật khẩu phải có ít nhất 8 ký tự',
    name: 'Tên không được để trống',
    phone: 'Số điện thoại không hợp lệ',
    amount: 'Số tiền không hợp lệ',
    quantity: 'Số lượng không hợp lệ'
  };
  
  return fieldMessages[field] || `${field} không hợp lệ`;
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoffFactor?: number;
    retryCondition?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffFactor = 1.5,
    retryCondition = () => true
  } = options;

  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries || !retryCondition(error)) {
        throw error;
      }
      
      const waitTime = delay * Math.pow(backoffFactor, retries);
      retries++;
      
      console.log(`Retry attempt ${retries}/${maxRetries} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
