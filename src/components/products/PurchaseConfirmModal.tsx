
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseModalHeader } from "./purchase/PurchaseModalHeader";
import { PurchaseModalProduct } from "./purchase/PurchaseModalProduct";
import { PurchaseModalInfo } from "./purchase/PurchaseModalInfo";
import { PurchaseModalActions } from "./purchase/PurchaseModalActions";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { OrderResponse, ProductsResponse } from "@/services/taphoammo/TaphoammoOrderService";

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
      
      const { data: apiResponse, error } = await supabase.functions.invoke('taphoammo-api', {
        body: JSON.stringify({
          endpoint: 'buyProducts',
          kioskToken,
          userToken: '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9',
          quantity
        })
      });
      
      if (error) {
        throw new Error(error.message);
      }

      // Type assertion for apiResponse to fix type errors
      const typedResponse = apiResponse as OrderResponse;
      
      if (!typedResponse || typedResponse.success === "false") {
        throw new Error(typedResponse?.message || typedResponse?.description || "Đã xảy ra lỗi khi mua sản phẩm");
      }

      const orderId = typedResponse.order_id;
      if (!orderId) {
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
          taphoammo_order_id: typedResponse.order_id,
          product_keys: typedResponse.product_keys || []
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
      
      let productKeys = typedResponse.product_keys || [];
      
      if (typedResponse.status === "processing" || !productKeys.length) {
        const { data: checkResult } = await supabase.functions.invoke('taphoammo-api', {
          body: JSON.stringify({
            endpoint: 'getProducts',
            orderId: typedResponse.order_id,
            userToken: '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9'
          })
        });
        
        // Type assertion for checkResult
        const typedCheckResult = checkResult as ProductsResponse;
        
        if (typedCheckResult.success === "true" && typedCheckResult.data?.length) {
          productKeys = typedCheckResult.data.map(item => item.product);
          
          const { data: orderItem } = await supabase
            .from('order_items')
            .select('id, data')
            .eq('order_id', order.id)
            .single();
          
          if (orderItem) {
            const itemData = orderItem.data as Record<string, any> || {};
            
            const updatedData = {
              kiosk_token: typeof itemData === 'object' ? itemData.kiosk_token : kioskToken,
              taphoammo_order_id: typeof itemData === 'object' ? itemData.taphoammo_order_id : typedResponse.order_id,
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
        order_id: typedResponse.order_id,
        total_amount: totalCost,
        product_keys: productKeys
      });
      
      toast({
        title: "Đặt hàng thành công",
        description: `Mã đơn hàng: ${typedResponse.order_id}`,
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

// Added import for useToast hook
import { useToast } from "@/hooks/use-toast";
