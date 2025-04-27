
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { usePurchaseProduct } from "@/hooks/usePurchaseProduct";
import { PurchaseModalHeader } from "./PurchaseModalHeader";
import { PurchaseModalProduct } from "./PurchaseModalProduct";
import { PurchaseModalInfo } from "./PurchaseModalInfo";
import { PurchaseModalActions } from "./PurchaseModalActions";

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

  const handleConfirmPurchase = async () => {
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
