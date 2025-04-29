
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import ProductQuantity from "./ProductQuantity";
import { PurchaseConfirmModal } from "./purchase/PurchaseConfirmModal";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
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
  const [quantity, setQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const finalPrice = salePrice || price;
  const isOutOfStock = stockQuantity <= 0;
  
  const handleBuyNow = () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/products/${id}` } });
      return;
    }
    setShowPurchaseModal(true);
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };
  
  const toggleFavorite = () => {
    // In a real app, this would call an API to save the favorite status
    setIsFavorited(!isFavorited);
    console.log(`Product ${id} ${isFavorited ? 'removed from' : 'added to'} favorites`);
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <ProductQuantity 
            quantity={quantity} 
            stockQuantity={stockQuantity} 
            onQuantityChange={handleQuantityChange} 
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleBuyNow} 
            disabled={isOutOfStock}
            size="lg"
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] h-12 text-base group"
          >
            <ShoppingBag className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
          </Button>
          
          <Button 
            onClick={toggleFavorite}
            variant="outline"
            size="lg"
            className={cn(
              "flex-1 transition-all duration-300 border-2 h-12",
              isFavorited 
                ? "border-[#E74C3C] text-[#E74C3C] bg-[#E74C3C]/5 hover:bg-[#E74C3C]/10" 
                : "border-accent text-accent hover:bg-accent/5"
            )}
          >
            <Heart 
              className={cn(
                "mr-2 h-5 w-5 transition-all duration-300", 
                isFavorited ? "fill-[#E74C3C]" : "group-hover:scale-110"
              )} 
            />
            {isFavorited ? 'Favorited' : 'Add to Favorites'}
          </Button>
        </div>
      </div>
      
      <PurchaseConfirmModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        productId={id}
        productName={name}
        productPrice={finalPrice}
        productImage={image}
        productDescription={description?.substring(0, 100)}
        quantity={quantity}
        kioskToken={kiosk_token || null}
        stock={stockQuantity}
        soldCount={soldCount}
      />
    </>
  );
};

export default ProductInfo;
