
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { AlertTriangle } from "lucide-react";

interface PurchaseModalInfoProps {
  stock: number;
  soldCount?: number;
  totalPrice: number;
  description: string;
  insufficientBalance: boolean;
  userBalance: number;
}

export function PurchaseModalInfo({
  stock,
  soldCount = 0,
  totalPrice,
  description,
  insufficientBalance,
  userBalance
}: PurchaseModalInfoProps) {
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();

  return (
    <div className="space-y-4">
      <div className="flex flex-col text-sm">
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
          <span className="font-medium">
            {formatUSD(convertVNDtoUSD(userBalance))}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 border-t pt-2">
          <span className="text-muted-foreground">Total Price:</span>
          <span className="font-medium text-primary">
            {formatUSD(convertVNDtoUSD(totalPrice))}
          </span>
        </div>
      </div>
      
      {insufficientBalance && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <div>
            Insufficient balance to complete this purchase. Please add funds to your account.
          </div>
        </div>
      )}
      
      {description && (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Description:</p>
          <p className="line-clamp-3">{description}</p>
        </div>
      )}
    </div>
  );
}
