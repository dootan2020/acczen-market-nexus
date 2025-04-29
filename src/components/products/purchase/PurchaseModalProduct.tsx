
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
  const { formatVND } = useCurrencyContext();

  return (
    <div className="space-y-4">
      {/* Product Image with Gradient Background */}
      <div className="bg-gradient-to-r from-[#3498DB] to-[#2ECC71] p-4 rounded-md flex items-center justify-center">
        <img
          src={productImage}
          alt={productName}
          className="h-32 w-auto max-w-full object-contain"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium leading-tight">{productName}</h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Số lượng: {quantity}
          </p>
          <p className="font-semibold text-[#2ECC71] text-lg">
            {formatVND(totalPrice)}
          </p>
        </div>
      </div>
    </div>
  );
}
