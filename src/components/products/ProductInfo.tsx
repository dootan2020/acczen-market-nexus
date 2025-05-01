
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
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
  const isLowStock = stockQuantity > 0 && stockQuantity < 10;
  
  const handleBuyNow = () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/products/${id}` } });
      return;
    }
    setShowPurchaseModal(true);
  };

  const handleAddToCart = () => {
    // In a real app, this would add the product to the cart
    console.log(`Product ${id} added to cart with quantity ${quantity}`);
    // Implement cart functionality or navigate to cart
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
          
          <div className="text-sm font-medium text-right">
            {isOutOfStock ? (
              <span className="text-red-500">Out of Stock</span>
            ) : isLowStock ? (
              <span className="text-amber-600">Only {stockQuantity} items left</span>
            ) : (
              <span className="text-green-600">In Stock ({stockQuantity} items)</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleAddToCart} 
            disabled={isOutOfStock}
            size="lg"
            variant="outline"
            className="flex-1 border-2 border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB]/10 font-medium transition-all duration-300 h-12 text-base"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          
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
            size="icon"
            className={cn(
              "transition-all duration-300 border-2 h-12 w-12",
              isFavorited 
                ? "border-[#E74C3C] text-[#E74C3C] bg-[#E74C3C]/5 hover:bg-[#E74C3C]/10" 
                : "border-accent text-accent hover:bg-accent/5"
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

        {/* Product benefits */}
        <div className="bg-gray-50 p-4 rounded-lg mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Secure Warranty</h4>
                <p className="text-xs text-gray-600">100% refund if account is locked within 30 days</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Instant Delivery</h4>
                <p className="text-xs text-gray-600">Account details sent automatically via email</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Secure Payment</h4>
                <p className="text-xs text-gray-600">Multiple payment methods supported</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Customer Support</h4>
                <p className="text-xs text-gray-600">24/7 assistance for any issues</p>
              </div>
            </div>
          </div>
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
