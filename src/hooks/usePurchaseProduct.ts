
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { parseError } from '@/utils/errorUtils';

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

  const executePurchase = async (product: ProductPurchaseData) => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để mua hàng');
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
      
      // Process transaction
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
        throw new Error(data.message || 'Lỗi xử lý giao dịch');
      }

      if (error) {
        throw error;
      }

      // Handle unexpected response format
      if (!data || !data.success) {
        throw new Error('Định dạng phản hồi không hợp lệ');
      }

      toast.success('Mua hàng thành công', {
        description: `Đơn hàng #${data.order_id} đã được xử lý`
      });

      return data.order_id;
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
      toast.error('Lỗi mua hàng', {
        description: errorDetails.message || 'Có lỗi xảy ra khi xử lý giao dịch'
      });
      
      // Log error with error handler
      handleError(error, { showToast: false }); // Don't show another toast
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    purchaseError,
    executePurchase,
    clearError: () => setPurchaseError(null)
  };
};
