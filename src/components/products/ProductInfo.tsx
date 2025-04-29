
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import ProductQuantity from "./ProductQuantity";
import { PurchaseConfirmModal } from "./purchase/PurchaseConfirmModal";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex space-x-4 items-center">
          <ProductQuantity 
            quantity={quantity} 
            setQuantity={setQuantity} 
            max={stockQuantity} 
          />
          
          <div className="flex-grow">
            <p className="text-sm text-muted-foreground">
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
            className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Mua ngay
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="flex-1 border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71]/10"
          >
            <Heart className="mr-2 h-5 w-5" />
            Yêu thích
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
