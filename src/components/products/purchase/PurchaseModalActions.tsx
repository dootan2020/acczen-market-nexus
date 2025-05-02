
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader } from "lucide-react";

interface PurchaseModalActionsProps {
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onDeposit?: () => void;
  onRetry?: () => void;
  disabled?: boolean;
  insufficientBalance?: boolean;
  hasError?: boolean;
}

export const PurchaseModalActions = ({
  isProcessing,
  onCancel,
  onConfirm,
  onDeposit,
  onRetry,
  disabled = false,
  insufficientBalance = false,
  hasError = false
}: PurchaseModalActionsProps) => {
  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
      <Button
        variant="outline"
        onClick={onCancel}
        className="sm:mr-auto"
        disabled={isProcessing}
      >
        {hasError ? 'Close' : 'Cancel'}
      </Button>
      
      {insufficientBalance && onDeposit && (
        <Button
          variant="secondary"
          onClick={onDeposit}
          disabled={isProcessing}
        >
          Deposit
        </Button>
      )}
      
      {hasError && onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          disabled={isProcessing}
        >
          Try Again
        </Button>
      )}
      
      {!hasError && (
        <Button 
          onClick={onConfirm} 
          disabled={isProcessing || disabled || insufficientBalance}
          className="bg-[#2ECC71] hover:bg-[#27AE60]"
        >
          {isProcessing ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Checkout'
          )}
        </Button>
      )}
    </DialogFooter>
  );
};
