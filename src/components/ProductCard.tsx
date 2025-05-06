
import { Link } from "react-router-dom";
import { Eye, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { useProductContext } from "@/contexts/ProductContext";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { stripHtmlTags, truncateText } from "@/utils/htmlUtils";
import { PurchaseConfirmModal } from "./products/purchase/PurchaseConfirmModal";
import { useStockOperations } from "@/hooks/taphoammo/useStockOperations";

interface ProductCardProps {
  id: string;
  name: string;
  image: string; // Keeping the prop for compatibility but not using it
  price: number;
  salePrice?: number; 
  category: string;
  subcategory?: string;
  stock: number;
  featured?: boolean;
  kioskToken?: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  description?: string;
  soldCount?: number;
  lastChecked?: string | null;
}

const ProductCard = ({
  id,
  name,
  price,
  salePrice,
  category,
  subcategory,
  stock,
  featured,
  kioskToken,
  rating = 0,
  reviewCount = 0,
  isNew = false,
  isBestSeller = false,
  description = "",
  soldCount = 0,
  lastChecked = null,
}: ProductCardProps) => {
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const navigate = useNavigate();
  const { openModal } = useProductContext();
  const { checkStockAvailability } = useStockOperations();
  
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [localStock, setLocalStock] = useState<number>(stock);
  const [lastStockCheck, setLastStockCheck] = useState<Date | null>(lastChecked ? new Date(lastChecked) : null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Using useMemo to optimize price conversions
  const displayPrice = useMemo(() => 
    convertVNDtoUSD(price), [price, convertVNDtoUSD]);
    
  const displaySalePrice = useMemo(() => 
    salePrice ? convertVNDtoUSD(salePrice) : null, 
    [salePrice, convertVNDtoUSD]);

  // Using useMemo for formatted prices
  const formattedPrice = useMemo(() => 
    formatUSD(displayPrice), [displayPrice, formatUSD]);
    
  const formattedSalePrice = useMemo(() => 
    displaySalePrice ? formatUSD(displaySalePrice) : null, 
    [displaySalePrice, formatUSD]);

  // Process the description to remove HTML tags and truncate
  const cleanDescription = useMemo(() => {
    // First strip HTML tags and decode entities, then truncate
    return truncateText(stripHtmlTags(description), 80);
  }, [description]);

  // Calculate displayed sold count (actual + 10000)
  const displaySoldCount = useMemo(() => soldCount + 10000, [soldCount]);

  // Check stock when component mounts
  useEffect(() => {
    if (kioskToken) {
      refreshStock();
    }
  }, [kioskToken]);

  // Function to refresh stock data
  const refreshStock = async () => {
    if (!kioskToken) return;
    
    setIsLoading(true);
    try {
      const result = await checkStockAvailability(1, kioskToken, { showToasts: false });
      if (result.stockData) {
        setLocalStock(result.stockData.stock_quantity);
        setLastStockCheck(result.stockData.last_checked || new Date());
      }
    } catch (error) {
      console.error("Error checking stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!kioskToken) {
      return;
    }
    
    if (localStock <= 0) {
      return;
    }
    
    // Check real-time stock before opening the modal
    setIsLoading(true);
    try {
      const result = await checkStockAvailability(1, kioskToken);
      if (result.stockData) {
        setLocalStock(result.stockData.stock_quantity);
        setLastStockCheck(result.stockData.last_checked || new Date());
      }
      
      if (result.available) {
        setIsPurchaseModalOpen(true);
      } else {
        // Don't open modal if stock is not available
        console.log("Stock unavailable:", result.message);
      }
    } catch (error) {
      console.error("Error checking stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    openModal(id);
  };

  // Important: Use the correct price for purchase - original price in VND
  // This ensures we're passing the raw price to the modal, not the converted one
  const effectivePrice = salePrice || price;

  return (
    <Card className="h-full flex flex-col overflow-hidden border border-[#e5e5e5] rounded-lg transition-all duration-300 hover:shadow-md bg-white p-4">
      {/* Category Badge */}
      <div className="mb-3">
        <Badge 
          className="bg-[#f0f0f0] text-[#444444] hover:bg-[#e8e8e8] font-normal text-xs px-2 py-0.5" 
          variant="outline"
        >
          {category}
        </Badge>
      </div>
      
      {/* Product Title */}
      <h3 className="font-semibold text-base mb-3 line-clamp-2 h-12 font-poppins text-[#343541]">
        {name}
      </h3>
      
      {/* Price Section */}
      <div className="flex items-baseline mb-3">
        <span className="text-lg font-semibold text-[#2ECC71]">
          {formattedSalePrice || formattedPrice}
        </span>
        
        {displaySalePrice && (
          <span className="text-sm text-gray-500 line-through ml-2 font-inter">
            {formattedPrice}
          </span>
        )}
      </div>

      {/* Stock & Sold Information - New styled badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`inline-block text-xs px-2 py-1 rounded ${
          localStock > 0 
            ? "bg-[#F2FCE2] text-[#2ECC71]" 
            : "bg-[#FDECEA] text-[#E74C3C]"
          } font-medium`}>
          {localStock > 0 ? `In stock: ${localStock}` : "Out of stock"}
        </span>
        <span className="inline-block text-xs px-2 py-1 rounded bg-[#FDE1D3] text-[#E67E22] font-medium">
          Sold: {displaySoldCount.toLocaleString()}
        </span>
      </div>
      
      {/* Low stock warning */}
      {localStock > 0 && localStock < 10 && (
        <div className="mb-3 text-xs text-amber-600 bg-amber-50 p-1.5 rounded-sm flex items-center">
          <span>Low stock: Only {localStock} items left</span>
        </div>
      )}
      
      {/* Product Description - with flex grow to push buttons to bottom */}
      {description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 font-inter flex-grow min-h-[40px]">
          {cleanDescription}
        </p>
      )}
      
      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 mt-auto w-full">
        <Button
          variant="outline"
          className="flex-1 border border-[#e5e5e5] bg-white hover:bg-gray-50 text-[#343541] px-1.5 sm:px-2 py-1.5 h-auto text-[10px] xs:text-xs sm:text-sm"
          onClick={handleViewDetails}
        >
          <Eye className="mr-0.5 h-3 w-3 sm:h-4 sm:w-4" /> Details
        </Button>
        
        <Button
          className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white px-1.5 sm:px-2 py-1.5 h-auto text-[10px] xs:text-xs sm:text-sm"
          disabled={localStock === 0 || isLoading}
          onClick={handleBuyNow}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-pulse">Loading</span>
            </span>
          ) : (
            <>
              <ShoppingBag className="mr-0.5 h-3 w-3 sm:h-4 sm:w-4" /> Buy Now
            </>
          )}
        </Button>
      </div>

      {/* Purchase Confirmation Modal - Using the original VND price */}
      <PurchaseConfirmModal
        open={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        productId={id}
        productName={name}
        productPrice={effectivePrice} 
        productImage="" // We don't use images in this project
        quantity={1}
        kioskToken={kioskToken || null}
        stock={localStock}
      />
    </Card>
  );
};

export default ProductCard;
