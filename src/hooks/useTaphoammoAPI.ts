import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ApiLogInsert } from '@/types/api-logs';
import { taphoammoProxy } from '@/api/taphoammoProxy';
import { ProxyType } from '@/utils/corsProxy';

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
      // Set the state for UI feedback
      if (attempt > 0) {
        setRetry(attempt);
      }
      
      return await fn();
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        throw err;
      }
      
      // Implement exponential backoff
      const delay = RETRY_DELAYS[attempt] || 3000;
      console.log(`API call failed, retrying (${attempt + 1}/${MAX_RETRIES}) in ${delay}ms...`);
      toast.info(`API request failed. Retrying (${attempt + 1}/${MAX_RETRIES})...`);
      
      // Wait before trying again
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return withRetry(fn, attempt + 1);
    }
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

  const callTaphoammoAPI = async (endpoint: string, params: any, proxyType: ProxyType) => {
    console.log(`[TaphoaMMO API] Calling ${endpoint}:`, params);
    
    try {
      const data = await taphoammoProxy({
        endpoint: endpoint.replace('/', '') as any,
        params,
        proxyType
      });
      
      if (data.success === false) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`[TaphoaMMO API] Error in ${endpoint}:`, error);
      throw error;
    }
  };

  const buyProducts = async (
    kioskToken: string, 
    userToken: string, 
    quantity: number, 
    promotion?: string,
    proxyType: ProxyType
  ): Promise<TaphoammoOrderResponse> => {
    setLoading(true);
    setError(null);
    setRetry(0);

    try {
      const startTime = performance.now();
      console.log('Buying products with params:', { kioskToken, userToken, quantity, promotion });
      
      const data = await withRetry(async () => {
        return await callTaphoammoAPI('/buyProducts', {
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
  ): Promise<TaphoammoOrderResponse> => {
    setLoading(true);
    setError(null);
    setRetry(0);

    try {
      console.log('Getting products with params:', { orderId, userToken });
      
      const data = await withRetry(async () => {
        return await callTaphoammoAPI('/getProducts', {
          orderId,
          userToken
        }, proxyType);
      });

      setLoading(false);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in getProducts:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  };

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
        return await callTaphoammoAPI('/getStock', {
          kioskToken,
          userToken
        }, proxyType);
      });

      console.log('API connection successful, received stock data:', data);
      setLoading(false);
      return data;
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
