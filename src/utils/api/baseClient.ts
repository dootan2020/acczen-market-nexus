import { supabase } from '@/integrations/supabase/client';
import { ProxyType } from '@/utils/corsProxy';
import { API_CONFIG } from './config';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

// Luôn sử dụng AllOrigins làm proxy mặc định
const ALLORIGINS_PROXY = "https://api.allorigins.win/raw?url=";

export class BaseApiClient {
  protected async callApi(endpoint: string, params: Record<string, string | number>): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TaphoaMMO API] Calling ${endpoint} with params:`, params);
      }
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      // Construct API URL with AllOrigins proxy
      const apiUrl = `${API_CONFIG.baseUrl}/${endpoint}?${queryParams.toString()}`;
      const proxyUrl = ALLORIGINS_PROXY + encodeURIComponent(apiUrl);
      
      // Add timeout to avoid hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": API_CONFIG.userAgent,
          "Accept": "application/json"
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      // Handle specific error cases
      if (data.success === "false") {
        if (data.description === "Order in processing!" || 
            data.message === "Order in processing!") {
          return data; // Return as-is for processing orders
        }
        
        if (data.message === "Kiosk is pending!" || 
            data.description === "Kiosk is pending!" ||
            data.message?.includes("pending") ||
            data.description?.includes("pending")) {
          throw new TaphoammoError(
            "Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.",
            TaphoammoErrorCodes.KIOSK_PENDING
          );
        }
        
        throw new Error(data.message || data.description || 'API returned an error');
      }
      
      return data;
    } catch (error: any) {
      console.error(`[TaphoaMMO API] Error in ${endpoint}:`, error);
      throw error;
    }
  }
}
