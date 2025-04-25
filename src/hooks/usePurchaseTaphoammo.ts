
import { useState } from 'react';
import { useTaphoammoAPI } from './useTaphoammoAPI';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getStoredProxy } from '@/utils/corsProxy';

interface PurchaseOptions {
  kioskToken: string;
  quantity: number;
  promotion?: string;
}

interface PurchaseResult {
  success: boolean;
  orderId?: string;
  productKeys?: string[];
  message?: string;
  error?: string;
}

// Max time to poll for order status (ms)
const MAX_POLL_TIME = 60000; // 1 minute
// Poll interval (ms)
const POLL_INTERVAL = 5000; // 5 seconds

export const usePurchaseTaphoammo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [pollCount, setPollCount] = useState(0);
  const { buyProducts, getProducts } = useTaphoammoAPI();
  const { user } = useAuth();

  const purchase = async ({ kioskToken, quantity, promotion }: PurchaseOptions): Promise<PurchaseResult> => {
    if (!user) {
      toast.error('User must be logged in to make a purchase');
      return { success: false, error: 'User not authenticated' };
    }

    setIsProcessing(true);
    setOrderId(null);
    setProductKeys([]);
    setPollCount(0);

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

      // If status is not completed, start polling
      if (data.status === 'processing' && data.order_id) {
        startPollingOrderStatus(data.order_id);
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

  const startPollingOrderStatus = async (orderIdToCheck: string) => {
    // Set initial polling time
    let startTime = Date.now();
    let timerId: number | undefined;

    const pollFunction = async () => {
      try {
        // Check if we've exceeded the maximum poll time
        if (Date.now() - startTime > MAX_POLL_TIME) {
          clearInterval(timerId);
          toast.error('Order processing timed out. Please check your order status in your dashboard.');
          return;
        }

        setPollCount(prev => prev + 1);
        const result = await pollOrderStatus(orderIdToCheck);
        
        // If we got keys or a final status, stop polling
        if (
          (result.productKeys && result.productKeys.length > 0) || 
          (result.status && ['completed', 'failed', 'cancelled'].includes(result.status))
        ) {
          clearInterval(timerId);
          
          if (result.status === 'failed' || result.status === 'cancelled') {
            toast.error(`Order ${result.status}: Please contact support if your balance was deducted.`);
          } else if (result.productKeys?.length) {
            toast.success('Product keys received!');
          }
        }
      } catch (error) {
        console.error('Error polling order status:', error);
        // Don't stop polling on error, just log it
      }
    };

    // Start polling
    timerId = setInterval(pollFunction, POLL_INTERVAL) as unknown as number;
    
    // Run once immediately
    pollFunction();
  };

  const pollOrderStatus = async (orderIdToCheck: string) => {
    if (!user || !orderIdToCheck) {
      return { success: false, error: 'Missing user or order ID' };
    }

    try {
      // Fix: Add the required proxyType argument
      const proxyType = getStoredProxy();
      const response = await getProducts(orderIdToCheck, user.id, proxyType);
      
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
    }
  };

  return {
    purchase,
    pollOrderStatus,
    isProcessing,
    orderId,
    productKeys,
    pollCount
  };
};
