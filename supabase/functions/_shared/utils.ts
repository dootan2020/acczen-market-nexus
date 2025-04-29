
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create authenticated Supabase client using the Function's env
export const createServerSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Constants
export const TAPHOAMMO_USER_TOKEN = '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9';
export const TAPHOAMMO_API_BASE = 'https://taphoammo.net/api';

// Typings for API responses
export interface StockResponse {
  success: string;
  name?: string;
  stock_quantity?: number;
  price?: number;
  message?: string;
  description?: string;
}

export interface OrderResponse {
  success: string;
  order_id?: string;
  product_keys?: string[];
  message?: string;
  description?: string;
  status?: string;
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

// Error handling
export class TaphoammoError extends Error {
  public code: string;
  public retries: number;
  public responseTime: number;
  
  constructor(message: string, code: string, retries = 0, responseTime = 0) {
    super(message);
    this.name = 'TaphoammoError';
    this.code = code;
    this.retries = retries;
    this.responseTime = responseTime;
    
    // This is necessary for proper instanceof checks with custom error types
    Object.setPrototypeOf(this, TaphoammoError.prototype);
  }
}

export const TAPHOAMMO_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNEXPECTED_RESPONSE: 'UNEXPECTED_RESPONSE',
  RATE_LIMIT: 'RATE_LIMIT',
  KIOSK_PENDING: 'KIOSK_PENDING',
  API_TEMP_DOWN: 'API_TEMP_DOWN'
};

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<{ result: T; retries: number; responseTime: number }> {
  let retries = 0;
  let lastError: any;
  let startTime = Date.now();
  
  while (retries <= maxRetries) {
    try {
      const result = await fn();
      return { 
        result, 
        retries, 
        responseTime: Date.now() - startTime 
      };
    } catch (error) {
      lastError = error;
      
      // Don't retry certain errors
      if (
        error instanceof TaphoammoError && 
        (error.code === TAPHOAMMO_ERROR_CODES.KIOSK_PENDING || 
         error.code === TAPHOAMMO_ERROR_CODES.API_TEMP_DOWN)
      ) {
        break;
      }
      
      if (retries >= maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
      
      // Reset start time for accurate response time calculation
      startTime = Date.now();
    }
  }
  
  throw lastError || new TaphoammoError(
    'Maximum retries exceeded',
    TAPHOAMMO_ERROR_CODES.NETWORK_ERROR,
    retries,
    Date.now() - startTime
  );
}

// Helper function to call Taphoammo API with error handling
export async function callTaphoammoApi<T>(
  endpoint: string,
  params: Record<string, string | number>,
  options: { timeout?: number } = {}
): Promise<T> {
  const { timeout = 15000 } = options;
  
  // Build query string
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  const url = `${TAPHOAMMO_API_BASE}/${endpoint}?${queryParams.toString()}`;
  
  try {
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DigitalDealsHub/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for HTTP errors
    if (!response.ok) {
      if (response.status === 429) {
        throw new TaphoammoError(
          'Rate limit exceeded',
          TAPHOAMMO_ERROR_CODES.RATE_LIMIT,
          0,
          Date.now() - startTime
        );
      }
      
      throw new TaphoammoError(
        `HTTP error ${response.status}`,
        TAPHOAMMO_ERROR_CODES.API_ERROR,
        0,
        Date.now() - startTime
      );
    }
    
    // Parse response
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new TaphoammoError(
        `Invalid JSON response: ${text.substring(0, 100)}...`,
        TAPHOAMMO_ERROR_CODES.UNEXPECTED_RESPONSE,
        0,
        Date.now() - startTime
      );
    }
    
    // Handle API errors in the response
    if (data.success === "false") {
      // Handle the special case where the order is already processing
      if (data.message === "Order in processing!" || 
          data.description === "Order in processing!") {
        return data as T;
      }
      
      // Handle kiosk pending errors
      if (data.message === "Kiosk is pending!" || 
          data.description === "Kiosk is pending!") {
        throw new TaphoammoError(
          'Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau.',
          TAPHOAMMO_ERROR_CODES.KIOSK_PENDING,
          0,
          Date.now() - startTime
        );
      }
      
      throw new TaphoammoError(
        data.message || data.description || 'Unknown API error',
        TAPHOAMMO_ERROR_CODES.API_ERROR,
        0,
        Date.now() - startTime
      );
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof TaphoammoError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new TaphoammoError(
        'Request timed out',
        TAPHOAMMO_ERROR_CODES.TIMEOUT,
        0,
        timeout
      );
    }
    
    throw new TaphoammoError(
      error.message || 'Network error',
      TAPHOAMMO_ERROR_CODES.NETWORK_ERROR,
      0,
      0
    );
  }
}

// Log API requests to database for monitoring
export async function logApiRequest(
  supabase: any,
  api: string,
  endpoint: string,
  status: string,
  details: any = {},
  responseTime?: number
) {
  try {
    await supabase.from('api_logs').insert({
      api,
      endpoint,
      status,
      details,
      response_time: responseTime
    });
  } catch (error) {
    // Just log the error, don't throw it to avoid breaking the main flow
    console.error('Failed to log API request:', error);
  }
}

// Record API errors for circuit breaker pattern
export async function recordApiFailure(
  supabase: any,
  api: string,
  error: any
) {
  try {
    // Get current API health state
    const { data: healthData } = await supabase
      .from('api_health')
      .select('*')
      .eq('api_name', api)
      .single();
      
    if (healthData) {
      // Increment error count and update last error
      await supabase
        .from('api_health')
        .update({
          error_count: healthData.error_count + 1,
          last_error: error.message || 'Unknown error',
          is_open: healthData.error_count + 1 >= 5, // Open circuit after 5 errors
          opened_at: healthData.error_count + 1 >= 5 ? new Date().toISOString() : healthData.opened_at
        })
        .eq('api_name', api);
    } else {
      // Create new health record
      await supabase
        .from('api_health')
        .insert({
          api_name: api,
          error_count: 1,
          last_error: error.message || 'Unknown error',
          is_open: false
        });
    }
  } catch (dbError) {
    console.error('Failed to record API failure:', dbError);
  }
}

// Reset API health state after successful request
export async function resetApiHealth(
  supabase: any,
  api: string
) {
  try {
    await supabase
      .from('api_health')
      .update({
        error_count: 0,
        last_error: null,
        is_open: false,
        opened_at: null
      })
      .eq('api_name', api);
  } catch (error) {
    console.error('Failed to reset API health:', error);
  }
}

// Check if circuit is open before making API call
export async function checkCircuitBreaker(
  supabase: any,
  api: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('api_health')
      .select('is_open, opened_at')
      .eq('api_name', api)
      .single();
      
    if (data?.is_open) {
      // If circuit has been open for more than 5 minutes, allow a test request
      if (data.opened_at) {
        const openedAt = new Date(data.opened_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - openedAt.getTime()) / (1000 * 60);
        
        if (diffMinutes > 5) {
          return false; // Allow a test request
        }
      }
      
      return true; // Circuit is open, prevent request
    }
    
    return false; // Circuit is closed, allow request
  } catch (error) {
    console.error('Failed to check circuit breaker:', error);
    return false; // Default to allowing request if check fails
  }
}

// Format log data for better readability
export function formatLogData(data: any): any {
  if (!data) return null;
  
  // For security, don't log sensitive data
  if (data.userToken) {
    data = { ...data, userToken: '***REDACTED***' };
  }
  
  return data;
}
