
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseModalHeader } from "./PurchaseModalHeader";
import { PurchaseModalProduct } from "./PurchaseModalProduct";
import { PurchaseModalInfo } from "./PurchaseModalInfo";
import { PurchaseModalActions } from "./PurchaseModalActions";
import { PurchaseResultCard } from "./PurchaseResultCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseConfirmation } from "@/hooks/usePurchaseConfirmation";
import { usePurchaseProduct } from "@/hooks/usePurchaseProduct";

interface PurchaseConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productDescription?: string;
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
  productImage,
  productDescription = "",
  quantity,
  kioskToken,
  stock = 0,
  soldCount = 0
}: PurchaseConfirmModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isProcessing, executePurchase } = usePurchaseProduct();
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [totalPrice] = useState(productPrice * quantity);
  
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
  useEffect(() => {
    if (open && kioskToken) {
      checkKioskStatus(kioskToken);
      
      // Check balance when dialog opens
      validateBalance();
    }
  }, [open, kioskToken]);

  // Validate user balance
  const validateBalance = async () => {
    if (!user) return;
    
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error("Error fetching user balance:", error);
      return;
    }
    
    setInsufficientBalance(userData.balance < totalPrice);
  };

  const handleConfirmPurchase = async () => {
    try {
      const orderId = await executePurchase({
        id: productId,
        name: productName,
        price: productPrice,
        kioskToken,
        quantity
      });
      
      if (orderId) {
        setPurchaseResult({ orderId });
        await checkOrderStatus(orderId);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setPurchaseError(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  const handleOrderComplete = () => {
    if (purchaseResult.orderId) {
      // Navigate to order complete page with order data
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
              <PurchaseModalProduct
                productName={productName}
                productImage={productImage}
                quantity={quantity}
                totalPrice={totalPrice}
              />
              
              <PurchaseModalInfo
                stock={stock}
                soldCount={soldCount}
                totalPrice={totalPrice}
                description={productDescription}
                insufficientBalance={insufficientBalance}
              />
              
              <PurchaseModalActions
                isProcessing={isProcessing || isCheckingKiosk}
                onCancel={() => onOpenChange(false)}
                onConfirm={handleConfirmPurchase}
                disabled={kioskActive === false || stock <= 0}
                insufficientBalance={insufficientBalance}
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
