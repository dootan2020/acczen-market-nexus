
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
  isNewDesign?: boolean;
}

export const PurchaseModalActions = ({
  isProcessing,
  onCancel,
  onConfirm,
  onDeposit,
  onRetry,
  disabled = false,
  insufficientBalance = false,
  hasError = false,
  isNewDesign = false
}: PurchaseModalActionsProps) => {
  return (
    <DialogFooter className="flex flex-row justify-between gap-4">
      {isNewDesign ? (
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-gray-300"
            disabled={isProcessing}
          >
            CLOSE
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isProcessing || disabled}
            className="flex-1 bg-[#1EAEDB] hover:bg-[#1a9bc3]"
          >
            {isProcessing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                PROCESSING...
              </>
            ) : (
              'BUY'
            )}
          </Button>
        </>
      ) : (
        <>
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
        </>
      )}
    </DialogFooter>
  );
};
