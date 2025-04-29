import { Link } from "react-router-dom";
import { Info, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductBadge from "./products/ProductBadge";
import StockSoldBadges from "./products/inventory/StockSoldBadges";

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

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl border border-gray-200 h-full flex flex-col group">
      <div className="relative">
        <Link to={`/products/${id}`} className="block">
          <div className="bg-gradient-to-r from-[#3498DB] to-[#2ECC71] h-[180px] w-full flex items-center justify-center p-4">
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="max-h-full w-auto max-w-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap max-w-[calc(100%-1rem)]">
          {featured && <ProductBadge type="featured" />}
          {isNew && <ProductBadge type="new" />}
          {isBestSeller && <ProductBadge type="bestSeller" />}
          {salePrice && <ProductBadge type="sale" />}
        </div>
        
        {stock <= 0 && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="destructive" className="text-base py-1 px-3 font-semibold">Hết hàng</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 flex-grow">
        <Link to={`/products/${id}`}>
          <h3 className="font-medium text-lg line-clamp-2 hover:text-primary transition-colors font-sans mb-2 text-[#333333]">{name}</h3>
        </Link>
        
        <StockSoldBadges stock={stock} soldCount={soldCount} />
        
        {description && (
          <p className="text-[#333333]/70 text-sm line-clamp-2 mb-3">
            {description}
          </p>
        )}
        
        <div className="flex items-end justify-between mt-2">
          <span className="text-xl font-bold text-[#2ECC71] font-sans">
            {formattedSalePrice || formattedPrice}
          </span>
          
          {displaySalePrice && (
            <span className="text-sm text-muted-foreground line-through ml-2">
              {formattedPrice}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 grid grid-cols-3 gap-2 mt-auto">
        <Button
          variant="outline"
          className="w-full border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71]/10"
          disabled={stock === 0}
          onClick={handleViewDetails}
        >
          Chi tiết
        </Button>
        
        <Button 
          className="w-full col-span-2 bg-[#2ECC71] hover:bg-[#27AE60] text-white uppercase font-medium" 
          disabled={stock === 0}
          onClick={handleBuyNow}
        >
          Mua Ngay
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
