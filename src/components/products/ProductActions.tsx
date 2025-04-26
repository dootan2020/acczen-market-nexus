
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";

interface ProductActionsProps {
  isOutOfStock: boolean;
  onAddToCart: () => void;
}

const ProductActions = ({ isOutOfStock, onAddToCart }: ProductActionsProps) => {
  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:gap-4">
      <Button 
        className="w-full shadow-sm font-bold"
        size="lg"
        onClick={onAddToCart}
        disabled={isOutOfStock}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Thêm vào giỏ
      </Button>

      <Button 
        className="w-full bg-[#F97316] hover:bg-[#EA580C] shadow-md font-bold"
        size="lg"
        disabled={isOutOfStock}
      >
        Mua ngay
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default ProductActions;
