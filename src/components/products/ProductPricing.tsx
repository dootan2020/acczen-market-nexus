
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
    salePrice && salePrice < price ? Math.round(((price - salePrice) / price) * 100) : 0,
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
    <div className="mb-4">
      <div className="flex items-baseline gap-3 flex-wrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-3xl font-bold text-gray-900 cursor-help">
                {formattedUsdSalePrice || formattedUsdPrice}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{formattedVndSalePrice || formattedVndPrice}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {salePrice && salePrice < price && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-lg text-gray-500 line-through cursor-help">
                    {formattedUsdPrice}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formattedVndPrice}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {discount > 0 && (
              <Badge variant="destructive" className="ml-2 px-2.5 py-1">
                -{discount}%
              </Badge>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPricing;
