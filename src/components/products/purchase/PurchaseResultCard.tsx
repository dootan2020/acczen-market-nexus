
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseResultCardProps {
  orderId: string;
  productKeys?: string[];
  isCheckingOrder: boolean;
  onCheckOrder: () => void;
  onReset: () => void;
  onClose: () => void;
}

export const PurchaseResultCard = ({
  orderId,
  productKeys,
  isCheckingOrder,
  onCheckOrder,
  onReset,
  onClose
}: PurchaseResultCardProps) => {
  const handleCopyKeys = async () => {
    if (!productKeys || productKeys.length === 0) return;
    
    try {
      await navigator.clipboard.writeText(productKeys.join('\n'));
      toast.success('Product keys copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy keys:', error);
      toast.error('Failed to copy keys to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      {/* Success indicator */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium">Purchase Complete</h3>
        <p className="text-sm text-muted-foreground text-center">
          Your order #{orderId} has been processed successfully
        </p>
      </div>
      
      {/* Product keys section */}
      {productKeys && productKeys.length > 0 ? (
        <div className="bg-muted p-3 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Product Keys</h4>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleCopyKeys}
              className="h-8"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy All
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {productKeys.map((key, index) => (
              <div 
                key={index} 
                className="bg-background border text-xs p-2 rounded font-mono break-all"
              >
                {key}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-muted p-4 rounded-md">
          {isCheckingOrder ? (
            <div className="flex flex-col items-center justify-center py-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-sm text-center">Retrieving your product information...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <Button onClick={onCheckOrder} variant="outline" size="sm" className="mb-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Order Status
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your order is being processed. Product keys will appear here shortly.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onReset}>
          New Purchase
        </Button>
        <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Order
        </Button>
      </div>
    </div>
  );
};
