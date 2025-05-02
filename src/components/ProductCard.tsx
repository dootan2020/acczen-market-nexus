
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

  // Calculate discount percentage if on sale
  const discountPercentage = useMemo(() => {
    if (!salePrice || salePrice >= price) return 0;
    return Math.round(((price - salePrice) / price) * 100);
  }, [price, salePrice]);

  return (
    <Card className="h-full flex flex-col overflow-hidden border border-gray-200 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-white">
      <div className="p-4 flex flex-col flex-grow relative">
        {/* Top Badges */}
        <div className="flex justify-between mb-3">
          {/* Category Badge */}
          <Badge 
            className="bg-[#3498DB] hover:bg-[#2980B9] text-white" 
            variant="secondary"
          >
            {category}
          </Badge>
          
          {/* Discount or Featured Badge */}
          {discountPercentage > 0 ? (
            <Badge 
              className="bg-red-500 hover:bg-red-600 text-white" 
              variant="destructive"
            >
              -{discountPercentage}%
            </Badge>
          ) : featured && (
            <Badge 
              className="bg-amber-500 hover:bg-amber-600 text-white" 
              variant="destructive"
            >
              HOT
            </Badge>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-lg mb-3 line-clamp-2 h-14 font-poppins text-gray-800">
          {name}
        </h3>
        
        {/* Price Section */}
        <div className="flex items-baseline mb-3">
          <span className="text-xl font-bold text-[#2ECC71]">
            {formattedSalePrice || formattedPrice}
          </span>
          
          {displaySalePrice && (
            <span className="text-sm text-gray-500 line-through ml-2 font-inter">
              {formattedPrice}
            </span>
          )}
        </div>

        {/* Stock and Sold Count Badges */}
        <div className="flex space-x-2 mb-3">
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            Còn: {stock}
          </Badge>
          
          {soldCount > 0 && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Đã bán: {soldCount}
            </Badge>
          )}
        </div>
        
        {/* Product Description */}
        {description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 font-inter min-h-[40px]">
            {cleanDescription}
          </p>
        )}

        {/* Out of stock overlay */}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive" className="text-base font-medium px-3 py-1">
              Out of Stock
            </Badge>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <Button
            variant="secondary"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={handleViewDetails}
          >
            <Eye className="mr-1 h-4 w-4" /> Chi tiết
          </Button>
          
          <Button
            className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white transition-all"
            disabled={stock === 0}
            onClick={handleBuyNow}
          >
            <ShoppingBag className="mr-1 h-4 w-4" /> Mua ngay
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
