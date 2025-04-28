
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { usePurchaseProduct } from "@/hooks/usePurchaseProduct";
import { PurchaseModalHeader } from "./PurchaseModalHeader";
import { PurchaseModalProduct } from "./PurchaseModalProduct";
import { PurchaseModalInfo } from "./PurchaseModalInfo";
import { PurchaseModalActions } from "./PurchaseModalActions";
import { useState } from "react";
import { toast } from "sonner";

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
  const { isProcessing, executePurchase } = usePurchaseProduct();
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handleConfirmPurchase = async () => {
    // Reset error state
    setPurchaseError(null);

    if (!kioskToken) {
      toast.error("Sản phẩm không có mã kiosk để mua");
      return;
    }

    try {
      const orderId = await executePurchase({
        id: productId,
        name: productName,
        price: productPrice,
        kioskToken,
        quantity
      });

      if (orderId) {
        onOpenChange(false);
        setTimeout(() => {
          navigate(`/dashboard/purchases`);
        }, 1000);
      } else {
        // Nếu không có order_id nhưng không có lỗi, có thể là lỗi validation
        console.log("Đơn hàng không được tạo, có thể do lỗi validation");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xử lý đơn hàng';
      setPurchaseError(errorMessage);
      
      // Hiển thị lỗi trực tiếp nếu liên quan đến kiosk
      if (errorMessage.includes('Kiosk') || errorMessage.includes('sản phẩm tạm thời')) {
        toast.error(errorMessage);
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <PurchaseModalHeader />
        
        <div className="grid gap-4 py-4">
          <PurchaseModalProduct
            productName={productName}
            productImage={productImage}
            quantity={quantity}
            totalPrice={productPrice * quantity}
          />
          
          <PurchaseModalInfo />
          
          {purchaseError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              {purchaseError}
            </div>
          )}
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
