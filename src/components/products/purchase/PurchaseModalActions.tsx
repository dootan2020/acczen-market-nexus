
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
        {hasError ? 'Đóng' : 'Hủy'}
      </Button>
      
      {insufficientBalance && onDeposit && (
        <Button
          variant="secondary"
          onClick={onDeposit}
          disabled={isProcessing}
        >
          Nạp tiền
        </Button>
      )}
      
      {hasError && onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          disabled={isProcessing}
        >
          Thử lại
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
              Đang xử lý...
            </>
          ) : (
            'Mua ngay'
          )}
        </Button>
      )}
    </DialogFooter>
  );
};
