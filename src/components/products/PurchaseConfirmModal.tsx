
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useTaphoammoAPI } from "@/hooks/useTaphoammoAPI";
import { PurchaseModalHeader } from "./purchase/PurchaseModalHeader";
import { PurchaseModalProduct } from "./purchase/PurchaseModalProduct";
import { PurchaseModalInfo } from "./purchase/PurchaseModalInfo";
import { PurchaseModalActions } from "./purchase/PurchaseModalActions";

interface PurchaseConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  kioskToken: string | null;
}

export const PurchaseConfirmModal = ({
  open,
  onOpenChange,
  productId,
  productName,
  productPrice,
  productImage,
  quantity,
  kioskToken
}: PurchaseConfirmModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const { buyProducts, getProducts } = useTaphoammoAPI();

  const sendOrderConfirmationEmail = async (userId: string, orderData: any) => {
    try {
      const response = await supabase.functions.invoke('send-notification-email', {
        body: {
          user_id: userId,
          template: 'order_confirmation',
          data: {
            order_id: orderData.order_id,
            date: new Date().toISOString(),
            total: convertVNDtoUSD(orderData.total_amount || productPrice * quantity),
            payment_method: 'Account Balance',
            items: [
              {
                name: productName,
                quantity: quantity,
                price: convertVNDtoUSD(productPrice),
                total: convertVNDtoUSD(productPrice * quantity)
              }
            ],
            digital_items: orderData.product_keys?.length ? [
              {
                name: productName,
                keys: orderData.product_keys
              }
            ] : []
          }
        }
      });

      if (!response.data?.success) {
        console.error("Failed to send order confirmation email:", response.error);
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua sản phẩm",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!kioskToken) {
      toast({
        title: "Lỗi sản phẩm",
        description: "Sản phẩm không có mã kiosk để mua",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('balance, username')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        throw new Error("Không thể kiểm tra số dư: " + userError.message);
      }
      
      const totalCost = productPrice * quantity;
      
      if (userData.balance < totalCost) {
        const totalCostUSD = convertVNDtoUSD(totalCost);
        const balanceUSD = convertVNDtoUSD(userData.balance);
        throw new Error(`Số dư không đủ. Bạn cần ${formatUSD(totalCostUSD)} nhưng chỉ có ${formatUSD(balanceUSD)}`);
      }
      
      const orderData = await buyProducts(kioskToken, user.id, quantity, 'direct');
      
      if (!orderData.order_id) {
        throw new Error("Không nhận được mã đơn hàng từ API");
      }
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'completed',
          total_amount: totalCost
        })
        .select('id')
        .single();
      
      if (orderError) {
        throw new Error("Lỗi khi lưu thông tin đơn hàng");
      }
      
      const orderItemData = {
        order_id: order.id,
        product_id: productId,
        quantity: quantity,
        price: productPrice,
        total: totalCost,
        data: {
          kiosk_token: kioskToken,
          taphoammo_order_id: orderData.order_id,
          product_keys: orderData.product_keys || []
        }
      };
      
      await supabase.from('order_items').insert(orderItemData);
      
      const newBalance = userData.balance - totalCost;
      await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);
      
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'purchase',
          amount: -totalCost,
          description: `Mua ${quantity} x ${productName}`,
          reference_id: order.id
        });
      
      let productKeys = orderData.product_keys || [];
      
      if (orderData.status === "processing" || !productKeys.length) {
        // Fix: Added the missing 'direct' proxyType parameter
        const checkResult = await getProducts(orderData.order_id, user.id, 'direct');
        
        if (checkResult.success === "true" && checkResult.data?.length) {
          productKeys = checkResult.data.map(item => item.product);
          
          const { data: orderItem } = await supabase
            .from('order_items')
            .select('id, data')
            .eq('order_id', order.id)
            .single();
          
          if (orderItem) {
            const itemData = orderItem.data as Record<string, any> || {};
            
            const updatedData = {
              kiosk_token: typeof itemData === 'object' ? itemData.kiosk_token : kioskToken,
              taphoammo_order_id: typeof itemData === 'object' ? itemData.taphoammo_order_id : orderData.order_id,
              product_keys: productKeys
            };
            
            await supabase
              .from('order_items')
              .update({ data: updatedData })
              .eq('id', orderItem.id);
          }
        }
      }
      
      await sendOrderConfirmationEmail(user.id, {
        order_id: orderData.order_id,
        total_amount: totalCost,
        product_keys: productKeys
      });
      
      toast({
        title: "Đặt hàng thành công",
        description: `Mã đơn hàng: ${orderData.order_id}`,
      });
      
      setTimeout(() => {
        navigate(`/dashboard/purchases`);
      }, 1000);
      
    } catch (error) {
      console.error("Lỗi mua hàng:", error);
      
      toast({
        title: "Lỗi đặt hàng",
        description: error instanceof Error ? error.message : "Lỗi không xác định khi mua sản phẩm",
        variant: "destructive",
      });
      
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
    }
  };

  const totalPriceVND = productPrice * quantity;
  const totalPriceUSD = convertVNDtoUSD(totalPriceVND);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <PurchaseModalHeader />
        
        <div className="grid gap-4 py-4">
          <PurchaseModalProduct
            productName={productName}
            productImage={productImage}
            quantity={quantity}
            totalPriceUSD={totalPriceUSD}
            formatUSD={formatUSD}
          />
          
          <PurchaseModalInfo />
        </div>
        
        <PurchaseModalActions
          isProcessing={isProcessing}
          onCancel={() => onOpenChange(false)}
          onConfirm={handleConfirmPurchase}
        />
      </DialogContent>
    </Dialog>
  );
};
