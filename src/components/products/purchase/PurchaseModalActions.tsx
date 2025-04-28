
import { Button } from "@/components/ui/button";
import { AlertCircle, ShoppingBag } from "lucide-react";

interface PurchaseModalActionsProps {
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export const PurchaseModalActions = ({
  isProcessing,
  onCancel,
  onConfirm,
  disabled = false
}: PurchaseModalActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isProcessing}
      >
        Hủy bỏ
      </Button>
      
      <Button
        type="button"
        onClick={onConfirm}
        disabled={isProcessing || disabled}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </>
        ) : disabled ? (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Không khả dụng
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Xác nhận mua
          </>
        )}
      </Button>
    </div>
  );
};
