
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader, ShoppingBag, Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

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
  const [confirmClicked, setConfirmClicked] = useState(false);
  
  const handleConfirmClick = () => {
    if (insufficientBalance) {
      return;
    }
    
    if (!confirmClicked && !isProcessing && !disabled) {
      setConfirmClicked(true);
      setTimeout(() => {
        onConfirm();
        setConfirmClicked(false);
      }, 100);
    }
  };
  
  // Fix: Ensure the checkout button is properly enabled/disabled
  const checkoutButtonDisabled = isProcessing || disabled;
  
  return (
    <DialogFooter className="flex flex-row justify-between gap-4 sm:gap-2">
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
            onClick={handleConfirmClick} 
            disabled={checkoutButtonDisabled}
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={onDeposit}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Add Funds
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add funds to your account to complete this purchase</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
              onClick={handleConfirmClick} 
              disabled={checkoutButtonDisabled}
              className="bg-[#2ECC71] hover:bg-[#27AE60] min-w-[120px]"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Checkout
                </>
              )}
            </Button>
          )}
        </>
      )}
    </DialogFooter>
  );
};
