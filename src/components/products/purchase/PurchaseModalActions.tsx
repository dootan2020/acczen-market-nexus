
import { Button } from "@/components/ui/button";
import { AlertCircle, ShoppingBag } from "lucide-react";

interface PurchaseModalActionsProps {
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  disabled?: boolean;
  insufficientBalance?: boolean;
}

export const PurchaseModalActions = ({
  isProcessing,
  onCancel,
  onConfirm,
  disabled = false,
  insufficientBalance = false
}: PurchaseModalActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isProcessing}
      >
        Cancel
      </Button>
      
      <Button
        type="button"
        onClick={onConfirm}
        disabled={isProcessing || disabled || insufficientBalance}
        className="bg-[#2ECC71] hover:bg-[#27AE60] text-white"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : disabled ? (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Not Available
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Confirm Purchase
          </>
        )}
      </Button>
    </div>
  );
}
