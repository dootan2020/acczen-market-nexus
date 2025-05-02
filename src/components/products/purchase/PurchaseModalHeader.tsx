
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PurchaseModalHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Confirm Purchase</DialogTitle>
      <DialogDescription>
        Complete your purchase securely using your account balance.
      </DialogDescription>
    </DialogHeader>
  );
}
