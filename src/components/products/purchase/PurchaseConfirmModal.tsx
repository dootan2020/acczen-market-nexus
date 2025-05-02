
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseModalHeader } from "./PurchaseModalHeader";
import { PurchaseModalProductSimple } from "./PurchaseModalProductSimple";
import { PurchaseModalActions } from "./PurchaseModalActions";
import { PurchaseResultCard } from "./PurchaseResultCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseConfirmation } from "@/hooks/usePurchaseConfirmation";
import { useSecureTransaction } from "@/hooks/useSecureTransaction";
import { Input } from "@/components/ui/input";

interface PurchaseConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  kioskToken: string | null;
  stock?: number;
  soldCount?: number;
}

export const PurchaseConfirmModal = ({
  open,
  onOpenChange,
  productId,
  productName,
  productPrice,
  quantity: initialQuantity,
  kioskToken,
  stock = 0
}: PurchaseConfirmModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading: isProcessing, processPurchase } = useSecureTransaction();
  const [quantity, setQuantity] = useState(initialQuantity);
  
  const { 
    purchaseResult,
    setPurchaseResult,
    purchaseError,
    setPurchaseError,
    isCheckingKiosk,
    kioskActive,
    isCheckingOrder,
    checkKioskStatus,
    checkOrderStatus,
    resetPurchase,
  } = usePurchaseConfirmation();

  // Check kiosk status when dialog opens
  React.useEffect(() => {
    if (open && kioskToken) {
      checkKioskStatus(kioskToken);
    }
  }, [open, kioskToken]);

  const totalPrice = productPrice * quantity;

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!user) {
      toast.error("You need to be logged in to make a purchase");
      navigate('/login');
      return;
    }
    
    try {
      const result = await processPurchase(productId, quantity);
      
      if (result && result.order_id) {
        setPurchaseResult({ 
          orderId: result.order_id,
          productKeys: result.product_keys
        });
        
        if (result.product_keys && result.product_keys.length > 0) {
          toast.success('Purchase successful!', {
            description: `Your order #${result.order_id} is complete`
          });
        } else {
          await checkOrderStatus(result.order_id);
        }
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setPurchaseError(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  const handleOrderComplete = () => {
    if (purchaseResult.orderId) {
      navigate('/order-complete', {
        state: {
          orderData: {
            id: purchaseResult.orderId,
            items: [
              {
                name: productName,
                quantity: quantity,
                price: productPrice,
                total: totalPrice
              }
            ],
            total: totalPrice,
            digital_items: purchaseResult.productKeys ? [
              {
                name: productName,
                keys: purchaseResult.productKeys
              }
            ] : []
          }
        }
      });
      onOpenChange(false);
      resetPurchase();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <PurchaseModalHeader />
        
        <div className="grid gap-4 py-4">
          {!purchaseResult.orderId ? (
            <>
              <PurchaseModalProductSimple
                productName={productName}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
                unitPrice={productPrice}
                totalPrice={totalPrice}
                stock={stock}
              />
              
              {purchaseError && (
                <div className="text-sm text-red-500 mt-2">
                  {purchaseError}
                </div>
              )}
              
              <PurchaseModalActions
                isProcessing={isProcessing || isCheckingKiosk}
                onCancel={() => onOpenChange(false)}
                onConfirm={handleConfirmPurchase}
                disabled={kioskActive === false || stock <= 0}
                isNewDesign={true}
              />
            </>
          ) : (
            <PurchaseResultCard
              orderId={purchaseResult.orderId}
              productKeys={purchaseResult.productKeys}
              isCheckingOrder={isCheckingOrder}
              onCheckOrder={() => checkOrderStatus(purchaseResult.orderId)}
              onReset={resetPurchase}
              onClose={handleOrderComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
