
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useOrderOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const purchaseProduct = async (kioskToken: string, quantity: number) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the Edge Function for order processing
      const { data, error } = await supabase.functions.invoke('process-taphoammo-order', {
        body: JSON.stringify({
          action: 'purchase',
          kioskToken,
          quantity,
          userId: user.id
        })
      });

      if (error) throw new Error(error.message);
      
      if (!data.success) {
        throw new Error(data.message || 'Purchase failed');
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in purchaseProduct:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderKeys = async (orderId: string) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    setLoading(true);
    setError(null);

    try {
      // Call the Edge Function to get order keys
      const { data, error } = await supabase
        .from('order_items')
        .select('data')
        .eq('order_id', orderId)
        .single();
      
      if (error) throw error;
      
      if (!data || !data.data || !data.data.product_keys) {
        throw new Error('Order keys not found');
      }

      return data.data.product_keys;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching order keys:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    purchaseProduct,
    fetchOrderKeys,
    loading,
    error
  };
};
