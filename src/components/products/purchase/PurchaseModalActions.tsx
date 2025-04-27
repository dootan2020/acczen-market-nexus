
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PurchaseModalActionsProps {
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PurchaseModalActions({
  isProcessing,
  onCancel,
  onConfirm
}: PurchaseModalActionsProps) {
  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2">
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
        disabled={isProcessing}
        className="bg-[#F97316] hover:bg-[#EA580C]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          'Xác nhận mua'
        )}
      </Button>
    </DialogFooter>
  );
}
