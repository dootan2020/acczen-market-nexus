
import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductBadge from "./products/ProductBadge";
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

  return (
    <Card className="h-full flex flex-col overflow-hidden border border-slate-200 rounded-lg transition-all duration-300 hover:shadow-md group">
      {/* Product Image Area */}
      <div className="relative overflow-hidden bg-slate-50">
        <Link to={`/products/${id}`} className="block">
          <div className="h-[220px] flex items-center justify-center p-6">
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[calc(100%-1rem)]">
          {featured && <ProductBadge type="featured" />}
          {isNew && <ProductBadge type="new" />}
          {isBestSeller && <ProductBadge type="bestSeller" />}
          {discountPercentage > 0 && (
            <ProductBadge type="sale" percentage={discountPercentage} />
          )}
        </div>

        {stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive" className="text-base font-medium px-3 py-1">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardContent className="flex-grow p-4">
        <div className="mb-1.5 flex items-center space-x-1">
          <Badge variant="outline" className="text-xs font-normal text-gray-600 bg-slate-50 hover:bg-slate-100">
            {category}
          </Badge>
          
          {rating > 0 && (
            <div className="flex items-center text-xs text-amber-500 ml-auto">
              <Star className="h-3.5 w-3.5 fill-amber-500 mr-0.5" />
              <span>{rating.toFixed(1)}</span>
              {reviewCount > 0 && <span className="text-gray-400 ml-0.5">({reviewCount})</span>}
            </div>
          )}
        </div>
        
        <Link to={`/products/${id}`}>
          <h3 className="font-medium text-base line-clamp-2 hover:text-[#19C37D] transition-colors mb-1.5">
            {name}
          </h3>
        </Link>

        <div className="flex items-baseline mt-1.5 mb-2">
          <span className="text-lg font-bold text-[#19C37D]">
            {formattedSalePrice || formattedPrice}
          </span>
          
          {displaySalePrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {formattedPrice}
            </span>
          )}
        </div>

        {description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {cleanDescription}
          </p>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mt-auto space-x-2">
          <span className="inline-flex items-center">
            <span className={stock > 0 ? "text-green-600" : "text-red-500"}>
              {stock > 0 ? `In stock (${stock})` : "Out of stock"}
            </span>
          </span>
          {soldCount > 0 && (
            <>
              <span>•</span>
              <span>Sold: {soldCount}</span>
            </>
          )}
        </div>
      </CardContent>

      {/* Footer with Buy Button */}
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white shadow-sm transition-all duration-300"
          disabled={stock === 0}
          onClick={handleBuyNow}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
