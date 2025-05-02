
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { AlertTriangle } from 'lucide-react';

interface PurchaseModalProductProps {
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  hasError?: boolean;
  errorMessage?: string;
}

export function PurchaseModalProduct({
  productName,
  productImage,
  quantity,
  totalPrice,
  hasError = false,
  errorMessage
}: PurchaseModalProductProps) {
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();
  
  return (
    <div className={`flex items-center gap-4 ${hasError ? 'opacity-75' : ''}`}>
      <img 
        src={productImage} 
        alt={productName} 
        className={`w-20 h-20 object-cover rounded-md border ${hasError ? 'border-red-200 opacity-75' : 'border-gray-200'}`}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{productName}</h3>
          {hasError && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Số lượng: {quantity}
        </p>
        <p className="text-base font-bold text-primary mt-1">
          {formatUSD(convertVNDtoUSD(totalPrice))}
        </p>
        {hasError && errorMessage && (
          <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
