
import { supabase } from '@/integrations/supabase/client';
import { ProxyType, buildProxyUrl, getStoredProxy, setStoredProxy } from '@/utils/corsProxy';
import { API_CONFIG } from './config';

export class BaseApiClient {
  protected async callApi(endpoint: string, params: Record<string, string | number>, proxyType?: ProxyType): Promise<any> {
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
      const apiUrl = `${API_CONFIG.baseUrl}/${endpoint}?${queryParams.toString()}`;
      const finalUrl = buildProxyUrl(apiUrl, proxy);
      
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
      
      setStoredProxy(proxy);
      await this.logApiCall(endpoint, params, true, responseTime);
      
      return data;
    } catch (error: any) {
      await this.logApiCall(endpoint, params, false, 0, error.message);
      
      if (proxyType) {
        throw error;
      }
      
      return this.tryWithFallbackProxies(endpoint, params, proxy);
    }
  }

  private async tryWithFallbackProxies(
    endpoint: string, 
    params: Record<string, string | number>, 
    failedProxy: ProxyType
  ): Promise<any> {
    const proxyOrder: ProxyType[] = ['admin', 'allorigins', 'corsproxy.io', 'corsanywhere', 'direct'];
    const proxiesToTry = proxyOrder.filter(p => p !== failedProxy);
    
    for (const proxy of proxiesToTry) {
      try {
        const data = await this.callApi(endpoint, params, proxy);
        return data;
      } catch (error) {
        continue;
      }
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: { endpoint, params }
      });
      
      if (error) throw error;
      return data;
    } catch (serverError) {
      console.error(`[TaphoaMMO API] Edge function call failed:`, serverError);
    }
    
    throw new Error('All connection methods failed');
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
