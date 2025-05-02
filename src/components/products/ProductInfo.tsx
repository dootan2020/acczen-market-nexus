
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Shield, Clock, CheckCircle } from "lucide-react";
import ProductQuantity from "./ProductQuantity";
import { PurchaseConfirmModal } from "./purchase/PurchaseConfirmModal";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import ProductActions from './ProductActions';
import { toast } from "sonner";

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
  const [isFavorited, setIsFavorited] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const finalPrice = salePrice || price;
  const isOutOfStock = stockQuantity <= 0;
  
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };
  
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ProductQuantity 
          quantity={quantity} 
          stockQuantity={stockQuantity} 
          onQuantityChange={handleQuantityChange} 
        />
        
        <Button 
          onClick={toggleFavorite}
          variant="outline"
          size="icon"
          className={cn(
            "transition-all duration-300 border-2 h-11 w-11",
            isFavorited 
              ? "border-[#E74C3C] text-[#E74C3C] bg-[#E74C3C]/5 hover:bg-[#E74C3C]/10" 
              : "border-gray-300 text-gray-500 hover:border-[#3498DB] hover:text-[#3498DB]"
          )}
        >
          <Heart 
            className={cn(
              "h-5 w-5 transition-all duration-300", 
              isFavorited ? "fill-[#E74C3C]" : "group-hover:scale-110"
            )} 
          />
          <span className="sr-only">{isFavorited ? 'Remove from favorites' : 'Add to favorites'}</span>
        </Button>
      </div>
      
      <ProductActions
        isOutOfStock={isOutOfStock}
        productId={id}
        productName={name}
        productPrice={finalPrice}
        productImage={image}
        quantity={quantity}
        kioskToken={kiosk_token || null}
      />

      {/* Product benefits */}
      <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <div className="p-4 flex items-start">
            <div className="flex-shrink-0 mt-1 mr-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Secure Warranty</h4>
              <p className="text-sm text-gray-600">100% refund if account is locked within 30 days</p>
            </div>
          </div>
          
          <div className="p-4 flex items-start">
            <div className="flex-shrink-0 mt-1 mr-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Instant Delivery</h4>
              <p className="text-sm text-gray-600">Account details sent automatically via email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery time estimation */}
      <div className="bg-green-50 p-4 rounded-md border border-green-200 flex items-center">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-green-800">Instant Delivery</p>
          <p className="text-sm text-green-700">Get your account details immediately after payment</p>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
