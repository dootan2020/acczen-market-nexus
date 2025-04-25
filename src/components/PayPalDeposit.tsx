
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PayPalDeposit = () => {
  const { user } = useAuth();
  const [customAmount, setCustomAmount] = useState('');
  const navigate = useNavigate();

  // PayPal configuration
  const paypalConfig = {
    clientId: "ATFgOxb5_ulsypPJ944oFWC0p9YeGGcDmH5hzRqTgMTVfpR-jB2aHJ4-PA-0uK3TA58CT_Gc8PZozUCK",
    currency: "USD",
    intent: "capture"
  };

  const presetAmounts = [10, 20, 50, 100];

  const handlePayPalSuccess = async (orderDetails: any, amount: number) => {
    try {
      // Call our edge function to process deposit
      const { data, error } = await supabase.functions.invoke('process-paypal-deposit', {
        body: {
          orderID: orderDetails.id,
          amount: amount,
          userID: user?.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Deposit Successful', {
          description: `$${amount} has been added to your account`
        });
        
        navigate('/deposit/success', { 
          state: { 
            deposit: data.deposit,
            transaction: data.transaction
          }
        });
      } else {
        toast.error('Deposit Failed', {
          description: data?.message || 'Something went wrong'
        });
      }
    } catch (error) {
      toast.error('Deposit Failed', {
        description: error instanceof Error ? error.message : 'An error occurred'
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
                toast.error('PayPal Error', {
                  description: 'An error occurred with PayPal payment'
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
            className="flex-1"
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
              toast.error('PayPal Error', {
                description: 'An error occurred with PayPal payment'
              });
            }}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalDeposit;
