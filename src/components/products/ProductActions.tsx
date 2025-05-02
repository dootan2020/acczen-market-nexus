
import React, { useState } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import ProductQuantity from './ProductQuantity';

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number | string | null;
    image_url?: string;
    stock_quantity: number;
  };
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [quantity, setQuantity] = useState('1');
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const maxQuantity = Math.min(10, product.stock_quantity);
  
  const handleAddToCart = () => {
    if (product.stock_quantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    
    const price = product.sale_price && Number(product.sale_price) > 0 && Number(product.sale_price) < product.price
      ? Number(product.sale_price)
      : product.price;
    
    addItem({
      id: product.id,
      name: product.name,
      price,
      image: product.image_url || '/placeholder.svg',
    });
  };
  
  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
      description: isWishlisted 
        ? `${product.name} has been removed from your wishlist` 
        : `${product.name} has been added to your wishlist`,
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="quantity" className="block text-sm font-medium font-poppins text-gray-700">
          Quantity
        </label>
        <ProductQuantity
          value={quantity}
          onChange={setQuantity}
          maxQuantity={maxQuantity}
          disabled={product.stock_quantity <= 0}
        />
      </div>
      
      <div className="flex gap-3">
        <Button 
          size="lg" 
          className="flex-1"
          onClick={handleAddToCart}
          disabled={product.stock_quantity <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        
        <Button 
          size="lg"
          variant="outline"
          onClick={handleToggleWishlist}
          className={isWishlisted ? "bg-red-50 text-red-600 border-red-200" : ""}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>
    </div>
  );
};

export default ProductActions;
