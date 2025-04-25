
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
  success: string;
  message?: string;
  price?: string;
  name?: string;
  stock?: string;
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
  
  /**
   * Call the TaphoaMMO API through our Edge Function
   */
  const callTaphoammoAPI = async (endpoint: string, params: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          ...params,
          endpoint
        }
      });
      
      if (error) throw new Error(error.message);
      
      // Check if success is "false" (string comparison)
      if (data.success === "false") {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (err) {
      console.error(`[TaphoaMMO API] Error in ${endpoint}:`, err);
      throw err;
    }
  };
  
  /**
   * Get stock information for a specific product
   */
  const getStock = async (
    kioskToken: string, 
    userToken: string
  ): Promise<TaphoammoProduct> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await callTaphoammoAPI('getStock', {
        kioskToken,
        userToken
      });
      
      // Convert string values to proper types for TaphoammoProduct
      return {
        kiosk_token: kioskToken,
        name: response.name || '',
        stock_quantity: response.stock ? parseInt(response.stock) : 0,
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
        stock_quantity: parseInt(product.stock_quantity || '0')
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
   * Test API connection
   */
  const testConnection = async (
    kioskToken: string, 
    userToken: string
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    
    try {
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
    testConnection,
    loading,
    error
  };
};
