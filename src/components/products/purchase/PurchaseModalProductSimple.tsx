
import React from 'react';
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { Input } from "@/components/ui/input";

interface PurchaseModalProductSimpleProps {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  stock: number;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PurchaseModalProductSimple({
  productName,
  quantity,
  unitPrice,
  totalPrice,
  stock,
  onQuantityChange
}: PurchaseModalProductSimpleProps) {
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();
  
  return (
    <div className="space-y-4">
      {/* Product Name with Bold Label */}
      <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
        <span className="font-bold text-sm">PRODUCT:</span>
        <span className="text-sm font-medium text-[#9b87f5]">{productName}</span>
      </div>
      
      {/* Description */}
      <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
        <span className="font-bold text-sm">Description:</span>
        <span className="text-sm text-[#8E9196] truncate">{productName}</span>
      </div>
      
      {/* Currently Available */}
      <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
        <span className="font-bold text-sm">Currently available:</span>
        <span className="text-sm font-medium">{stock}</span>
      </div>
      
      {/* Unit Price */}
      <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
        <span className="font-bold text-sm">Unit price:</span>
        <span className="text-sm">{formatUSD(convertVNDtoUSD(unitPrice))}</span>
      </div>
      
      {/* Purchase Quantity */}
      <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
        <span className="font-bold text-sm">Purchase quantity:</span>
        <Input 
          type="number"
          min={1}
          max={stock}
          value={quantity}
          onChange={onQuantityChange}
          className="h-8 w-full"
        />
      </div>
      
      {/* Total - Highlighted in Red */}
      <div className="grid grid-cols-[80px_1fr] gap-2 items-center border-t pt-2">
        <span className="font-bold text-sm">Total:</span>
        <span className="text-[#ea384c] text-lg font-bold">
          {formatUSD(convertVNDtoUSD(totalPrice))}
        </span>
      </div>
    </div>
  );
}
