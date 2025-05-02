
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PurchaseModalHeaderProps {
  hasError?: boolean;
}

export function PurchaseModalHeader({ hasError = false }: PurchaseModalHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>{hasError ? 'Payment Error' : 'Confirm Purchase'}</DialogTitle>
      <DialogDescription>
        {hasError ? 
          'There was an error processing your payment.' : 
          'Complete your purchase using your account balance.'
        }
      </DialogDescription>
    </DialogHeader>
  );
}
