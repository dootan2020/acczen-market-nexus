
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductQuantityProps {
  quantity: number;
  stockQuantity: number;
  onQuantityChange: (quantity: number) => void;
}

const ProductQuantity = ({ 
  quantity, 
  stockQuantity, 
  onQuantityChange 
}: ProductQuantityProps) => {
  const isOutOfStock = stockQuantity === 0;
  const isMinQuantity = quantity <= 1;
  const isMaxQuantity = quantity >= stockQuantity;

  const decreaseQuantity = () => {
    onQuantityChange(Math.max(1, quantity - 1));
  };

  const increaseQuantity = () => {
    onQuantityChange(Math.min(stockQuantity, quantity + 1));
  };

  return (
    <div className="flex items-center">
      <span className="mr-3 font-medium text-gray-700">Số lượng:</span>
      <div className="flex items-center border rounded-md overflow-hidden">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className={cn(
            "h-10 w-10 rounded-none border-r",
            isMinQuantity || isOutOfStock ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
          )}
          onClick={decreaseQuantity}
          disabled={isMinQuantity || isOutOfStock}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input 
          type="number"
          min="1"
          max={stockQuantity}
          className="h-10 w-14 rounded-none border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={quantity}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 1 && value <= stockQuantity) {
              onQuantityChange(value);
            }
          }}
          disabled={isOutOfStock}
        />
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-10 w-10 rounded-none border-l",
            isMaxQuantity || isOutOfStock ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
          )}
          onClick={increaseQuantity}
          disabled={isMaxQuantity || isOutOfStock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductQuantity;
