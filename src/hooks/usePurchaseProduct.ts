
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { taphoammoApi } from "@/utils/api/taphoammoApi";
import { toast } from "sonner";
import { TaphoammoError, TaphoammoErrorCodes } from "@/types/taphoammo-errors";

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

  const validatePurchase = async (product: PurchaseProduct) => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua sản phẩm",
        variant: "destructive",
      });
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

    try {
      // Kiểm tra trạng thái kiosk trước khi mua
      const isActive = await taphoammoApi.checkKioskActive(product.kioskToken);
      if (!isActive) {
        toast({
          title: "Sản phẩm tạm thời không khả dụng",
          description: "Sản phẩm này hiện không thể mua. Vui lòng thử lại sau hoặc chọn sản phẩm khác.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      // Kiểm tra nếu lỗi là do kiosk không khả dụng
      if (err instanceof TaphoammoError && err.code === TaphoammoErrorCodes.API_TEMP_DOWN) {
        toast({
          title: "Sản phẩm tạm thời không khả dụng",
          description: err.message,
          variant: "destructive",
        });
        return false;
      }
      console.error("Lỗi kiểm tra kiosk:", err);
      // Tiếp tục quy trình nếu không thể kiểm tra kiosk do lỗi khác
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
      if (!userData) {
        setIsProcessing(false);
        return;
      }

      const totalCost = product.price * product.quantity;

      try {
        // Buy products from TaphoaMMO - gọi trực tiếp từ API, không qua Edge Function
        const purchaseData = await taphoammoApi.order.buyProducts(
          product.kioskToken!, 
          product.quantity
        );

        if (!purchaseData || !purchaseData.order_id) {
          throw new Error("Không nhận được order_id sau khi mua hàng");
        }

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
        const productsData = await taphoammoApi.order.getProducts(
          purchaseData.order_id
        );

        // Extract product keys safely
        let productKeys: string[] = [];
        if (productsData.data && Array.isArray(productsData.data)) {
          productKeys = productsData.data.map(item => item.product);
        }

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
            product_keys: productKeys
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
      } catch (error: any) {
        // Kiểm tra cụ thể cho lỗi kiosk không khả dụng
        if (error instanceof TaphoammoError && error.code === TaphoammoErrorCodes.API_TEMP_DOWN) {
          toast({
            title: "Sản phẩm tạm thời không khả dụng",
            description: error.message,
            variant: "destructive",
          });
          return null;
        }
        throw error;
      }

    } catch (error: any) {
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
