
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { PurchaseConfirmModal } from "./purchase/PurchaseConfirmModal";
import { toast } from "sonner";

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
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    
    setIsLoading(true);
    // Simulate a small delay to show loading state
    setTimeout(() => {
      setIsLoading(false);
      setIsPurchaseModalOpen(true);
    }, 300);
  };

  return (
    <div className="mt-6 space-y-4">
      <Button 
        className="w-full bg-[#2ECC71] hover:bg-[#27AE60] shadow-sm font-semibold text-white h-12 rounded-md transition-all duration-300"
        size="lg"
        disabled={isOutOfStock}
        isLoading={isLoading}
        onClick={handleBuyNow}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        Buy Now
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
