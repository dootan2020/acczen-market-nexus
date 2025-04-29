
import { Link } from "react-router-dom";
import { Info, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

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

  // Render star rating
  const renderRating = () => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center mt-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg 
              key={star} 
              className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        {reviewCount > 0 && (
          <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md group">
      <div className="relative">
        <Link to={`/product/${id}`} className="block">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        <div className="absolute top-2 left-2 flex gap-2 flex-wrap max-w-[calc(100%-1rem)]">
          {isNew && (
            <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
          )}
          {isBestSeller && (
            <Badge className="bg-amber-500 hover:bg-amber-600">Best Seller</Badge>
          )}
          {featured && (
            <Badge variant="default">Featured</Badge>
          )}
        </div>
        
        {stock <= 0 && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="destructive" className="text-lg py-1 px-3">Hết hàng</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-lg line-clamp-2 hover:text-primary transition-colors mb-1">{name}</h3>
        </Link>
        
        {renderRating()}
        
        <div className="mt-2">
          <span className="text-lg font-bold text-primary">
            {formattedSalePrice || formattedPrice}
          </span>
          {displaySalePrice && (
            <span className="text-sm text-muted-foreground line-through ml-2">
              {formattedPrice}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="w-full"
          disabled={stock === 0}
          onClick={() => navigate(`/product/${id}`)}
        >
          <Info className="mr-2 h-4 w-4" />
          Chi tiết
        </Button>
        
        <Button 
          className="w-full" 
          disabled={stock === 0}
          onClick={handleBuyNow}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Mua ngay
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
