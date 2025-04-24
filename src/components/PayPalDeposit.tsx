
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const PayPalDeposit = () => {
  const { user } = useAuth();
  const [customAmount, setCustomAmount] = useState('');
  const navigate = useNavigate();

  // PayPal configuration
  const paypalConfig = {
    clientId: "your-paypal-client-id",
    currency: "USD",
    intent: "capture"
  };

  const presetAmounts = [10, 20, 50, 100];

  const handlePayPalSuccess = async (orderDetails: any, amount: number) => {
    try {
      // Call our edge function to process deposit
      const response = await supabase.functions.invoke('process-paypal-deposit', {
        body: JSON.stringify({
          orderID: orderDetails.id,
          amount: amount,
          userID: user?.id
        })
      });

      if (response.data?.success) {
        toast({
          title: 'Deposit Successful',
          description: `$${amount} has been added to your account`
        });
        
        // Navigate to success page if we have deposit data
        if (response.data.deposit) {
          navigate('/deposit/success', { 
            state: { 
              deposit: response.data.deposit,
              transaction: response.data.transaction
            } 
          });
        }
      } else {
        toast({
          title: 'Deposit Failed',
          description: response.data?.message || 'Something went wrong',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Deposit Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  };

  return (
    <PayPalScriptProvider options={paypalConfig}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {presetAmounts.map(amount => (
            <PayPalButtons 
              key={amount}
              style={{ layout: 'vertical', color: 'blue', shape: 'rect' }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [{
                    amount: {
                      currency_code: "USD",
                      value: amount.toString()
                    }
                  }]
                });
              }}
              onApprove={async (data, actions) => {
                const orderDetails = await actions?.order?.capture();
                if (orderDetails) {
                  handlePayPalSuccess(orderDetails, amount);
                }
              }}
              onError={(err) => {
                toast({
                  title: 'PayPal Error',
                  description: 'An error occurred with PayPal payment',
                  variant: 'destructive'
                });
              }}
            />
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Input 
            type="number" 
            placeholder="Custom Amount" 
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min="1"
          />
          <PayPalButtons 
            style={{ layout: 'vertical', color: 'blue', shape: 'rect' }}
            disabled={!customAmount || parseFloat(customAmount) <= 0}
            createOrder={(data, actions) => {
              const amount = parseFloat(customAmount);
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [{
                  amount: {
                    currency_code: "USD",
                    value: amount.toString()
                  }
                }]
              });
            }}
            onApprove={async (data, actions) => {
              const orderDetails = await actions?.order?.capture();
              if (orderDetails) {
                const amount = parseFloat(customAmount);
                handlePayPalSuccess(orderDetails, amount);
                setCustomAmount('');
              }
            }}
            onError={(err) => {
              toast({
                title: 'PayPal Error',
                description: 'An error occurred with PayPal payment',
                variant: 'destructive'
              });
            }}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalDeposit;
