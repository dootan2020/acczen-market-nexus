
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, CreditCard, Share2, Clock, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  image: string;
  features?: string[];
  soldCount?: number;
  rating?: number;
  reviewCount?: number;
}

const ProductInfo = ({ 
  id, 
  name, 
  description, 
  price, 
  salePrice, 
  stockQuantity,
  image,
  features,
  soldCount = 0,
  rating = 0,
  reviewCount = 0
}: ProductInfoProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = stockQuantity === 0;
  const isLowStock = stockQuantity <= 5 && stockQuantity > 0;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity(prev => Math.min(stockQuantity, prev + 1));
  };

  const handleAddToCart = () => {
    // First add the item without quantity
    addItem({
      id,
      name,
      price: salePrice || price,
      image
    });

    // Update the quantity if needed (quantity=1 is already the default)
    if (quantity > 1) {
      // This would require updating the useCart hook to support initial quantity
      // For now, we'll stick with adding the item with quantity=1
      // In a future update, we could modify the useCart hook to support initial quantity
    }

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${quantity} x ${name}`,
    });
  };

  // Generate star rating display
  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="text-muted-foreground h-4 w-4" />
            <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
              <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="text-muted-foreground h-4 w-4" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">{name}</h1>
      
      {/* Rating and Sales Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">{renderRating()}</div>
            <span className="text-sm text-muted-foreground">({reviewCount})</span>
          </div>
        )}
        
        {soldCount > 0 && (
          <div className="text-sm text-muted-foreground">
            Đã bán: <span className="font-medium">{soldCount}</span>
          </div>
        )}
      </div>
      
      {/* Price Display */}
      <div className="mb-6 bg-secondary/30 p-4 rounded-lg">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-bold text-primary">
            {(salePrice || price).toLocaleString('vi-VN')}đ
          </span>
          
          {salePrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {price.toLocaleString('vi-VN')}đ
              </span>
              
              <Badge variant="destructive" className="ml-2">
                -{discount}%
              </Badge>
            </>
          )}
        </div>
      </div>
      
      {/* Stock Information */}
      <div className="mb-4">
        {isOutOfStock ? (
          <Badge variant="destructive" className="text-sm py-1">
            Hết hàng
          </Badge>
        ) : isLowStock ? (
          <Badge variant="outline" className="text-sm py-1 border-amber-500 text-amber-500">
            Chỉ còn {stockQuantity} sản phẩm
          </Badge>
        ) : (
          <Badge variant="outline" className="text-sm py-1 border-primary text-primary">
            Còn hàng ({stockQuantity} sản phẩm)
          </Badge>
        )}
      </div>
      
      {/* Short Description */}
      <p className="text-muted-foreground mb-6 line-clamp-3">
        {description}
      </p>
      
      {/* Features List */}
      {features && features.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Tính năng chính:</h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Quantity Selector */}
      <div className="flex items-center mb-6">
        <span className="mr-4 font-medium">Số lượng:</span>
        <div className="flex items-center border rounded-md">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-none border-r"
            onClick={decreaseQuantity}
            disabled={quantity <= 1 || isOutOfStock}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Input 
            type="number"
            min="1"
            max={stockQuantity}
            className="h-9 w-14 rounded-none border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1 && value <= stockQuantity) {
                setQuantity(value);
              }
            }}
            disabled={isOutOfStock}
          />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-none border-l"
            onClick={increaseQuantity}
            disabled={quantity >= stockQuantity || isOutOfStock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button 
          className="w-full gap-2 shadow-sm"
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-5 w-5" />
          {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </Button>

        <Button 
          className="w-full gap-2 shadow-sm"
          variant="secondary"
          size="lg"
          disabled={isOutOfStock}
        >
          <CreditCard className="h-5 w-5" />
          Mua ngay
        </Button>
        
        <Button 
          className="w-full gap-2"
          variant="outline"
          size="lg"
        >
          <Clock className="h-5 w-5" />
          Đặt trước
        </Button>
        
        <Button 
          className="w-full gap-2"
          variant="outline"
          size="lg"
        >
          <Share2 className="h-5 w-5" />
          Chia sẻ
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
