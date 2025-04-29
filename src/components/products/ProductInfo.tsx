
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
        <div className="flex space-x-4 items-center">
          <ProductQuantity 
            quantity={quantity} 
            stockQuantity={stockQuantity} 
            onQuantityChange={handleQuantityChange} 
          />
          
          <div className="flex-grow">
            <p className="text-sm text-muted-foreground font-inter">
              {stockQuantity > 0 
                ? `${stockQuantity} sản phẩm có sẵn` 
                : 'Hết hàng'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleBuyNow} 
            disabled={stockQuantity <= 0}
            size="lg"
            className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-inter"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Mua ngay
          </Button>
          
          <Button 
            onClick={toggleFavorite}
            variant="outline"
            size="lg"
            className={cn(
              "flex-1 transition-all duration-300 border-2",
              isFavorited 
                ? "border-[#E74C3C] text-[#E74C3C] bg-[#E74C3C]/10 hover:bg-[#E74C3C]/20" 
                : "border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB]/10"
            )}
          >
            <Heart 
              className={cn(
                "mr-2 h-5 w-5 transition-all duration-300", 
                isFavorited && "fill-[#E74C3C]"
              )} 
            />
            {isFavorited ? 'Đã yêu thích' : 'Yêu thích'}
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
