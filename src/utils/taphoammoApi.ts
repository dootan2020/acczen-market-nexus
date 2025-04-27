
import { supabase } from '@/integrations/supabase/client';
import { ProxyType, buildProxyUrl, getStoredProxy, setStoredProxy } from '@/utils/corsProxy';

// Default system token (for checking stock when user is not logged in)
const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9";

// Types
interface StockInfo {
  kiosk_token: string;
  name: string;
  stock_quantity: number;
  price: number;
}

interface OrderResponse {
  success: string;
  order_id?: string;
  message?: string;
  product_keys?: string[];
  status?: string;
}

interface ProductsResponse {
  success: string;
  data?: any[];
  description?: string;
}

// Taphoammo API client class
class TaphoammoApiClient {
  // Call API with the specified proxy
  async callApi(endpoint: string, params: Record<string, string | number>, proxyType?: ProxyType): Promise<any> {
    // Replace user token with system token if it's a Supabase user ID
    if (params.userToken && typeof params.userToken === 'string' && 
        params.userToken.includes('-') && params.userToken.length > 30) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[TaphoaMMO API] Using system token instead of user ID");
      }
      params.userToken = SYSTEM_TOKEN;
    }
    
    // Get the preferred proxy or use the provided one
    const proxy = proxyType || getStoredProxy();
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TaphoaMMO API] Calling ${endpoint} with proxy: ${proxy}`);
      }
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      // Construct API URL
      const apiUrl = `https://taphoammo.net/api/${endpoint}?${queryParams.toString()}`;
      
      // Apply proxy if needed
      const finalUrl = buildProxyUrl(apiUrl, proxy);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TaphoaMMO API] Final URL: ${finalUrl}`);
      }
      
      // Add timeout to avoid hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      // Make request
      const startTime = performance.now();
      const response = await fetch(finalUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Digital-Deals-Hub/1.0",
          "Accept": "application/json"
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = performance.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Get text response first for better error handling
      const responseText = await response.text();
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TaphoaMMO API] Raw response: ${responseText}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      // Check for API-level errors
      if (data.success === "false" && data.description !== "Order in processing!") {
        throw new Error(data.message || data.description || 'API returned an error');
      }
      
      // Store successful proxy for future use
      setStoredProxy(proxy);
      
      // Log successful API call
      this.logApiCall(endpoint, params, true, responseTime);
      
      return data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[TaphoaMMO API] Error with proxy ${proxy}:`, error);
      }
      
      // Log failed API call
      this.logApiCall(endpoint, params, false, 0, error.message);
      
      // If the specified proxy was provided and failed, let the caller handle it
      if (proxyType) {
        throw error;
      }
      
      // Try with a different proxy if the current one failed
      return this.tryWithFallbackProxies(endpoint, params, proxy);
    }
  }
  
  // Try fallback proxies when the primary one fails
  async tryWithFallbackProxies(endpoint: string, params: Record<string, string | number>, failedProxy: ProxyType): Promise<any> {
    // Define the order of proxies to try
    const proxyOrder: ProxyType[] = ['admin', 'allorigins', 'corsproxy.io', 'corsanywhere', 'direct'];
    
    // Filter out the failed proxy
    const proxiesToTry = proxyOrder.filter(p => p !== failedProxy);
    
    // Try each proxy in turn
    for (const proxy of proxiesToTry) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[TaphoaMMO API] Trying fallback proxy: ${proxy}`);
        }
        const data = await this.callApi(endpoint, params, proxy);
        return data;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`[TaphoaMMO API] Fallback proxy ${proxy} also failed`);
        }
        // Continue to next proxy
      }
    }
    
    // Try Edge Function as a last resort
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TaphoaMMO API] Trying server-side call with Edge Function`);
      }
      
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: { endpoint, params }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (serverError) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[TaphoaMMO API] Edge function call failed:`, serverError);
      }
    }
    
    // If all proxies fail, throw an error
    throw new Error('All connection methods failed. Vui lòng thử lại sau.');
  }
  
  // Get stock information for a product
  async getStock(kioskToken: string, userToken: string = SYSTEM_TOKEN): Promise<StockInfo> {
    try {
      const data = await this.callApi('getStock', { kioskToken, userToken: SYSTEM_TOKEN });
      
      return {
        kiosk_token: kioskToken,
        name: data.name || '',
        stock_quantity: data.stock ? parseInt(data.stock) : 0,
        price: data.price ? parseFloat(data.price) : 0
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TaphoaMMO API] Error getting stock:', error);
      }
      throw error;
    }
  }
  
  // Buy products
  async buyProducts(kioskToken: string, quantity: number, userToken: string = SYSTEM_TOKEN, promotion?: string): Promise<OrderResponse> {
    try {
      // Skip stock check and proceed directly with purchase
      if (process.env.NODE_ENV === 'development') {
        console.log('[TaphoaMMO API] Proceeding directly with purchase');
      }
      
      // Proceed with purchase
      const params: Record<string, string | number> = {
        kioskToken,
        userToken: SYSTEM_TOKEN, // Always use system token 
        quantity
      };
      
      if (promotion) {
        params.promotion = promotion;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[TaphoaMMO API] Making purchase request');
      }
      
      const data = await this.callApi('buyProducts', params);
      
      return {
        success: data.success,
        order_id: data.order_id,
        product_keys: data.product_keys,
        status: data.status || 'processing'
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TaphoaMMO API] Error buying products:', error);
      }
      throw error;
    }
  }
  
  // Get products from an order
  async getProducts(orderId: string, userToken: string = SYSTEM_TOKEN): Promise<ProductsResponse> {
    try {
      const data = await this.callApi('getProducts', { 
        orderId, 
        userToken: SYSTEM_TOKEN // Always use system token
      });
      
      return {
        success: data.success,
        data: data.data,
        description: data.description
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TaphoaMMO API] Error getting products:', error);
      }
      throw error;
    }
  }
  
  // Check order status until it's complete or max tries reached
  async checkOrderUntilComplete(orderId: string, userToken: string = SYSTEM_TOKEN, maxTries: number = 3): Promise<{
    success: boolean;
    product_keys?: string[];
    message?: string;
    data?: any[];
  }> {
    let tries = 0;
    
    while (tries < maxTries) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[TaphoaMMO API] Checking order status (attempt ${tries + 1}/${maxTries})`);
        }
        
        const result = await this.getProducts(orderId, SYSTEM_TOKEN);
        
        // If order is complete and has product data
        if (result.success === "true" && result.data && result.data.length > 0) {
          return {
            success: true,
            product_keys: result.data.map(item => item.product),
            data: result.data
          };
        }
        
        // If order is still processing, wait and retry
        if (result.success === "false" && result.description === "Order in processing!") {
          tries++;
          
          if (tries >= maxTries) {
            return {
              success: false,
              message: `Đã thử kiểm tra đơn hàng ${maxTries} lần nhưng vẫn đang xử lý`
            };
          }
          
          // Wait 2 seconds before trying again
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // Other cases
        return {
          success: result.success === "true",
          message: result.description || "Đã kiểm tra đơn hàng",
          data: result.data || []
        };
        
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`[TaphoaMMO API] Error checking order (attempt ${tries + 1}):`, error);
        }
        
        tries++;
        
        if (tries >= maxTries) {
          return {
            success: false,
            message: error.message || `Không thể kiểm tra đơn hàng sau ${maxTries} lần thử`
          };
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Should not reach here but just in case
    return {
      success: false,
      message: "Không thể kiểm tra đơn hàng"
    };
  }
  
  // Log API calls to the database for monitoring
  private async logApiCall(
    endpoint: string, 
    params: Record<string, string | number>, 
    success: boolean, 
    responseTime: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Don't log sensitive information
      const safeParams = { ...params };
      if (safeParams.userToken) {
        const token = String(safeParams.userToken);
        safeParams.userToken = token.substring(0, 5) + '...';
      }
      
      await supabase.from('api_logs').insert({
        api: 'taphoammo',
        endpoint,
        status: success ? 'success' : 'error',
        response_time: responseTime,
        details: {
          params: safeParams,
          error: errorMessage,
          proxy: getStoredProxy()
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TaphoaMMO API] Error logging API call:', error);
      }
    }
  }
}

// Create and export a singleton instance
export const taphoammoApi = new TaphoammoApiClient();
