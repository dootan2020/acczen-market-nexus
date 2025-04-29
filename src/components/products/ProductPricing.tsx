
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { useMemo } from "react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

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
  const { convertVNDtoUSD, formatUSD, formatVND } = useCurrencyContext();
  const isOutOfStock = stockQuantity === 0;
  const isLowStock = stockQuantity <= 5 && stockQuantity > 0;
  
  // Calculate discount percentage
  const discount = useMemo(() => 
    salePrice ? Math.round(((price - salePrice) / price) * 100) : 0,
    [price, salePrice]
  );

  // Using useMemo for currency conversions
  const usdPrice = useMemo(() => 
    convertVNDtoUSD(price), [price, convertVNDtoUSD]);
  
  const usdSalePrice = useMemo(() => 
    salePrice ? convertVNDtoUSD(salePrice) : null, 
    [salePrice, convertVNDtoUSD]);

  // Format the prices with currency symbols
  const formattedUsdPrice = useMemo(() => 
    formatUSD(usdPrice), [usdPrice, formatUSD]);
  
  const formattedUsdSalePrice = useMemo(() => 
    usdSalePrice ? formatUSD(usdSalePrice) : null,
    [usdSalePrice, formatUSD]);

  // Original VND prices for tooltip
  const formattedVndPrice = useMemo(() => 
    formatVND(price), [price, formatVND]);
  
  const formattedVndSalePrice = useMemo(() => 
    salePrice ? formatVND(salePrice) : null,
    [salePrice, formatVND]);

  return (
    <>
      <div className="mb-6 bg-secondary/30 p-4 rounded-lg">
        <div className="flex items-baseline gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-2xl sm:text-3xl font-bold text-primary cursor-help">
                  {formattedUsdSalePrice || formattedUsdPrice}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{formattedVndSalePrice || formattedVndPrice}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {salePrice && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-lg text-muted-foreground line-through cursor-help">
                      {formattedUsdPrice}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formattedVndPrice}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
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
            ? "Out of Stock" 
            : isLowStock
            ? `Only ${stockQuantity} left in stock`
            : `In Stock (${stockQuantity} available)`}
        </Badge>
        
        <Badge 
          variant="outline" 
          className="py-1.5 px-3 bg-[#e6f3f9] border-[#3498db] text-[#3498db]"
        >
          Sold: {soldCount}
        </Badge>
      </div>
    </>
  );
};

export default ProductPricing;
