
import { supabase } from '@/integrations/supabase/client';
import { ProxyType } from '@/utils/corsProxy';
import { API_CONFIG } from './config';

const ALLORIGINS_PROXY = "https://api.allorigins.win/raw?url=";

export class BaseApiClient {
  protected async callApi(endpoint: string, params: Record<string, string | number>, proxyType?: ProxyType): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TaphoaMMO API] Calling ${endpoint}`);
      }
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      // Construct API URL
      const apiUrl = `${API_CONFIG.baseUrl}/${endpoint}?${queryParams.toString()}`;
      
      // Use AllOrigins proxy by default
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
      
      if (data.success === "false" && data.description !== "Order in processing!") {
        throw new Error(data.message || data.description || 'API returned an error');
      }
      
      await this.logApiCall(endpoint, params, true, responseTime);
      
      return data;
    } catch (error: any) {
      await this.logApiCall(endpoint, params, false, 0, error.message);
      
      // If AllOrigins proxy failed, try Edge Function as fallback
      return this.tryWithEdgeFunction(endpoint, params);
    }
  }

  private async tryWithEdgeFunction(
    endpoint: string, 
    params: Record<string, string | number>
  ): Promise<any> {
    console.log('[TaphoaMMO API] AllOrigins failed, trying Edge Function');
    
    try {
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: { endpoint, params }
      });
      
      if (error) throw error;
      return data;
    } catch (serverError) {
      console.error(`[TaphoaMMO API] Edge function call failed:`, serverError);
      throw new Error('All connection methods failed');
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
          proxy: 'allorigins' // Using fixed value instead of getStoredProxy()
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TaphoaMMO API] Error logging API call:', error);
      }
    }
  }
}
