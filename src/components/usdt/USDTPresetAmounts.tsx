
import React from 'react';
import { Button } from "@/components/ui/button";

interface USDTPresetAmountsProps {
  selectedAmount: string;
  onAmountSelect: (amount: string) => void;
}

export const USDTPresetAmounts = ({
  selectedAmount,
  onAmountSelect,
}: USDTPresetAmountsProps) => {
  const presets = ["10", "20", "50", "100", "200", "500"];
  
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Quick amounts</p>
      <div className="grid grid-cols-3 gap-2">
        {presets.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant={selectedAmount === amount ? "default" : "outline"}
            className="text-sm h-8"
            onClick={() => onAmountSelect(amount)}
          >
            ${amount}
          </Button>
        ))}
      </div>
    </div>
  );
};
