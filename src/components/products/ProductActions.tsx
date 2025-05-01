
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PurchaseConfirmModal } from "./PurchaseConfirmModal";

interface ProductActionsProps {
  isOutOfStock: boolean;
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
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = () => {
    setIsLoading(true);
    // Simulate a small delay to show loading state
    setTimeout(() => {
      setIsLoading(false);
      setIsPurchaseModalOpen(true);
    }, 300);
  };

  return (
    <div className="mt-6">
      <Button 
        className="w-full bg-[#2ECC71] hover:bg-[#27AE60] shadow-md font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        size="lg"
        disabled={isOutOfStock}
        isLoading={isLoading}
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
