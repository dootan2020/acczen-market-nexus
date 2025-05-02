
import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseProduct } from "@/hooks/usePurchaseProduct";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProductQuantity from "../ProductQuantity";
import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface PurchaseConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  kioskToken: string | null;
  stock: number;
}

export const PurchaseConfirmModal = ({
  open,
  onOpenChange,
  productId,
  productName,
  productPrice,
  productImage,
  quantity: initialQuantity,
  kioskToken,
  stock,
}: PurchaseConfirmModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isProcessing, purchaseError, executePurchase } = usePurchaseProduct();
  const [quantity, setQuantity] = useState(initialQuantity.toString());
  const { formatUSD } = useCurrencyContext();
  
  // Reset quantity when modal opens with new initialQuantity
  useEffect(() => {
    if (open) {
      setQuantity(initialQuantity.toString());
    }
  }, [initialQuantity, open]);

  const numericQuantity = useMemo(() => parseInt(quantity) || 1, [quantity]);
  const maxQuantity = useMemo(() => Math.min(10, stock), [stock]);
  
  const totalPrice = useMemo(() => 
    productPrice * numericQuantity, 
    [productPrice, numericQuantity]
  );
  
  const handleBuy = async () => {
    if (!user) {
      toast.error('You need to be logged in to make a purchase');
      navigate('/login');
      return;
    }
    
    if (numericQuantity <= 0) {
      toast.error('Please select a valid quantity');
      return;
    }
    
    if (numericQuantity > stock) {
      toast.error(`Sorry, only ${stock} items available in stock`);
      return;
    }

    if (!kioskToken) {
      toast.error('Product is not available for purchase');
      return;
    }

    const orderData = {
      id: productId,
      name: productName,
      price: productPrice,
      kioskToken: kioskToken,
      quantity: numericQuantity
    };

    const orderId = await executePurchase(orderData);
    
    if (orderId) {
      onOpenChange(false);
      navigate(`/order/${orderId}`);
    }
  };
  
  const hasInsufficientFunds = user?.balance !== undefined && totalPrice > user.balance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader className="relative border-b pb-4">
          <DialogTitle className="text-2xl font-semibold">Purchase Confirmation</DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Product Information */}
          <div>
            <h3 className="text-xl font-medium mb-2">{productName}</h3>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <ProductQuantity
              value={quantity}
              onChange={setQuantity}
              maxQuantity={maxQuantity}
              disabled={isProcessing || stock <= 0}
            />
          </div>

          {/* Price Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Unit Price:</p>
              <p className="font-medium">{formatUSD(productPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total:</p>
              <p className="font-semibold text-lg text-green-600">{formatUSD(totalPrice)}</p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">In stock:</p>
                <p className="font-medium">{stock} items</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Your balance:</p>
                <p className={`font-medium ${hasInsufficientFunds ? 'text-red-600' : 'text-green-600'}`}>
                  {formatUSD(user?.balance || 0)}
                </p>
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {hasInsufficientFunds && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
                <p className="text-sm text-red-700">
                  Your balance is insufficient. Please add funds to your account.
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {purchaseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{purchaseError.message}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBuy}
            disabled={isProcessing || stock <= 0 || hasInsufficientFunds}
            className="bg-[#2ECC71] hover:bg-[#27AE60]"
            isLoading={isProcessing}
          >
            Buy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
