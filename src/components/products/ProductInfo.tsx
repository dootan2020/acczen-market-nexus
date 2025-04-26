import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, CreditCard, Share2, Clock, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import RichTextContent from "@/components/RichTextContent";

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
    addItem({
      id,
      name,
      price: salePrice || price,
      image
    });

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${quantity} x ${name}`,
    });
  };

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
      
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">{renderRating()}</div>
            <span className="text-sm text-muted-foreground">({reviewCount})</span>
          </div>
        )}
      </div>
      
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
      
      <div className="flex flex-wrap gap-3 mb-6">
        <Badge 
          variant="outline" 
          className={cn(
            "py-1.5 px-3",
            isOutOfStock 
              ? "border-destructive text-destructive" 
              : isLowStock
              ? "bg-[#e6f7ef] border-[#27ae60] text-[#27ae60]"
              : "bg-[#e6f7ef] border-[#27ae60] text-[#27ae60]"
          )}
        >
          {isOutOfStock 
            ? "Hết hàng" 
            : isLowStock
            ? `Chỉ còn ${stockQuantity} sản phẩm`
            : `Còn hàng (${stockQuantity} sản phẩm)`}
        </Badge>
        
        <Badge 
          variant="outline" 
          className="py-1.5 px-3 bg-[#e6f3f9] border-[#3498db] text-[#3498db]"
        >
          Đã bán: {soldCount}
        </Badge>
      </div>
      
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
      
      <div className="mt-auto grid grid-cols-2 gap-3">
        <Button 
          className="shadow-sm"
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Thêm vào giỏ
        </Button>

        <Button 
          className="bg-[#2ECC71] hover:bg-[#27AE60] shadow-md"
          size="lg"
          disabled={isOutOfStock}
        >
          Mua ngay
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        <Button 
          className="col-span-2 md:col-span-1"
          variant="outline"
          size="lg"
        >
          <Clock className="mr-2 h-5 w-5" />
          Đặt trước
        </Button>
        
        <Button 
          className="col-span-2 md:col-span-1"
          variant="outline"
          size="lg"
        >
          <Share2 className="mr-2 h-5 w-5" />
          Chia sẻ
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
