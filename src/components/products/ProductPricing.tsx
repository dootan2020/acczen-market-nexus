
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface ProductPricingProps {
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  soldCount?: number;
}

const ProductPricing = ({ 
  price, 
  salePrice, 
  stockQuantity, 
  soldCount = 0 
}: ProductPricingProps) => {
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const isOutOfStock = stockQuantity === 0;
  const isLowStock = stockQuantity <= 5 && stockQuantity > 0;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  const usdPrice = convertVNDtoUSD(price);
  const usdSalePrice = salePrice ? convertVNDtoUSD(salePrice) : null;

  return (
    <>
      <div className="mb-6 bg-secondary/30 p-4 rounded-lg">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-bold text-primary">
            {formatUSD(usdSalePrice || usdPrice)}
          </span>
          
          {salePrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatUSD(usdPrice)}
              </span>
              
              <Badge variant="destructive" className="ml-2">
                -{discount}%
              </Badge>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <Badge 
          variant="outline" 
          className={cn(
            "py-1.5 px-3",
            isOutOfStock 
              ? "border-destructive text-destructive" 
              : isLowStock
              ? "bg-[#e6f7ef] border-[#27ae60] text-[#27ae60]"
              : "bg-[#e6f7ef] border-[#27ae60] text-[#27ae60]"
          )}
        >
          {isOutOfStock 
            ? "Hết hàng" 
            : isLowStock
            ? `Chỉ còn ${stockQuantity} sản phẩm`
            : `Còn hàng (${stockQuantity} sản phẩm)`}
        </Badge>
        
        <Badge 
          variant="outline" 
          className="py-1.5 px-3 bg-[#e6f3f9] border-[#3498db] text-[#3498db]"
        >
          Đã bán: {soldCount}
        </Badge>
      </div>
    </>
  );
};

export default ProductPricing;
