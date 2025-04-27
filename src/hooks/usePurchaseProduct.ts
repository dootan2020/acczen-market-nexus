
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { taphoammoApi } from "@/utils/api/taphoammoApi";

interface PurchaseProduct {
  id: string;
  name: string;
  price: number;
  kioskToken: string | null;
  quantity: number;
}

export function usePurchaseProduct() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const validatePurchase = async (product: PurchaseProduct) => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua sản phẩm",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    if (!product.kioskToken) {
      toast({
        title: "Lỗi sản phẩm",
        description: "Sản phẩm không có mã kiosk để mua",
        variant: "destructive",
      });
      return false;
    }

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (userError) {
      toast({
        title: "Lỗi kiểm tra số dư",
        description: userError.message,
        variant: "destructive",
      });
      return false;
    }

    const totalCost = product.price * product.quantity;
    if (userData.balance < totalCost) {
      toast({
        title: "Số dư không đủ",
        description: `Bạn cần ${totalCost.toFixed(0)}đ nhưng chỉ có ${userData.balance.toFixed(0)}đ`,
        variant: "destructive",
      });
      return false;
    }

    return userData;
  };

  const executePurchase = async (product: PurchaseProduct) => {
    setIsProcessing(true);

    try {
      const userData = await validatePurchase(product);
      if (!userData) return;

      const totalCost = product.price * product.quantity;

      // Buy products from TaphoaMMO
      const purchaseData = await taphoammoApi.order.buyProducts(
        product.kioskToken!, 
        user!.id, 
        product.quantity,
        'direct'
      );

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          status: 'completed',
          total_amount: totalCost
        })
        .select('id')
        .single();

      if (orderError) throw new Error("Lỗi khi lưu thông tin đơn hàng");

      // Get product keys
      const { data: productsData } = await taphoammoApi.order.getProducts(
        purchaseData.order_id,
        user!.id,
        'direct'
      );

      // Save order details
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        quantity: product.quantity,
        price: product.price,
        total: totalCost,
        data: {
          kiosk_token: product.kioskToken,
          taphoammo_order_id: purchaseData.order_id,
          product_keys: productsData?.data?.map(item => item.product) || []
        }
      });

      // Update user balance
      await supabase
        .from('profiles')
        .update({ balance: userData.balance - totalCost })
        .eq('id', user!.id);

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'purchase',
        amount: -totalCost,
        description: `Mua ${product.quantity} x ${product.name}`,
        reference_id: order.id
      });

      toast({
        title: "Đặt hàng thành công",
        description: `Mã đơn hàng: ${purchaseData.order_id}`,
      });

      return order.id;

    } catch (error) {
      console.error("Lỗi mua hàng:", error);
      toast({
        title: "Lỗi đặt hàng",
        description: error instanceof Error ? error.message : "Lỗi không xác định khi mua sản phẩm",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    executePurchase
  };
}
