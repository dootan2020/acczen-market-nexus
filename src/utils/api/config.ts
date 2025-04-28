
// API configuration constants
export const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9";
export const API_TIMEOUT = 15000;

export type ProxyConfig = {
  baseUrl: string;
  userAgent: string;
  timeout: number;
};

export const API_CONFIG: ProxyConfig = {
  baseUrl: 'https://taphoammo.net/api',
  userAgent: 'Digital-Deals-Hub/1.0',
  timeout: API_TIMEOUT
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
  DELAY: [1000, 3000, 5000] // ms
};
