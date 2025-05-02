
import { Link } from "react-router-dom";
import { Eye, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { stripHtmlTags, truncateText } from "@/utils/htmlUtils";

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
}: ProductCardProps) => {
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const navigate = useNavigate();

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

  const handleBuyNow = () => {
    navigate('/checkout', { 
      state: { 
        product: {
          id,
          name,
          price: salePrice || price,
          image: "",
          stock_quantity: stock,
          kiosk_token: kioskToken
        },
        quantity: 1
      } 
    });
  };

  const handleViewDetails = () => {
    navigate(`/products/${id}`);
  };

  return (
    <Card className="h-full flex flex-col border border-[#e5e5e5] rounded-lg transition-all duration-300 hover:shadow-md bg-white p-4">
      {/* Category Badge - ChatGPT style minimal badge */}
      <div className="mb-3">
        <Badge 
          className="bg-[#f0f0f0] text-[#444444] hover:bg-[#e8e8e8] font-normal text-xs px-2 py-0.5" 
          variant="outline"
        >
          {category}
        </Badge>
      </div>
      
      {/* Product Title - Typography focused */}
      <h3 className="font-semibold text-base mb-3 line-clamp-2 h-12 font-poppins text-[#343541]">
        {name}
      </h3>
      
      {/* Price Section - Clean with accent color */}
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

      {/* Stock information - Simple text */}
      <div className="text-sm text-gray-600 mb-3 font-inter">
        In stock: {stock}
      </div>
      
      {/* Product Description - Minimal with truncation */}
      {description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 font-inter min-h-[40px]">
          {cleanDescription}
        </p>
      )}

      {/* Out of stock indicator */}
      {stock <= 0 && (
        <div className="mb-3">
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
            Out of Stock
          </Badge>
        </div>
      )}
      
      {/* Action Buttons - ChatGPT-style buttons */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          className="flex-1 border border-[#e5e5e5] bg-white hover:bg-gray-50 text-[#343541]"
          onClick={handleViewDetails}
        >
          <Eye className="mr-1 h-4 w-4" /> Chi tiết
        </Button>
        
        <Button
          className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white"
          disabled={stock === 0}
          onClick={handleBuyNow}
        >
          <ShoppingBag className="mr-1 h-4 w-4" /> Mua ngay
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
