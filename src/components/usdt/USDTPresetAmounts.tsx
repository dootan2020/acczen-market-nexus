
import React from 'react';
import { Button } from "@/components/ui/button";

export interface USDTPresetAmountsProps {
  selectedAmount: string;
  onAmountSelect: (value: string) => void;
  disabled?: boolean;
}

export function USDTPresetAmounts({ selectedAmount, onAmountSelect, disabled = false }: USDTPresetAmountsProps) {
  const presetAmounts = ['10', '20', '50', '100', '250', '500'];
  
  // Helper to determine if a preset amount is selected
  const isSelected = (amount: string): boolean => {
    return selectedAmount === amount;
  };
  
  return (
    <div className="grid grid-cols-3 gap-2">
      {presetAmounts.map((amount) => (
        <Button
          key={amount}
          type="button"
          variant={isSelected(amount) ? "default" : "outline"}
          className="w-full"
          onClick={() => onAmountSelect(amount)}
          disabled={disabled}
        >
          ${amount}
        </Button>
      ))}
    </div>
  );
}
