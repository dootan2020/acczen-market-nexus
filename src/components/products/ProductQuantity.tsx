
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

interface ProductQuantityProps {
  value: string;
  onChange: (value: string) => void;
  maxQuantity: number;
  disabled?: boolean;
}

const ProductQuantity: React.FC<ProductQuantityProps> = ({
  value,
  onChange,
  maxQuantity,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Update internal state when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const increment = () => {
    const currentValue = parseInt(value);
    if (currentValue < maxQuantity) {
      const newValue = (currentValue + 1).toString();
      onChange(newValue);
    }
  };

  const decrement = () => {
    const currentValue = parseInt(value);
    if (currentValue > 1) {
      const newValue = (currentValue - 1).toString();
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only allow numeric input
    if (newValue === '' || /^\d+$/.test(newValue)) {
      setInputValue(newValue);
    }
  };

  const handleBlur = () => {
    let newValue = parseInt(inputValue || '0');
    
    // Enforce valid range
    if (isNaN(newValue) || newValue < 1) {
      newValue = 1;
    } else if (newValue > maxQuantity) {
      newValue = maxQuantity;
    }
    
    setInputValue(newValue.toString());
    onChange(newValue.toString());
  };

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-r-none border-r-0 bg-muted hover:bg-muted/80 hover:text-primary"
        onClick={decrement}
        disabled={parseInt(value) <= 1 || disabled}
        type="button"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="h-9 w-16 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        disabled={disabled}
        aria-label="Quantity"
      />
      
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-l-none border-l-0 bg-muted hover:bg-muted/80 hover:text-primary"
        onClick={increment}
        disabled={parseInt(value) >= maxQuantity || disabled}
        type="button"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductQuantity;
