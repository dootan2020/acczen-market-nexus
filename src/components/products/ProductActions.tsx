
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
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:gap-4 mt-6">
      <Button 
        variant="outline"
        className="w-full shadow-sm font-bold"
        size="lg"
        onClick={handleGoToCheckout}
        disabled={isOutOfStock}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Thanh toán
      </Button>

      <Button 
        className="w-full bg-[#F97316] hover:bg-[#EA580C] shadow-md font-bold"
        size="lg"
        disabled={isOutOfStock}
        onClick={handleBuyNow}
      >
        Mua ngay
        <ArrowRight className="ml-2 h-5 w-5" />
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
