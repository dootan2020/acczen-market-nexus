
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PurchaseModalHeaderProps {
  hasError?: boolean;
}

export function PurchaseModalHeader({ hasError = false }: PurchaseModalHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>{hasError ? 'Lỗi thanh toán' : 'Xác nhận mua hàng'}</DialogTitle>
      <DialogDescription>
        {hasError ? 
          'Đã xảy ra lỗi khi xử lý thanh toán của bạn.' : 
          'Hoàn tất giao dịch mua hàng bằng số dư tài khoản.'
        }
      </DialogDescription>
    </DialogHeader>
  );
}
