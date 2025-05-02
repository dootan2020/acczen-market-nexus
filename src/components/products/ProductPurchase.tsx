
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check } from "lucide-react";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import StockBadge from "@/components/products/inventory/StockBadge";
import { cn } from "@/lib/utils";

interface ProductPurchaseProps {
  product: any;
  stock: number;
}

const ProductPurchase: React.FC<ProductPurchaseProps> = ({ 
  product,
  stock 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const { addItem } = useCart();
  const navigate = useNavigate();

  if (!product) return null;

  const { price, sale_price, id, name, image_url } = product;

  const displayPrice = convertVNDtoUSD(price);
  const displaySalePrice = sale_price ? convertVNDtoUSD(sale_price) : null;
  const formattedPrice = formatUSD(displayPrice);
  const formattedSalePrice = displaySalePrice ? formatUSD(displaySalePrice) : null;
  
  const discountPercentage = sale_price ? Math.round(((price - sale_price) / price) * 100) : 0;
  const currentPrice = sale_price || price;
  const isOutOfStock = stock <= 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      id,
      name,
      price: currentPrice,
      image: image_url,
    });

    setIsAdded(true);
    toast.success("Added to cart");
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    
    addItem({
      id,
      name,
      price: currentPrice,
      image: image_url,
    });
    
    navigate('/checkout');
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Price section */}
      <div className="flex items-baseline">
        <div className="flex items-center">
          <span className="text-3xl font-bold text-[#2ECC71]">
            {formattedSalePrice || formattedPrice}
          </span>
          
          {displaySalePrice && (
            <span className="text-lg text-gray-500 line-through ml-3">
              {formattedPrice}
            </span>
          )}
        </div>
        
        {discountPercentage > 0 && (
          <Badge className="ml-4 bg-red-500 hover:bg-red-600">
            {discountPercentage}% OFF
          </Badge>
        )}
      </div>

      {/* Stock information */}
      <div className="flex items-center">
        <StockBadge stockQuantity={stock} />
        {stock > 0 && (
          <span className="text-sm text-gray-500 ml-2">
            {stock} items available
          </span>
        )}
      </div>

      {/* Quantity selector */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium">Quantity:</span>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isOutOfStock}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-3 py-1 border-x border-gray-300">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= stock || isOutOfStock}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white shadow-sm transition-all duration-300 h-12 text-base"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Buy Now
        </Button>
        
        <Button
          variant="outline"
          className={cn(
            "w-full border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71]/10 h-12 text-base",
            isAdded && "bg-[#2ECC71]/10 border-[#2ECC71]"
          )}
          disabled={isOutOfStock || isAdded}
          onClick={handleAddToCart}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Added to Cart
            </>
          ) : (
            "Add to Cart"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductPurchase;
