
import { useState } from 'react';
import { useTaphoammoAPI } from './useTaphoammoAPI';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PurchaseOptions {
  kioskToken: string;
  quantity: number;
  promotion?: string;
}

export const usePurchaseTaphoammo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const { buyProducts, getProducts } = useTaphoammoAPI();
  const { user } = useAuth();

  const purchase = async ({ kioskToken, quantity, promotion }: PurchaseOptions) => {
    if (!user) {
      toast.error('User must be logged in to make a purchase');
      return { success: false, error: 'User not authenticated' };
    }

    setIsProcessing(true);
    setOrderId(null);
    setProductKeys([]);

    try {
      const userToken = user.id;
      
      // Call the edge function to process the order
      const { data, error } = await supabase.functions.invoke('process-taphoammo-order', {
        body: {
          kioskToken,
          userToken,
          quantity,
          promotion
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.message || 'Failed to process order');
      }

      setOrderId(data.order_id);
      
      if (data.product_keys && data.product_keys.length > 0) {
        setProductKeys(data.product_keys);
      }

      return {
        success: true, 
        orderId: data.order_id,
        productKeys: data.product_keys || [],
        message: data.message
      };
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during purchase');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const pollOrderStatus = async (orderId: string) => {
    if (!user || !orderId) return;

    setIsProcessing(true);
    try {
      const response = await getProducts(orderId, user.id);
      
      if (response.product_keys && response.product_keys.length > 0) {
        setProductKeys(response.product_keys);
        return {
          success: true,
          productKeys: response.product_keys,
          status: response.status
        };
      }
      
      return {
        success: true,
        productKeys: [],
        status: response.status || 'processing'
      };
    } catch (error) {
      console.error('Error polling order status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    purchase,
    pollOrderStatus,
    isProcessing,
    orderId,
    productKeys
  };
};
