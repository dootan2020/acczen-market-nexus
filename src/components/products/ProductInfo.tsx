
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface ProductInfoProps {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  image: string;
  features?: string[];
}

const ProductInfo = ({ 
  id, 
  name, 
  description, 
  price, 
  salePrice, 
  stockQuantity,
  image, 
  features 
}: ProductInfoProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const isOutOfStock = stockQuantity === 0;
  const isLowStock = stockQuantity <= 5 && stockQuantity > 0;

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price: salePrice || price,
      image,
    });
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold mb-2">{name}</h1>
      
      <div className="flex items-baseline mb-4">
        <span className="text-2xl font-bold text-primary mr-2">
          {(salePrice || price).toLocaleString('vi-VN')}đ
        </span>
        {salePrice && (
          <span className="text-lg text-muted-foreground line-through">
            {price.toLocaleString('vi-VN')}đ
          </span>
        )}
      </div>

      <div className="mb-6">
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

      <p className="text-muted-foreground mb-6">
        {description}
      </p>

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

      <div className="mt-auto space-y-4">
        <Button 
          className="w-full gap-2"
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-5 w-5" />
          {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </Button>

        {!isOutOfStock && (
          <Button 
            className="w-full"
            variant="secondary"
            size="lg"
          >
            Mua ngay
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
