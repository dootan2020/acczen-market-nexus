
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface MobileProductCardProps {
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
}

const MobileProductCard: React.FC<MobileProductCardProps> = ({
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
}) => {
  const { addItem } = useCart();
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();

  const handleAddToCart = () => {
    const item = {
      id,
      name,
      price: salePrice || price,
      image,
      quantity: 1,
    };

    addItem(item);

    if (kioskToken) {
      localStorage.setItem(`product_${id}`, JSON.stringify({
        kioskToken,
        name,
        price: salePrice || price,
      }));
    }
  };

  const displayPrice = convertVNDtoUSD(price);
  const displaySalePrice = salePrice ? convertVNDtoUSD(salePrice) : null;
  const formattedPrice = formatUSD(displayPrice);
  const formattedSalePrice = displaySalePrice ? formatUSD(displaySalePrice) : null;

  return (
    <Card className={`overflow-hidden h-full ${featured ? 'border-primary/20 bg-primary/5' : ''}`}>
      <Link to={`/product/${id}`} className="block">
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-full h-36 object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[calc(100%-1rem)]">
            <Badge className="bg-secondary hover:bg-secondary/80 text-[10px] py-0">{category}</Badge>
            {featured && <Badge variant="default" className="text-[10px] py-0">Hot</Badge>}
          </div>
          {stock <= 5 && stock > 0 && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-[10px] py-0">
              {stock} left
            </Badge>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="destructive" className="text-sm py-0.5 px-2">Hết hàng</Badge>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-3">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-base line-clamp-2 leading-tight mb-1">{name}</h3>
        </Link>
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-primary">
              {formattedSalePrice || formattedPrice}
            </span>
            {displaySalePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formattedPrice}
              </span>
            )}
          </div>
        </div>
        
        <Button 
          className="w-full h-9 gap-1 text-sm" 
          disabled={stock === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          Thêm vào giỏ
        </Button>
      </div>
    </Card>
  );
};

export default MobileProductCard;
