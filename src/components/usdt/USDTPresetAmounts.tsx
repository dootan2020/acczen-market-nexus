
import React from 'react';
import { Button } from "@/components/ui/button";

export interface USDTPresetAmountsProps {
  selectedAmount: string;
  onAmountSelect: (value: string) => void;
  disabled?: boolean; // Add disabled as optional prop
}

export function USDTPresetAmounts({ selectedAmount, onAmountSelect, disabled }: USDTPresetAmountsProps) {
  const presetAmounts = ['10', '20', '50', '100', '250', '500'];
  
  return (
    <div className="grid grid-cols-3 gap-2">
      {presetAmounts.map((amount) => (
        <Button
          key={amount}
          type="button"
          variant={selectedAmount === amount ? "default" : "outline"}
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
