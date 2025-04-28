
// API configuration settings
export const API_CONFIG = {
  baseUrl: "https://taphoammo.net/api",
  userAgent: "Digital-Deals-Hub/1.0",
  timeout: 10000, // 10 seconds timeout
};

// Fixed system token for API calls
export const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9";

// Response types
export interface StockResponse {
  success: string;
  name: string;
  stock_quantity: number;
  price: number;
  description?: string;
}

export interface OrderResponse {
  success: string;
  order_id: string;
  product_keys?: string[];
  message?: string;
  description?: string;
}

export interface ProductsResponse {
  success: string;
  data?: Array<{
    id: string;
    product: string;
  }>;
  message?: string;
  description?: string;
}

export interface TaphoammoProduct {
  name?: string;
  stock_quantity: number;
  price: number;
  cached?: boolean;
  cacheId?: string;
  emergency?: boolean;
}
