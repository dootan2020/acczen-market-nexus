
import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseProduct } from "@/hooks/usePurchaseProduct";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProductQuantity from "../ProductQuantity";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { PurchaseModalInfo } from "./PurchaseModalInfo";
import { PurchaseModalActions } from "./PurchaseModalActions";
import { PurchaseResultCard } from "./PurchaseResultCard";
import { supabase } from "@/integrations/supabase/client";

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
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { isProcessing, purchaseError, executePurchase, clearError } = usePurchaseProduct();
  const [quantity, setQuantity] = useState(initialQuantity.toString());
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [productKeys, setProductKeys] = useState<string[] | undefined>(undefined);
  const [isCheckingOrder, setIsCheckingOrder] = useState(false);
  
  // Reset quantity and order state when modal opens with new initialQuantity
  useEffect(() => {
    if (open) {
      setQuantity(initialQuantity.toString());
      setOrderCompleted(false);
      setOrderId(null);
      setProductKeys(undefined);
      clearError();
    }
  }, [initialQuantity, open, clearError]);

  const numericQuantity = useMemo(() => parseInt(quantity) || 1, [quantity]);
  const maxQuantity = useMemo(() => Math.min(10, stock), [stock]);
  
  const totalPrice = useMemo(() => 
    productPrice * numericQuantity, 
    [productPrice, numericQuantity]
  );
  
  const hasInsufficientFunds = useMemo(() => {
    if (user?.balance === undefined) return false;
    return totalPrice > user.balance;
  }, [user?.balance, totalPrice]);

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

    const result = await executePurchase(orderData);
    
    if (result && result.order_id) {
      setOrderId(result.order_id);
      
      // If we have product keys immediately, show them
      if (result.product_keys && Array.isArray(result.product_keys)) {
        setProductKeys(result.product_keys);
      }
      
      setOrderCompleted(true);
      // Refresh user data to update balance
      refreshUser();
    }
  };

  const handleCheckOrder = async () => {
    if (!orderId) return;
    
    setIsCheckingOrder(true);
    
    try {
      // Call your API to check order status
      const { data, error } = await supabase
        .from('order_items')
        .select('data')
        .eq('order_id', orderId)
        .single();
      
      if (error) throw error;
      
      if (data && data.data) {
        const orderData = data.data;
        if (typeof orderData === 'object' && orderData !== null && 'product_keys' in orderData && Array.isArray(orderData.product_keys)) {
          setProductKeys(orderData.product_keys);
        }
      }
    } catch (err) {
      console.error("Error checking order:", err);
      toast.error("Failed to retrieve order details");
    } finally {
      setIsCheckingOrder(false);
    }
  };
  
  const handleReset = () => {
    setOrderCompleted(false);
    setOrderId(null);
    setProductKeys(undefined);
  };
  
  const handleAddFunds = () => {
    onOpenChange(false);
    navigate('/deposit');
  };
  
  const handleViewOrder = () => {
    onOpenChange(false);
    if (orderId) {
      navigate(`/order/${orderId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-auto">
        {orderCompleted ? (
          // Show success view with product keys
          <PurchaseResultCard
            orderId={orderId || ''}
            productKeys={productKeys}
            isCheckingOrder={isCheckingOrder}
            onCheckOrder={handleCheckOrder}
            onReset={handleReset}
            onClose={handleViewOrder}
          />
        ) : (
          // Show purchase confirmation view
          <>
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
                  <p className="font-medium">{formatUSD(convertVNDtoUSD(productPrice))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total:</p>
                  <p className="font-semibold text-lg text-green-600">{formatUSD(convertVNDtoUSD(totalPrice))}</p>
                </div>
              </div>

              {/* Purchase Information */}
              <PurchaseModalInfo
                stock={stock}
                soldCount={0}
                totalPrice={totalPrice}
                insufficientBalance={hasInsufficientFunds}
                userBalance={user?.balance || 0}
              />

              {/* Error Display */}
              {purchaseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{purchaseError.message}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <PurchaseModalActions
              isProcessing={isProcessing}
              onCancel={() => onOpenChange(false)}
              onConfirm={handleBuy}
              onDeposit={handleAddFunds}
              disabled={stock <= 0}
              insufficientBalance={hasInsufficientFunds}
              hasError={!!purchaseError}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
