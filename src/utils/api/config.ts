
// API configuration constants
export const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9";
export const API_TIMEOUT = 10000; // Reduced timeout to 10s for better user experience

export type ProxyConfig = {
  baseUrl: string;
  userAgent: string;
  timeout: number;
  connectTimeout: number; // Added connectTimeout
};

export const API_CONFIG: ProxyConfig = {
  baseUrl: 'https://taphoammo.net/api',
  userAgent: 'Digital-Deals-Hub/1.0',
  timeout: API_TIMEOUT,
  connectTimeout: 3000 // Connect timeout is shorter
};

// API response types
export interface StockInfo {
  kiosk_token: string;
  name: string;
  stock_quantity: number;
  price: number;
  cached?: boolean;
  last_checked_at?: string;
}

export interface OrderResponse {
  success: string;
  order_id?: string;
  message?: string;
  product_keys?: string[];
  status?: string;
}

export interface ProductsResponse {
  success: string;
  data?: any[];
  description?: string;
}

// Cache configuration
export const CACHE_TTL = {
  STOCK: 5 * 60 * 1000, // 5 minutes in ms
  PRODUCTS: 30 * 60 * 1000 // 30 minutes in ms
};

// Circuit breaker configuration
export const CIRCUIT_BREAKER = {
  FAILURE_THRESHOLD: 5,
  RESET_TIMEOUT: 5 * 60 * 1000 // 5 minutes in ms
};

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  DELAY: [300, 1000, 3000] // ms - Start with smaller delays
};

// New status codes
export const API_STATUS_CODES = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
  PROCESSING: 'processing'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.',
  TIMEOUT: 'Yêu cầu API bị quá hạn. Vui lòng thử lại sau.',
  SERVER: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.',
  RATE_LIMIT: 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
  UNKNOWN: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
};
