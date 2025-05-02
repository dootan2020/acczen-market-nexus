
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import StockBadge from '@/components/products/inventory/StockBadge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useCart as usePurchaseConfirmation } from '@/hooks/useCart';

interface ProductPurchaseProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  imageUrl: string;
  status: string;
}

const ProductPurchase: React.FC<ProductPurchaseProps> = ({
  id,
  name,
  price,
  salePrice,
  stockQuantity,
  imageUrl,
  status
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { addItem: openPurchaseConfirmation } = usePurchaseConfirmation();

  const actualPrice = salePrice || price;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const isInStock = stockQuantity > 0 && status === 'active';
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };
  
  const handleAddToCart = () => {
    if (!isInStock) return;
    
    setIsAdding(true);
    setTimeout(() => {
      addItem({
        id,
        name,
        price: actualPrice,
        image: imageUrl,
      });
      
      toast({
        title: "Added to cart",
        description: `${name} (${quantity}) has been added to your cart.`,
      });
      
      setIsAdding(false);
    }, 500);
  };
  
  const handleBuyNow = () => {
    if (!isInStock) return;
    
    openPurchaseConfirmation({
      id,
      name,
      price: actualPrice,
      image: imageUrl,
    });
  };

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-500 font-poppins">Price</h3>
            {discount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">
                {discount}% OFF
              </span>
            )}
          </div>
          
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900 mr-2 font-poppins">
              ${actualPrice.toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="text-lg text-gray-500 line-through font-poppins">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <StockBadge stock={stockQuantity} />
        </div>
        
        {isInStock ? (
          <>
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                Quantity
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={stockQuantity <= 0}
              >
                {Array.from({ length: Math.min(10, stockQuantity) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-3">
              <Button 
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium" 
                size="lg"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-gray-300" 
                size="lg"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                {isAdding ? "Added to Cart" : "Add to Cart"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium font-inter">
              This item is currently out of stock
            </p>
            <p className="text-gray-500 text-sm mt-1 font-inter">
              Please check back later or browse similar products
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductPurchase;
