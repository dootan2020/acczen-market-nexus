
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { usePurchaseProduct } from "@/hooks/usePurchaseProduct";
import { PurchaseModalHeader } from "./PurchaseModalHeader";
import { PurchaseModalProduct } from "./PurchaseModalProduct";
import { PurchaseModalInfo } from "./PurchaseModalInfo";
import { PurchaseModalActions } from "./PurchaseModalActions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { taphoammoApi } from "@/utils/api/taphoammoApi";

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
  const [isCheckingKiosk, setIsCheckingKiosk] = useState<boolean>(false);
  const [kioskActive, setKioskActive] = useState<boolean | null>(null);

  // Kiểm tra trạng thái kiosk khi modal mở
  useEffect(() => {
    const checkKioskStatus = async () => {
      if (open && kioskToken) {
        try {
          setIsCheckingKiosk(true);
          const isActive = await taphoammoApi.checkKioskActive(kioskToken);
          setKioskActive(isActive);
          
          if (!isActive) {
            setPurchaseError("Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.");
          }
        } catch (error) {
          console.error("Lỗi kiểm tra kiosk:", error);
          // Không đặt lỗi ở đây để vẫn có thể tiếp tục mua hàng nếu có lỗi
        } finally {
          setIsCheckingKiosk(false);
        }
      }
    };
    
    checkKioskStatus();
  }, [open, kioskToken]);

  const handleConfirmPurchase = async () => {
    // Reset error state
    setPurchaseError(null);

    if (!kioskToken) {
      toast.error("Sản phẩm không có mã kiosk để mua");
      return;
    }

    // Nếu đã biết kiosk không khả dụng, không tiếp tục
    if (kioskActive === false) {
      toast.error("Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.");
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
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xử lý đơn hàng';
      setPurchaseError(errorMessage);
      
      // Hiển thị lỗi trực tiếp nếu liên quan đến kiosk
      if (errorMessage.includes('Kiosk') || 
          errorMessage.includes('sản phẩm tạm thời') ||
          errorMessage.includes('không khả dụng')) {
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
          
          {isCheckingKiosk && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md text-sm flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang kiểm tra tình trạng sản phẩm...
            </div>
          )}
          
          {kioskActive === false && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.
            </div>
          )}
          
          {purchaseError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              {purchaseError}
            </div>
          )}
        </div>
        
        <PurchaseModalActions
          isProcessing={isProcessing || isCheckingKiosk}
          onCancel={() => onOpenChange(false)}
          onConfirm={handleConfirmPurchase}
          disabled={kioskActive === false}
        />
      </DialogContent>
    </Dialog>
  );
};
