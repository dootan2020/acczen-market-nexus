
import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';

interface PayPalButtonWrapperProps {
  amount: number;
  onSuccess: (details: any, amount: number) => Promise<void>;
}

export const PayPalButtonWrapper: React.FC<PayPalButtonWrapperProps> = ({ amount, onSuccess }) => {
  // Create order function
  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount.toFixed(2),
            currency_code: "USD"
          },
          description: "Deposit to account balance"
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING"
      }
    });
  };

  // Order approval handler
  const onApprove = async (data: any, actions: any) => {
    try {
      const orderDetails = await actions.order.capture();
      await onSuccess(orderDetails, amount);
    } catch (error) {
      console.error("PayPal capture error:", error);
      toast.error("Payment processing error", { description: "There was a problem processing your payment. Please try again." });
    }
  };

  // Error handler
  const onError = (err: any) => {
    console.error("PayPal error:", err);
    toast.error("Payment Error", { description: "There was a problem with PayPal. Please try a different payment method." });
  };

  return (
    <PayPalButtons 
      style={{ 
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay'
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
    />
  );
};
