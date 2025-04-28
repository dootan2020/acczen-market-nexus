
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseModalHeader } from "./PurchaseModalHeader";
import { PurchaseModalProduct } from "./PurchaseModalProduct";
import { PurchaseModalInfo } from "./PurchaseModalInfo";
import { PurchaseModalActions } from "./PurchaseModalActions";
import { PurchaseResultCard } from "./PurchaseResultCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseConfirmation } from "@/hooks/usePurchaseConfirmation";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    purchaseResult,
    setPurchaseResult,
    isProcessing,
    setIsProcessing,
    purchaseError,
    setPurchaseError,
    isCheckingKiosk,
    kioskActive,
    isCheckingOrder,
    checkKioskStatus,
    checkOrderStatus,
    resetPurchase,
  } = usePurchaseConfirmation();

  useEffect(() => {
    if (open && kioskToken) {
      checkKioskStatus(kioskToken);
    }
  }, [open, kioskToken]);

  const handleConfirmPurchase = async () => {
    if (!kioskToken) {
      toast.error("Sản phẩm không có mã kiosk để mua");
      return;
    }
    
    if (!user) {
      toast.error("Bạn cần đăng nhập để mua sản phẩm");
      navigate("/login");
      return;
    }

    try {
      setIsProcessing(true);
      setPurchaseError(null);
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        throw new Error("Không thể kiểm tra số dư: " + userError.message);
      }
      
      const totalCost = productPrice * quantity;
      
      if (userData.balance < totalCost) {
        throw new Error(`Số dư không đủ. Bạn cần ${totalCost.toLocaleString()} VND nhưng chỉ có ${userData.balance.toLocaleString()} VND`);
      }

      const { data: orderData, error } = await supabase.functions.invoke('taphoammo-api', {
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
      
      const apiResponse = orderData as { success?: string; message?: string; description?: string; order_id?: string };
      
      if (!apiResponse || apiResponse.success === "false") {
        throw new Error(apiResponse?.message || apiResponse?.description || "Đã xảy ra lỗi khi mua sản phẩm");
      }

      const orderId = apiResponse.order_id;
      if (!orderId) {
        throw new Error("Không nhận được mã đơn hàng từ API");
      }
      
      setPurchaseResult({ orderId });
      
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
      
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: productId,
        quantity: quantity,
        price: productPrice,
        total: totalCost,
        data: {
          kiosk_token: kioskToken,
          taphoammo_order_id: orderId
        }
      });
      
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
      
      await checkOrderStatus(orderId);
      
      toast.success("Đặt hàng thành công!");

    } catch (error) {
      console.error("Lỗi mua hàng:", error);
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xử lý đơn hàng';
      toast.error(errorMessage);
      setPurchaseError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <PurchaseModalHeader />
        
        <div className="grid gap-4 py-4">
          {!purchaseResult.orderId ? (
            <>
              <PurchaseModalProduct
                productName={productName}
                productImage={productImage}
                quantity={quantity}
                totalPrice={productPrice * quantity}
              />
              <PurchaseModalInfo />
              
              <PurchaseModalActions
                isProcessing={isProcessing || isCheckingKiosk}
                onCancel={() => onOpenChange(false)}
                onConfirm={handleConfirmPurchase}
                disabled={kioskActive === false}
              />
              
              {purchaseError && (
                <div className="text-sm text-red-500 mt-2">
                  {purchaseError}
                </div>
              )}
            </>
          ) : (
            <PurchaseResultCard
              orderId={purchaseResult.orderId}
              productKeys={purchaseResult.productKeys}
              isCheckingOrder={isCheckingOrder}
              onCheckOrder={checkOrderStatus}
              onReset={resetPurchase}
              onClose={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
