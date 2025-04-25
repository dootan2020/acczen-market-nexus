
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ApiLogInsert } from '@/types/api-logs';

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
const RETRY_DELAYS = [1000, 3000]; // Retry delays in milliseconds

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

  // Call the TaphoaMMO API through our Edge Function
  const callTaphoammoAPI = async (endpoint: string, params: any) => {
    const { data, error } = await supabase.functions.invoke('sync-taphoammo-api', {
      body: JSON.stringify({
        endpoint,
        params
      })
    });

    if (error) throw new Error(error.message);
    if (data.success === 'false' || data.success === false) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  };

  const buyProducts = async (
    kioskToken: string, 
    userToken: string, 
    quantity: number, 
    promotion?: string
  ): Promise<TaphoammoOrderResponse> => {
    setLoading(true);
    setError(null);
    setRetry(0);

    try {
      const startTime = performance.now();
      const data = await withRetry(async () => {
        return await callTaphoammoAPI('/buyProducts', {
          kioskToken,
          userToken,
          quantity,
          promotion
        });
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
      const startTime = performance.now();
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      
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
    userToken: string
  ): Promise<TaphoammoOrderResponse> => {
    setLoading(true);
    setError(null);
    setRetry(0);

    try {
      const data = await withRetry(async () => {
        return await callTaphoammoAPI('/getProducts', {
          orderId,
          userToken
        });
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

  const getStock = async (
    kioskToken: string, 
    userToken: string
  ): Promise<TaphoammoProduct> => {
    setLoading(true);
    setError(null);
    setRetry(0);

    try {
      const data = await withRetry(async () => {
        return await callTaphoammoAPI('/getStock', {
          kioskToken,
          userToken
        });
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

  return {
    buyProducts,
    getProducts,
    getStock,
    loading,
    error,
    retry,
    maxRetries: MAX_RETRIES
  };
};
