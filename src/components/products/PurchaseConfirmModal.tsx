
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/formatters";
import { usePurchaseProduct } from "@/hooks/usePurchaseProduct";

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
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const { isProcessing, executePurchase } = usePurchaseProduct();

  const handlePurchase = async () => {
    // Direct purchase through the purchase product hook
    const orderId = await executePurchase({
      id: productId,
      name: productName,
      price: productPrice,
      kioskToken,
      quantity
    });

    if (orderId) {
      // Close the modal
      onOpenChange(false);
      
      // Navigate to order completion page
      navigate(`/order-complete`, {
        state: {
          orderData: {
            id: orderId,
            items: [{
              name: productName,
              price: convertVNDtoUSD(productPrice),
              quantity: quantity,
              total: convertVNDtoUSD(productPrice * quantity)
            }],
            total: convertVNDtoUSD(productPrice * quantity),
            payment_method: 'Account Balance'
          }
        }
      });
    }
  };

  const handleGoToCheckout = () => {
    onOpenChange(false);
    navigate('/checkout', { 
      state: { 
        product: {
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          quantity: quantity,
          kiosk_token: kioskToken
        },
        quantity: quantity
      } 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận mua sản phẩm</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn mua sản phẩm này?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 my-4">
          <img 
            src={productImage} 
            alt={productName} 
            className="w-20 h-20 object-cover rounded"
          />
          <div>
            <h3 className="font-medium">{productName}</h3>
            <p className="text-sm text-muted-foreground">
              Số lượng: {quantity}
            </p>
            <p className="text-primary font-bold mt-1">
              {formatUSD(convertVNDtoUSD(productPrice * quantity))}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:mr-auto"
          >
            Hủy
          </Button>
          <Button
            variant="outline"
            onClick={handleGoToCheckout}
          >
            Tùy chọn thanh toán
          </Button>
          <Button 
            onClick={handlePurchase} 
            disabled={isProcessing}
            className="bg-[#F97316] hover:bg-[#EA580C]"
          >
            {isProcessing ? "Đang xử lý..." : "Mua ngay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
