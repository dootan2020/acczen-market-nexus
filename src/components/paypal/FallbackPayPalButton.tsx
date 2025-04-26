
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FallbackPayPalButtonProps {
  amount: number;
  onSuccess: (orderDetails: any, amount: number) => Promise<void>;
}

export const FallbackPayPalButton: React.FC<FallbackPayPalButtonProps> = ({ amount, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleClick = () => {
    setIsProcessing(true);
    const paypalWindow = window.open(
      `https://www.paypal.com/checkout?currency=USD&amount=${amount}`,
      '_blank'
    );
    
    if (paypalWindow) {
      toast.info('PayPal Checkout Opened', { 
        description: 'Please complete your payment in the new window and return to this page.' 
      });
    } else {
      toast.error('Popup Blocked', { 
        description: 'Please allow popups for this site and try again.' 
      });
      setIsProcessing(false);
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      disabled={isProcessing}
      variant="outline"
      className="w-full bg-[#0070ba] text-white hover:bg-[#005ea6]"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>Pay with PayPal</>
      )}
    </Button>
  );
};
