
import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface PurchaseModalProductProps {
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
}

export function PurchaseModalProduct({
  productName,
  productImage,
  quantity,
  totalPrice
}: PurchaseModalProductProps) {
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();
  
  return (
    <div className="flex items-center gap-4">
      <img 
        src={productImage} 
        alt={productName} 
        className="w-20 h-20 object-cover rounded-md border border-gray-200"
      />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{productName}</h3>
        <p className="text-sm text-muted-foreground">
          Quantity: {quantity}
        </p>
        <p className="text-base font-bold text-primary mt-1">
          {formatUSD(convertVNDtoUSD(totalPrice))}
        </p>
      </div>
    </div>
  );
}
