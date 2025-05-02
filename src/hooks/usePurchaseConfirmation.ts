
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PurchaseResult {
  orderId?: string;
  productKeys?: string[];
}

export function usePurchaseConfirmation() {
  const [isCheckingKiosk, setIsCheckingKiosk] = useState(false);
  const [kioskActive, setKioskActive] = useState<boolean | undefined>(undefined);
  const [isCheckingOrder, setIsCheckingOrder] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult>({});
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Check if a product's kiosk token is active
  const checkKioskStatus = async (kioskToken: string) => {
    setIsCheckingKiosk(true);
    
    try {
      // Check if product exists and has stock
      const { data, error } = await supabase.functions.invoke('check-kiosk-status', {
        body: JSON.stringify({ kioskToken })
      });

      if (error) {
        throw new Error(error.message);
      }

      setKioskActive(data.active);
      
      if (!data.active) {
        toast.error('This product is currently unavailable');
      }
      
      return data.active;
    } catch (error) {
      console.error('Error checking kiosk status:', error);
      setKioskActive(false);
      return false;
    } finally {
      setIsCheckingKiosk(false);
    }
  };

  // Check the status of an order and retrieve product keys if available
  const checkOrderStatus = async (orderId: string) => {
    if (!orderId) return;
    
    setIsCheckingOrder(true);
    
    try {
      // Call the edge function to check order status
      const { data, error } = await supabase.functions.invoke('check-order-status', {
        body: JSON.stringify({ orderId })
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.product_keys && data.product_keys.length > 0) {
        setPurchaseResult(prev => ({
          ...prev,
          productKeys: data.product_keys
        }));
        
        toast.success('Order completed successfully');
      } else if (data.success === false) {
        // Order is still processing
        toast.info('Your order is still processing. Please wait or check again later.');
      }
      
      return data;
    } catch (error) {
      console.error('Error checking order status:', error);
      toast.error('Failed to check order status');
      return null;
    } finally {
      setIsCheckingOrder(false);
    }
  };

  // Reset all state
  const resetPurchase = () => {
    setPurchaseResult({});
    setPurchaseError(null);
    setKioskActive(undefined);
  };

  return {
    isCheckingKiosk,
    kioskActive,
    isCheckingOrder,
    purchaseResult,
    setPurchaseResult,
    purchaseError,
    setPurchaseError,
    checkKioskStatus,
    checkOrderStatus,
    resetPurchase
  };
}
