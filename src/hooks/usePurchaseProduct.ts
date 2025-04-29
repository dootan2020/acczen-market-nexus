
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProductPurchaseData {
  id: string;
  name: string;
  price: number;
  kioskToken: string;
  quantity: number;
  userDiscount?: number;
}

export const usePurchaseProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const executePurchase = async (product: ProductPurchaseData) => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để mua hàng');
      navigate('/login');
      return null;
    }

    setIsProcessing(true);

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

      if (error || !data.success) {
        throw new Error(error?.message || data?.message || 'Lỗi xử lý giao dịch');
      }

      toast.success('Mua hàng thành công', {
        description: `Đơn hàng #${data.order_id} đã được xử lý`
      });

      return data.order_id;
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      toast.error('Lỗi mua hàng', {
        description: error?.message || 'Có lỗi xảy ra khi xử lý giao dịch'
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    executePurchase
  };
};
