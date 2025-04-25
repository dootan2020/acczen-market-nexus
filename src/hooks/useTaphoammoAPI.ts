
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ApiLogInsert } from '@/types/api-logs';
import { ProxyType, buildProxyUrl } from '@/utils/corsProxy';

interface TaphoammoProduct {
  kiosk_token: string;
  name: string;
  stock_quantity: number;
  price: number;
}

interface TaphoammoOrderResponse {
  success: string;
  order_id?: string;
  message?: string;
  product_keys?: string[];
  status?: string;
}

interface TaphoammoResponse {
  success: string;
  price?: string;
  name?: string;
  stock?: string;
  order_id?: string;
  message?: string;
  products?: Array<{
    id: string;
    name: string;
    price: string;
    stock_quantity: string;
    [key: string]: any;
  }>;
}

// Configuration
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 3000];

export const useTaphoammoAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // Helper function to perform a function with retry
  const withRetry = async <T,>(
    fn: () => Promise<T>,
    attempt = 0
  ): Promise<T> => {
    try {
      if (attempt > 0) {
        setRetry(attempt);
      }
      
      return await fn();
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        throw err;
      }
      
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      console.log(`API call failed, retrying (${attempt + 1}/${MAX_RETRIES}) in ${delay}ms...`);
      toast.info(`API request failed. Retrying (${attempt + 1}/${MAX_RETRIES})...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return withRetry(fn, attempt + 1);
    }
  };

  const validateResponse = (data: TaphoammoResponse): boolean => {
    if (!data || typeof data.success !== 'string') {
      return false;
    }
    
    if (data.products) {
      return Array.isArray(data.products);
    }
    
    return true;
  };

  const logApiCall = async (logData: ApiLogInsert) => {
    try {
      const { error } = await supabase
        .from('api_logs')
        .insert(logData);
        
      if (error) console.error('Failed to log API call:', error);
    } catch (e) {
      console.error('Error logging API call:', e);
    }
  };

  // Add direct API call with CORS proxy when needed
  const callDirectAPI = async (
    endpoint: string,
    params: Record<string, string | number>,
    proxyType: ProxyType
  ): Promise<any> => {
    try {
      // Build the query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      // Construct the API URL
      let apiUrl = `https://taphoammo.net/api/${endpoint}?${queryParams.toString()}`;
      
      // Apply CORS proxy if needed
      if (proxyType !== 'direct') {
        apiUrl = buildProxyUrl(apiUrl, proxyType);
      }
      
      console.log(`[Direct API Call] Using ${proxyType} to call: ${apiUrl}`);
      
      // Make the request
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success === "false") {
        throw new Error(data.message || 'API returned an error');
      }
      
      return data;
    } catch (error) {
      console.error(`[Direct API Call] Error:`, error);
      throw error;
    }
  };

  // Edge function API call
  const callEdgeFunction = async (
    endpoint: string, 
    params: Record<string, string | number>
  ): Promise<any> => {
    try {
      console.log(`[Edge Function] Calling ${endpoint} with params:`, params);
      
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          ...params,
          endpoint
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.success === "false") {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`[Edge Function] Error in ${endpoint}:`, error);
      throw error;
    }
  };

  // This function replaces the taphoammoProxy function that was in the deleted file
  const callTaphoammoAPI = async (endpoint: string, params: any, proxyType: ProxyType) => {
    if (proxyType === 'admin') {
      // Use Edge Function
      return callEdgeFunction(endpoint, params);
    } else {
      // Use direct call with optional proxy
      return callDirectAPI(endpoint, params, proxyType);
    }
  };

  const buyProducts = async (
    kioskToken: string, 
    userToken: string, 
    quantity: number,
    proxyType: ProxyType,
    promotion?: string
  ): Promise<TaphoammoOrderResponse> => {
    setLoading(true);
    setError(null);
    setRetry(0);

    try {
      const startTime = performance.now();
      console.log('Buying products with params:', { kioskToken, userToken, quantity, promotion });
      
      const data = await withRetry(async () => {
        return await callTaphoammoAPI('buyProducts', {
          kioskToken,
          userToken,
          quantity,
          promotion
        }, proxyType);
      });

      await logApiCall({
        api: 'taphoammo',
        endpoint: 'buy',
        status: 'success',
        response_time: performance.now() - startTime,
        details: {
          kioskToken,
          quantity,
          orderId: data.order_id
        }
      });

      setLoading(false);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in buyProducts:', errorMsg);
      
      const startTime = performance.now();
      await logApiCall({
        api: 'taphoammo',
        endpoint: 'buy',
        status: 'error',
        response_time: performance.now() - startTime,
        details: {
          error: errorMsg,
          kioskToken,
          quantity
        }
      });
      
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  };

  const getProducts = async (
    orderId: string, 
    userToken: string,
    proxyType: ProxyType
  ): Promise<TaphoammoResponse> => {
    setLoading(true);
    setError(null);
    setRetry(0);

    try {
      const data = await withRetry(async () => {
        const response = await callTaphoammoAPI('getProducts', { 
          orderId, 
          userToken 
        }, proxyType);
        
        if (!validateResponse(response)) {
          throw new Error('Invalid response format');
        }
        
        return response;
      });

      setLoading(false);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  };

  // Fix: Ensure getStock returns a TaphoammoProduct by converting string values to numbers
  const getStock = async (
    kioskToken: string, 
    userToken: string,
    proxyType: ProxyType
  ): Promise<TaphoammoProduct> => {
    setLoading(true);
    setError(null);
    setRetry(0);

    console.log('Checking API connection with params:', { kioskToken, userToken });

    try {
      const data = await withRetry(async () => {
        return await callTaphoammoAPI('getStock', {
          kioskToken,
          userToken
        }, proxyType);
      });

      console.log('API connection successful, received stock data:', data);
      setLoading(false);
      
      // Convert string values to proper types for TaphoammoProduct
      return {
        kiosk_token: kioskToken,
        name: data.name || '',
        stock_quantity: data.stock ? parseInt(data.stock) : 0,
        price: data.price ? parseFloat(data.price) : 0
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in getStock:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  };
  
  const testConnection = async (
    kioskToken: string, 
    userToken: string,
    proxyType: ProxyType
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getStock(kioskToken, userToken, proxyType);
      return { 
        success: true, 
        message: `Connection successful - Found: ${data.name} (Stock: ${data.stock_quantity})` 
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return { 
        success: false, 
        message: `Connection failed: ${errorMsg}` 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    buyProducts,
    getProducts,
    getStock,
    testConnection,
    loading,
    error,
    retry,
    maxRetries: MAX_RETRIES
  };
};
