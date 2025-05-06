
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PurchaseModalInfo } from './PurchaseModalInfo';
import { PurchaseModalActions } from './PurchaseModalActions';
import { PurchaseResultCard } from './PurchaseResultCard';
import ProductQuantity from '../ProductQuantity';
import { usePurchaseModal } from '@/contexts/PurchaseModalContext';

interface PurchaseModalContentProps {
  productName: string;
  stock: number;
  kioskToken: string | null;
}

export const PurchaseModalContent: React.FC<PurchaseModalContentProps> = ({ 
  productName, 
  stock,
  kioskToken 
}) => {
  const { 
    purchaseComplete, 
    quantity, 
    handleQuantityChange,
    loading,
    orderDetails,
    productKeys,
    checkingOrder,
    handleCheckOrder,
    handleReset,
    handleViewOrder,
    handlePurchase,
    handleDeposit,
    insufficientBalance,
    userBalance,
    additionalFundsNeeded,
    error,
    totalPrice
  } = usePurchaseModal();

  // Calculate whether checkout is disabled - FIX: Ensure numeric comparison and check token properly
  const parsedQuantity = parseInt(quantity);
  const isCheckoutDisabled = 
    stock <= 0 || 
    isNaN(parsedQuantity) || 
    parsedQuantity <= 0 || 
    parsedQuantity > stock || 
    kioskToken === null || 
    kioskToken === undefined || 
    kioskToken === '' || 
    (insufficientBalance && totalPrice > 0); // Only disable for insufficient balance if product isn't free

  if (purchaseComplete) {
    return (
      <PurchaseResultCard
        orderId={orderDetails?.orderId || ''}
        productKeys={productKeys}
        isCheckingOrder={checkingOrder}
        onCheckOrder={handleCheckOrder}
        onReset={handleReset}
        onClose={handleViewOrder}
      />
    );
  }

  return (
    <>
      <div className="space-y-2 p-4 bg-muted/30 rounded-md">
        <h3 className="font-semibold text-base">{productName}</h3>
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
          <span>
            {totalPrice === 0 
              ? "Free" 
              : `$${(totalPrice / parsedQuantity).toFixed(2)} each`}
          </span>
        </div>
        
        {/* Quantity selector */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-medium">Quantity:</span>
          <ProductQuantity
            value={quantity}
            onChange={handleQuantityChange}
            maxQuantity={stock}
            disabled={loading}
          />
        </div>
        
        <div className="flex items-center mt-2 text-sm text-emerald-600 gap-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span>Secure transaction</span>
        </div>
      </div>
      
      <PurchaseModalInfo 
        stock={stock}
        soldCount={0} // Not using this currently
        totalPrice={totalPrice}
        insufficientBalance={insufficientBalance}
        userBalance={userBalance}
        additionalFundsNeeded={additionalFundsNeeded}
      />
      
      <PurchaseModalActions 
        isProcessing={loading}
        onCancel={() => {}} // Will be handled at parent level
        onConfirm={handlePurchase}
        onDeposit={handleDeposit}
        disabled={isCheckoutDisabled}
        insufficientBalance={insufficientBalance && totalPrice > 0}
        hasError={!!error}
      />
    </>
  );
};
