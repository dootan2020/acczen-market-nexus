
import React from 'react';
import { Button } from "@/components/ui/button";

interface USDTPresetAmountsProps {
  selectedAmount: string;
  onAmountSelect: (amount: string) => void;
}

export const USDTPresetAmounts: React.FC<USDTPresetAmountsProps> = ({
  selectedAmount,
  onAmountSelect,
}) => {
  const presetAmounts = [10, 20, 50, 100];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {presetAmounts.map((preset) => (
        <Button
          key={preset}
          type="button"
          variant={selectedAmount === preset.toString() ? "default" : "outline"}
          className="w-full"
          onClick={() => onAmountSelect(preset.toString())}
        >
          ${preset}
        </Button>
      ))}
    </div>
  );
};
