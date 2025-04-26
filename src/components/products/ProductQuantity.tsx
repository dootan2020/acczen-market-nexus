
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

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

  const decreaseQuantity = () => {
    onQuantityChange(Math.max(1, quantity - 1));
  };

  const increaseQuantity = () => {
    onQuantityChange(Math.min(stockQuantity, quantity + 1));
  };

  return (
    <div className="flex items-center mb-6">
      <span className="mr-4 font-medium">Số lượng:</span>
      <div className="flex items-center border rounded-md">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-none border-r"
          onClick={decreaseQuantity}
          disabled={quantity <= 1 || isOutOfStock}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input 
          type="number"
          min="1"
          max={stockQuantity}
          className="h-9 w-14 rounded-none border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          className="h-9 w-9 rounded-none border-l"
          onClick={increaseQuantity}
          disabled={quantity >= stockQuantity || isOutOfStock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductQuantity;
