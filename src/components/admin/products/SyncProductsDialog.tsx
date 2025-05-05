
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, RefreshCcw } from 'lucide-react';

interface SyncProductsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSync: () => Promise<any>;
  isPending: boolean;
}

export function SyncProductsDialog({
  isOpen,
  onOpenChange,
  onSync,
  isPending
}: SyncProductsDialogProps) {
  const handleSync = async () => {
    try {
      await onSync();
      onOpenChange(false);
    } catch (error) {
      console.error('Sync error:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sync Products with API</DialogTitle>
          <DialogDescription>
            This will synchronize your products with the TaphoaMMO API to update prices and inventory.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="bg-muted/50 p-4 rounded-md text-sm">
            <h4 className="font-medium mb-2">What happens during sync?</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Product prices will be updated from the API</li>
              <li>Stock quantities will be refreshed</li>
              <li>Products with no stock may be marked as out of stock</li>
              <li>This process may take a few moments to complete</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSync}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
