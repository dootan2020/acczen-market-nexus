
import { Button } from "@/components/ui/button";
import { Check, Clock, CopyIcon, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PurchaseResultCardProps {
  orderId: string;
  productKeys?: string[];
  isCheckingOrder: boolean;
  onCheckOrder: () => void;
  onReset: () => void;
  onClose: () => void;
}

export function PurchaseResultCard({
  orderId,
  productKeys,
  isCheckingOrder,
  onCheckOrder,
  onReset,
  onClose
}: PurchaseResultCardProps) {
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({});

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Key copied to clipboard');
    setCopySuccess({ ...copySuccess, [key]: true });
    setTimeout(() => {
      setCopySuccess({ ...copySuccess, [key]: false });
    }, 3000);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-green-100 p-3 rounded-full">
          <Check className="h-6 w-6 text-green-600" />
        </div>
      </div>
      
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg mb-1">Order Successful!</h3>
        <p className="text-muted-foreground text-sm">
          Order ID: <span className="font-medium">{orderId}</span>
        </p>
      </div>

      {productKeys && productKeys.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Your Product Keys:</h4>
          <div className="bg-white border rounded-md">
            {productKeys.map((key, index) => (
              <div 
                key={index} 
                className={`
                  flex items-center justify-between p-3 text-sm 
                  ${index !== productKeys.length - 1 ? 'border-b' : ''}
                `}
              >
                <span className="font-mono truncate">{key}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleCopyKey(key)}
                  className="h-8 px-2"
                >
                  {copySuccess[key] ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Order is being processed
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Your order is being processed. Product keys will appear here when ready.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCheckOrder}
              disabled={isCheckingOrder}
              className="text-xs"
            >
              {isCheckingOrder ? (
                <>
                  <Loader className="mr-1 h-3 w-3 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check status'
              )}
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex pt-4 justify-between">
        {productKeys && productKeys.length > 0 ? (
          <>
            <Button variant="outline" size="sm" onClick={onReset}>
              New Purchase
            </Button>
            <Button onClick={onClose} className="bg-primary hover:bg-primary-dark">
              Close
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onReset}>
              Cancel
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              View Order
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
