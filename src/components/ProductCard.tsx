
import { Link } from "react-router-dom";
import { Info, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductBadge from "./products/ProductBadge";

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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg rounded-xl border border-gray-200 h-full flex flex-col group">
      <div className="relative">
        <Link to={`/product/${id}`} className="block">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
          />
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
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-lg line-clamp-2 hover:text-primary transition-colors font-sans mb-2">{name}</h3>
        </Link>
        
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-lg font-bold text-[#2ECC71]">
              {formattedSalePrice || formattedPrice}
            </span>
            {displaySalePrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {formattedPrice}
              </span>
            )}
          </div>
          
          {stock > 0 && (
            <Badge variant="success" className="text-white">Còn hàng</Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2 mt-auto">
        <Button
          variant="outline"
          className="w-full border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71]/10"
          disabled={stock === 0}
          onClick={() => navigate(`/product/${id}`)}
        >
          <Info className="mr-2 h-4 w-4" />
          Chi tiết
        </Button>
        
        <Button 
          className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white" 
          disabled={stock === 0}
          onClick={handleBuyNow}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Mua ngay
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
