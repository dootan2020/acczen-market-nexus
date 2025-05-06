
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { PurchaseModalProvider } from '@/contexts/PurchaseModalContext';
import { PurchaseModalContent } from './PurchaseModalContent';

interface PurchaseConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string; // Keeping prop for compatibility but not using it
  quantity: number;
  kioskToken: string | null;
  stock: number;
}

export const PurchaseConfirmModal: React.FC<PurchaseConfirmModalProps> = ({
  open,
  onOpenChange,
  productId,
  productName,
  productPrice,
  productImage, // Not used anymore
  quantity,
  kioskToken,
  stock
}) => {
  // Reset the modal state when it opens/closes
  useEffect(() => {
    // This effect is intentionally left empty as the context provider 
    // now handles state initialization and cleanup
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Confirm Purchase
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review your purchase details before completing the transaction.
          </DialogDescription>
        </DialogHeader>
        
        <Separator />
        
        <PurchaseModalProvider
          productId={productId}
          productName={productName}
          productPrice={productPrice}
          initialQuantity={quantity}
          kioskToken={kioskToken}
          stock={stock}
          onOpenChange={onOpenChange}
        >
          <PurchaseModalContent 
            productName={productName}
            stock={stock}
            kioskToken={kioskToken}
          />
        </PurchaseModalProvider>
      </DialogContent>
    </Dialog>
  );
};
