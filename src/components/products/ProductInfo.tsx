
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
  kiosk_token?: string | null;
}

const ProductInfo = ({ 
  id, 
  name, 
  description,
  price, 
  salePrice, 
  stockQuantity,
  image,
  rating = 0,
  reviewCount = 0,
  soldCount = 0,
  kiosk_token
}: ProductInfoProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = stockQuantity === 0;
  const effectivePrice = salePrice || price;

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price: effectivePrice,
      image
    });

    toast({
      title: "Added to cart",
      description: `${quantity} x ${name}`,
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6">
      <ProductHeader 
        name={name}
        rating={rating}
        reviewCount={reviewCount}
      />
      
      <p className="text-muted-foreground text-sm md:text-base">{description}</p>
      
      <ProductPricing 
        price={price}
        salePrice={salePrice}
        stockQuantity={stockQuantity}
        soldCount={soldCount}
      />
      
      <div className="mt-auto space-y-4">
        <ProductQuantity
          quantity={quantity}
          stockQuantity={stockQuantity}
          onQuantityChange={setQuantity}
        />
        
        <ProductActions
          isOutOfStock={isOutOfStock}
          onAddToCart={handleAddToCart}
          productId={id}
          productName={name}
          productPrice={effectivePrice}
          productImage={image}
          quantity={quantity}
          kioskToken={kiosk_token}
        />
      </div>
    </div>
  );
};

export default ProductInfo;
