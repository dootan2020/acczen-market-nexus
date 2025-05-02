
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
  image: string;
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
  image,
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
          image,
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

  // Determine gradient background color based on category
  const getGradientBackground = () => {
    if (category.toLowerCase().includes('social')) {
      return 'bg-gradient-to-r from-blue-400 to-blue-600';
    } else if (category.toLowerCase().includes('email')) {
      return 'bg-gradient-to-r from-blue-700 to-blue-900';
    } else if (category.toLowerCase().includes('software')) {
      return 'bg-gradient-to-r from-gray-700 to-gray-900';
    } else if (category.toLowerCase().includes('instagram')) {
      return 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500';
    } else {
      return 'bg-gradient-to-r from-green-400 to-blue-500';
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden border border-slate-200 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      {/* Category and Discount Badges */}
      <div className="relative">
        {/* Category Badge */}
        <Badge 
          className="absolute top-2 left-2 z-10 bg-[#3498DB] hover:bg-[#2980B9] text-white" 
          variant="secondary"
        >
          {category}
        </Badge>
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <Badge 
            className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white" 
            variant="destructive"
          >
            -{discountPercentage}%
          </Badge>
        )}
        
        {featured && !discountPercentage && (
          <Badge 
            className="absolute top-2 right-2 z-10 bg-amber-500 hover:bg-amber-600 text-white" 
            variant="destructive"
          >
            HOT
          </Badge>
        )}

        {/* Product Image Area with Gradient Background */}
        <div className={`${getGradientBackground()} h-[150px] flex items-center justify-center p-4`}>
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="max-h-[100px] max-w-[100px] object-contain filter brightness-0 invert"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/placeholder.svg";
            }}
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 h-14 font-poppins text-gray-800">
          {name}
        </h3>
        
        <div className="flex items-baseline mb-2">
          <span className="text-xl font-bold text-[#2ECC71]">
            {formattedSalePrice || formattedPrice}
          </span>
          
          {displaySalePrice && (
            <span className="text-sm text-gray-500 line-through ml-2 font-inter">
              {formattedPrice}
            </span>
          )}
        </div>

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
