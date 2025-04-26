
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight, Clock, Share2 } from "lucide-react";

interface ProductActionsProps {
  isOutOfStock: boolean;
  onAddToCart: () => void;
}

const ProductActions = ({ isOutOfStock, onAddToCart }: ProductActionsProps) => {
  return (
    <div className="mt-auto grid grid-cols-2 gap-3">
      <Button 
        className="shadow-sm"
        size="lg"
        onClick={onAddToCart}
        disabled={isOutOfStock}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Thêm vào giỏ
      </Button>

      <Button 
        className="bg-[#2ECC71] hover:bg-[#27AE60] shadow-md"
        size="lg"
        disabled={isOutOfStock}
      >
        Mua ngay
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      
      <Button 
        className="col-span-2 md:col-span-1"
        variant="outline"
        size="lg"
      >
        <Clock className="mr-2 h-5 w-5" />
        Đặt trước
      </Button>
      
      <Button 
        className="col-span-2 md:col-span-1"
        variant="outline"
        size="lg"
      >
        <Share2 className="mr-2 h-5 w-5" />
        Chia sẻ
      </Button>
    </div>
  );
};

export default ProductActions;
