
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { AlertTriangle, Package } from 'lucide-react';

interface PurchaseModalProductProps {
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  unitPrice: number;
  hasError?: boolean;
  errorMessage?: string;
}

export function PurchaseModalProduct({
  productName,
  productImage,
  quantity,
  totalPrice,
  unitPrice,
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
          <Package className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-gray-900">{productName}</h3>
          {hasError && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
          <span className="text-muted-foreground">Quantity:</span>
          <span className="font-medium">{quantity}</span>
          
          <span className="text-muted-foreground">Unit Price:</span>
          <span className="font-medium">{formatUSD(convertVNDtoUSD(unitPrice))}</span>
        </div>
        
        <p className="text-base font-bold text-primary mt-2 border-t pt-1">
          Total: {formatUSD(convertVNDtoUSD(totalPrice))}
        </p>
        
        {hasError && errorMessage && (
          <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
