
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { PurchaseConfirmModal } from "./PurchaseConfirmModal";

interface ProductActionsProps {
  isOutOfStock: boolean;
  onAddToCart: () => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  kioskToken: string | null;
}

const ProductActions = ({
  isOutOfStock,
  onAddToCart,
  productId,
  productName,
  productPrice,
  productImage,
  quantity,
  kioskToken
}: ProductActionsProps) => {
  const navigate = useNavigate();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const handleBuyNow = () => {
    setIsPurchaseModalOpen(true);
  };

  const handleGoToCheckout = () => {
    navigate('/checkout', { 
      state: { 
        product: {
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          quantity,
          kiosk_token: kioskToken
        },
        quantity 
      } 
    });
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row sm:gap-4 mt-6 space-y-3 space-y-reverse sm:space-y-0">
      <Button 
        variant="outline"
        className="w-full shadow-sm font-bold border-2 border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB]/10 transition-all duration-300"
        size="lg"
        onClick={onAddToCart}
        disabled={isOutOfStock}
      >
        <ShoppingCart className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
        Add to Cart
      </Button>

      <Button 
        className="w-full bg-[#2ECC71] hover:bg-[#27AE60] shadow-md font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        size="lg"
        disabled={isOutOfStock}
        onClick={handleBuyNow}
      >
        Buy Now
        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
      </Button>

      <PurchaseConfirmModal
        open={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        productId={productId}
        productName={productName}
        productPrice={productPrice}
        productImage={productImage}
        quantity={quantity}
        kioskToken={kioskToken}
      />
    </div>
  );
};

export default ProductActions;
