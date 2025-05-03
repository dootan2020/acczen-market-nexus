
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { parseError } from '@/utils/errorUtils';
import { OrderData } from '@/types/orders';

interface ProductPurchaseData {
  id: string;
  name: string;
  price: number;
  kioskToken: string;
  quantity: number;
  userDiscount?: number;
}

interface PurchaseError {
  message: string;
  code?: string;
  action?: string;
}

export const usePurchaseProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<PurchaseError | null>(null);
  const { handleError } = useErrorHandler();

  const executePurchase = async (product: ProductPurchaseData): Promise<OrderData | null> => {
    if (!user) {
      toast.error('You need to be logged in to make a purchase');
      navigate('/login');
      return null;
    }

    setIsProcessing(true);
    setPurchaseError(null);

    try {
      // Calculate discount amount if applicable
      let finalPrice = product.price;
      let discountPercentage = product.userDiscount || 0;
      let discountAmount = 0;
      
      if (discountPercentage > 0) {
        discountAmount = (product.price * discountPercentage) / 100;
        finalPrice = product.price - discountAmount;
      }
      
      // Calculate total after discount
      const totalAmount = finalPrice * product.quantity;
      
      // Process transaction through Edge Function
      const { data, error } = await supabase.functions.invoke('process-transaction', {
        body: JSON.stringify({
          user_id: user.id,
          product_id: product.id,
          quantity: product.quantity,
          transaction_type: 'purchase',
          price_per_unit: finalPrice, // Use discounted price
          discount_percentage: discountPercentage,
          discount_amount: discountAmount * product.quantity,
          kiosk_token: product.kioskToken
        })
      });

      // Handle API-level errors (returned in the data object)
      if (data && typeof data === 'object' && data.success === false) {
        throw new Error(data.message || 'Error processing transaction');
      }

      if (error) {
        throw error;
      }

      // Handle unexpected response format
      if (!data || !data.success) {
        throw new Error('Invalid response format');
      }

      toast.success('Purchase successful', {
        description: `Order #${data.order_id.substring(0, 8)} has been processed`
      });

      return data;
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // Parse the error to get user-friendly message
      const errorDetails = parseError(error);
      
      setPurchaseError({
        message: errorDetails.message,
        code: errorDetails.code,
        action: errorDetails.action
      });
      
      // Show toast notification
      toast.error('Purchase error', {
        description: errorDetails.message || 'An error occurred while processing your transaction'
      });
      
      // Log error with error handler
      handleError(error, { showToast: false }); // Don't show another toast
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearError = () => setPurchaseError(null);

  return {
    isProcessing,
    purchaseError,
    executePurchase,
    clearError
  };
};
