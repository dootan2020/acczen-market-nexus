
import React from 'react';
import { Button } from "@/components/ui/button";

interface USDTPresetAmountsProps {
  selectedAmount: string;
  onAmountSelect: (value: string) => void;
  disabled?: boolean;
}

export const USDTPresetAmounts: React.FC<USDTPresetAmountsProps> = ({ 
  selectedAmount, 
  onAmountSelect,
  disabled = false
}) => {
  const presetAmounts = ['50', '100', '200', '500', '1000'];
  
  return (
    <div className="space-y-2">
      <span className="text-sm text-muted-foreground">Quick Select:</span>
      <div className="grid grid-cols-5 gap-2">
        {presetAmounts.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant={selectedAmount === amount ? "default" : "outline"}
            className={selectedAmount === amount ? "bg-chatgpt-primary hover:bg-chatgpt-primary/90" : ""}
            onClick={() => onAmountSelect(amount)}
            disabled={disabled}
          >
            ${amount}
          </Button>
        ))}
      </div>
    </div>
  );
};
