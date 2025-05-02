
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader } from "lucide-react";
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard");
    
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };
  
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-green-50 border border-green-100 rounded-md p-4 text-green-700 flex items-start gap-3">
        <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
        <div>
          <p className="font-semibold">Purchase successful!</p>
          <p className="text-sm text-green-600 mt-1">Your order #{orderId} has been processed successfully.</p>
        </div>
      </div>
      
      {productKeys && productKeys.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h4 className="font-medium text-sm">Your Product Keys</h4>
          </div>
          <ul className="divide-y">
            {productKeys.map((key, i) => (
              <li key={i} className="p-3 flex items-center justify-between hover:bg-gray-50">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono overflow-hidden overflow-ellipsis">{key}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(key, i)}
                >
                  {copiedIndex === i ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="border rounded-md p-4 text-center">
          {isCheckingOrder ? (
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Checking order status...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                We're processing your order. Your product keys will appear here soon.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCheckOrder}
                className="mx-auto"
              >
                Check Status
              </Button>
            </>
          )}
        </div>
      )}
      
      <div className="flex justify-end gap-3 mt-2">
        <Button variant="outline" onClick={onReset} disabled={isCheckingOrder}>
          Buy Another
        </Button>
        <Button onClick={onClose} disabled={isCheckingOrder}>
          Complete
        </Button>
      </div>
    </div>
  );
}
