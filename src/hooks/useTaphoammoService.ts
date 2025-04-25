
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TaphoammoProduct {
  name: string;
  price: number;
  stock_quantity: number;
  kiosk_token: string;
}

interface TaphoammoResponse {
  success: string; // "true" or "false" (string)
  message?: string;
  price?: string;
  name?: string;
  stock?: string;
  order_id?: string;
  products?: Array<{
    id: string;
    name: string;
    price: string;
    stock_quantity: string;
    [key: string]: any;
  }>;
}

export const useTaphoammoService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const MAX_RETRIES = 2;
  
  /**
   * Validate input parameters
   */
  const validateParams = (params: {
    kioskToken?: string;
    userToken?: string;
    orderId?: string;
  }) => {
    if (params.kioskToken && params.kioskToken.trim() === '') {
      throw new Error('Kiosk Token cannot be empty');
    }
    if (params.userToken && params.userToken.trim() === '') {
      throw new Error('User Token cannot be empty');
    }
    if (params.orderId && params.orderId.trim() === '') {
      throw new Error('Order ID cannot be empty');
    }
  };
  
  /**
   * Call the TaphoaMMO API through our Edge Function
   */
  const callTaphoammoAPI = async (endpoint: string, params: any) => {
    try {
      console.log(`[TaphoammoService] Calling ${endpoint} with params:`, params);
      
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          ...params,
          endpoint
        }
      });
      
      if (error) {
        console.error(`[TaphoammoService] Supabase function error:`, error);
        throw new Error(`API request failed: ${error.message}`);
      }
      
      console.log(`[TaphoammoService] Response from ${endpoint}:`, data);
      
      // Check if success is "false" (string comparison)
      if (data.success === "false") {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (err) {
      console.error(`[TaphoammoService] Error in ${endpoint}:`, err);
      throw err;
    }
  };
  
  /**
   * Get stock information for a specific product with retry logic
   */
  const getStock = async (
    kioskToken: string, 
    userToken: string
  ): Promise<TaphoammoProduct> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate input parameters
      validateParams({ kioskToken, userToken });
      
      // Try to call the API with retry logic
      let response;
      try {
        response = await callTaphoammoAPI('getStock', {
          kioskToken,
          userToken
        });
      } catch (error) {
        // If we haven't reached max retries, try again
        if (retry < MAX_RETRIES) {
          setRetry(retry + 1);
          console.log(`Retry attempt ${retry + 1} of ${MAX_RETRIES}`);
          throw error; // Re-throw to be caught by outer catch
        }
        // If we've reached max retries, reset and propagate error
        setRetry(0);
        throw error;
      }
      
      // Reset retry counter on success
      setRetry(0);
      
      // Validate response structure
      if (!response.name || !response.price || !response.stock) {
        throw new Error('Invalid response format from API');
      }
      
      // Convert string values to proper types for TaphoammoProduct
      return {
        kiosk_token: kioskToken,
        name: response.name || '',
        stock_quantity: response.stock ? parseInt(response.stock, 10) : 0,
        price: response.price ? parseFloat(response.price) : 0
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get all available products
   */
  const getProducts = async (
    kioskToken: string, 
    userToken: string
  ): Promise<TaphoammoProduct[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate input parameters
      validateParams({ kioskToken, userToken });
      
      const response = await callTaphoammoAPI('getProducts', {
        kioskToken,
        userToken
      });
      
      if (!response.products || !Array.isArray(response.products)) {
        return [];
      }
      
      // Convert data to proper format
      return response.products.map(product => ({
        kiosk_token: kioskToken,
        name: product.name || '',
        price: parseFloat(product.price || '0'),
        stock_quantity: parseInt(product.stock_quantity || '0', 10)
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buy products from TaphoaMMO
   */
  const buyProducts = async (
    kioskToken: string,
    userToken: string,
    quantity: number,
    promotion?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate input parameters
      validateParams({ kioskToken, userToken });
      
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      const response = await callTaphoammoAPI('buyProducts', {
        kioskToken,
        userToken,
        quantity,
        ...(promotion ? { promotion } : {})
      });
      
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Test API connection
   */
  const testConnection = async (
    kioskToken: string, 
    userToken: string
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate input parameters
      validateParams({ kioskToken, userToken });
      
      const data = await getStock(kioskToken, userToken);
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
    getStock,
    getProducts,
    buyProducts,
    testConnection,
    loading,
    error,
    retry,
    maxRetries: MAX_RETRIES
  };
};
