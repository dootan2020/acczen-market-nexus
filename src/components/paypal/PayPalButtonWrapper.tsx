
import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PayPalButtonWrapperProps {
  amount: number;
  onSuccess: (orderDetails: any, amount: number) => Promise<void>;
}

export const PayPalButtonWrapper: React.FC<PayPalButtonWrapperProps> = ({ amount, onSuccess }) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  
  if (isPending) return (
    <div className="w-full h-12 bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
    </div>
  );
  
  if (isRejected) return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>PayPal Error</AlertTitle>
      <AlertDescription>
        Could not load PayPal. Please check your internet connection or try again later.
        {errorDetails && <div className="mt-2 text-xs overflow-auto max-h-20">{errorDetails}</div>}
      </AlertDescription>
    </Alert>
  );
  
  const handleApprove = async (data: any, actions: any) => {
    setIsProcessing(true);
    try {
      const orderDetails = await actions?.order?.capture();
      if (orderDetails) {
        await onSuccess(orderDetails, amount);
      }
    } catch (error) {
      console.error("PayPal Capture Error:", error);
      setErrorDetails(error instanceof Error ? error.message : JSON.stringify(error));
      toast.error('Payment Processing Error', {
        description: 'There was an error capturing your payment'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <PayPalButtons 
      style={{ layout: 'vertical', color: 'blue', shape: 'rect', height: 45 }}
      createOrder={(data, actions) => {
        return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [{
            amount: {
              currency_code: "USD",
              value: amount.toString()
            },
            description: `Deposit funds - $${amount}`
          }]
        });
      }}
      onApprove={handleApprove}
      onCancel={() => {
        toast.info('Payment Cancelled', {
          description: 'You cancelled the PayPal payment'
        });
      }}
      onError={(err) => {
        console.error("PayPal Button Error:", err);
        setErrorDetails(err instanceof Error ? err.message : JSON.stringify(err));
        toast.error('PayPal Error', {
          description: 'An error occurred with PayPal payment. Please try again later.'
        });
      }}
      disabled={isProcessing}
    />
  );
};
