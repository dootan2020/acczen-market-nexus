
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
      <span className="mr-3 text-sm font-medium text-gray-700">Quantity:</span>
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className={cn(
            "h-9 w-9 rounded-none border-r border-gray-200",
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
          className="h-9 w-12 rounded-none border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
            "h-9 w-9 rounded-none border-l border-gray-200",
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
