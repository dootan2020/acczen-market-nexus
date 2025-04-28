
import { supabase } from '@/integrations/supabase/client';
import { ProxyType } from '@/utils/corsProxy';
import { API_CONFIG } from './config';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

// Luôn sử dụng AllOrigins làm proxy mặc định
const ALLORIGINS_PROXY = "https://api.allorigins.win/raw?url=";

export class BaseApiClient {
  protected async callApi(endpoint: string, params: Record<string, string | number>, proxyType?: ProxyType): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TaphoaMMO API] Calling ${endpoint} with params:`, params);
      }
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      // Construct API URL
      const apiUrl = `${API_CONFIG.baseUrl}/${endpoint}?${queryParams.toString()}`;
      
      // Luôn sử dụng AllOrigins proxy
      const finalUrl = ALLORIGINS_PROXY + encodeURIComponent(apiUrl);
      
      // Add timeout to avoid hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const startTime = performance.now();
      const response = await fetch(finalUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": API_CONFIG.userAgent,
          "Accept": "application/json"
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = performance.now() - startTime;
      
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
      
      if (data.success === "false") {
        // Xử lý đặc biệt cho trường hợp "Order in processing!"
        if (data.description === "Order in processing!") {
          console.log("[TaphoaMMO API] Order in processing, returning data");
          await this.logApiCall(endpoint, params, true, responseTime);
          return data;
        }
        
        // Xử lý đặc biệt cho trường hợp "Kiosk is pending!"
        if (data.message === "Kiosk is pending!" || data.description === "Kiosk is pending!") {
          throw new TaphoammoError(
            "Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.",
            TaphoammoErrorCodes.API_TEMP_DOWN,
            0,
            responseTime
          );
        }
        
        throw new Error(data.message || data.description || 'API returned an error');
      }
      
      await this.logApiCall(endpoint, params, true, responseTime);
      
      return data;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TaphoaMMO API] Error in ${endpoint}:`, errorMessage);
      
      await this.logApiCall(endpoint, params, false, 0, errorMessage);
      
      throw error;
    }
  }

  private async logApiCall(
    endpoint: string,
    params: Record<string, string | number>,
    success: boolean,
    responseTime: number,
    errorMessage?: string
  ): Promise<void> {
    try {
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
          proxy: 'allorigins' 
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TaphoaMMO API] Error logging API call:', error);
      }
    }
  }
}
