
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function PurchaseModalHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Xác nhận mua hàng</DialogTitle>
      <DialogDescription>
        Vui lòng xác nhận thông tin mua hàng dưới đây
      </DialogDescription>
    </DialogHeader>
  );
}
