
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface PurchaseModalInfoProps {
  stock: number;
  soldCount?: number;
  totalPrice: number;
  insufficientBalance: boolean;
  userBalance: number;
  additionalFundsNeeded?: number;
}

export const PurchaseModalInfo = ({
  stock,
  soldCount = 0,
  totalPrice,
  insufficientBalance,
  userBalance,
  additionalFundsNeeded = 0
}: PurchaseModalInfoProps) => {
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();
  const [highlightBalance, setHighlightBalance] = useState(false);
  const [highlightTotal, setHighlightTotal] = useState(false);
  
  // Highlight effect when values change
  useEffect(() => {
    setHighlightTotal(true);
    const timer = setTimeout(() => setHighlightTotal(false), 1000);
    return () => clearTimeout(timer);
  }, [totalPrice]);
  
  useEffect(() => {
    setHighlightBalance(true);
    const timer = setTimeout(() => setHighlightBalance(false), 1000);
    return () => clearTimeout(timer);
  }, [userBalance]);

  return (
    <div className="space-y-4">
      <div className="space-y-3 p-4 bg-card rounded-md border">
        <div className="grid grid-cols-2 gap-2 pb-2">
          <span className="text-muted-foreground">Availability:</span>
          <span className={`font-medium ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        {soldCount > 0 && (
          <div className="grid grid-cols-2 gap-2 pb-2">
            <span className="text-muted-foreground">Sold:</span>
            <span className="font-medium">{soldCount}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 pb-2">
          <span className="text-muted-foreground">Your Balance:</span>
          <span className={`font-medium ${insufficientBalance ? 'text-red-500' : 'text-green-600'} ${highlightBalance ? 'bg-yellow-100 transition-colors' : ''}`}>
            {formatUSD(convertVNDtoUSD(userBalance))}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 border-t pt-2">
          <span className="font-medium">Total Price:</span>
          <span className={`font-semibold text-primary ${highlightTotal ? 'bg-yellow-100 transition-colors' : ''}`}>
            {formatUSD(convertVNDtoUSD(totalPrice))}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 pt-1">
          <span className="text-muted-foreground">Balance After:</span>
          <span className={`font-medium ${insufficientBalance ? 'text-red-500' : 'text-green-600'}`}>
            {totalPrice > 0 ? formatUSD(convertVNDtoUSD(userBalance - totalPrice)) : formatUSD(convertVNDtoUSD(userBalance))}
          </span>
        </div>
      </div>
      
      {insufficientBalance && totalPrice > 0 && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <div>
            Your balance is insufficient. You need an additional {formatUSD(convertVNDtoUSD(additionalFundsNeeded || 0))} to complete this purchase.
          </div>
        </div>
      )}
      
      {(!insufficientBalance || totalPrice === 0) && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-sm">
          <ShieldCheck className="h-4 w-4 flex-shrink-0" />
          <div>
            {totalPrice === 0 
              ? 'This product is free. Click Checkout to proceed.'
              : 'Your balance is sufficient to complete this purchase. Click Checkout to proceed.'}
          </div>
        </div>
      )}
    </div>
  );
};
