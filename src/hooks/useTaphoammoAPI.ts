
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  status?: string;  // Added the status property
}

export const useTaphoammoAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyProducts = async (
    kioskToken: string, 
    userToken: string, 
    quantity: number, 
    promotion?: string
  ): Promise<TaphoammoOrderResponse> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('mock-taphoammo', {
        body: JSON.stringify({
          kioskToken,
          userToken,
          quantity,
          promotion
        })
      });

      if (error) throw error;

      setLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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

    try {
      const { data, error } = await supabase.functions.invoke('mock-taphoammo', {
        body: JSON.stringify({
          orderId,
          userToken
        })
      });

      if (error) throw error;

      setLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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

    try {
      const { data, error } = await supabase.functions.invoke('mock-taphoammo', {
        body: JSON.stringify({
          kioskToken,
          userToken
        })
      });

      if (error) throw error;

      setLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      throw err;
    }
  };

  return {
    buyProducts,
    getProducts,
    getStock,
    loading,
    error
  };
};
