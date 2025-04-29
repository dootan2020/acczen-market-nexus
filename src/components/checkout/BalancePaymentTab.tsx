
import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import TrustBadges from '@/components/trust/TrustBadges';

interface BalancePaymentTabProps {
  balanceUSD: number;
  totalUSD: number;
  hasEnoughBalance: boolean;
  isProcessing: boolean;
  onPurchase: () => void;
}

const BalancePaymentTab = ({ 
  balanceUSD, 
  totalUSD, 
  hasEnoughBalance, 
  isProcessing, 
  onPurchase 
}: BalancePaymentTabProps) => {
  const { formatUSD } = useCurrencyContext();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Current Balance:</span>
          <span className="font-medium text-lg">{formatUSD(balanceUSD)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Order Total:</span>
          <span className="font-medium text-lg">{formatUSD(totalUSD)}</span>
        </div>
        {hasEnoughBalance ? (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded border border-green-200 text-sm">
            You have sufficient funds to complete this purchase.
          </div>
        ) : (
          <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded border border-amber-200 text-sm">
            Insufficient balance. Please add {formatUSD(totalUSD - balanceUSD)} to complete this purchase.
          </div>
        )}
      </div>
      
      <Button 
        onClick={onPurchase} 
        disabled={isProcessing || !hasEnoughBalance}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Clock className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Purchase'
        )}
      </Button>
      
      <TrustBadges variant="compact" />
    </div>
  );
};

export default BalancePaymentTab;
