
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import ProductHeader from "./ProductHeader";
import ProductPricing from "./ProductPricing";
import ProductQuantity from "./ProductQuantity";
import ProductActions from "./ProductActions";

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
  price, 
  salePrice, 
  stockQuantity,
  image,
  rating = 0,
  reviewCount = 0,
  soldCount = 0
}: ProductInfoProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = stockQuantity === 0;

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

  return (
    <div className="flex flex-col h-full">
      <ProductHeader 
        name={name}
        rating={rating}
        reviewCount={reviewCount}
      />
      
      <ProductPricing 
        price={price}
        salePrice={salePrice}
        stockQuantity={stockQuantity}
        soldCount={soldCount}
      />
      
      <ProductQuantity
        quantity={quantity}
        stockQuantity={stockQuantity}
        onQuantityChange={setQuantity}
      />
      
      <ProductActions
        isOutOfStock={isOutOfStock}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductInfo;
