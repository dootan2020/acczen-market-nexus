
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// PayPal Buttons wrapper with loading and error states
const PayPalButtonWrapper = ({ amount, onSuccess }) => {
  const [{ isPending, isRejected, isResolved, options }] = usePayPalScriptReducer();
  
  if (isPending) return <div className="w-full h-10 bg-gray-100 animate-pulse rounded-md"></div>;
  
  if (isRejected) return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>PayPal Error</AlertTitle>
      <AlertDescription>
        Could not load PayPal. Please try again later or use another payment method.
      </AlertDescription>
    </Alert>
  );
  
  return (
    <PayPalButtons 
      style={{ layout: 'vertical', color: 'blue', shape: 'rect' }}
      createOrder={(data, actions) => {
        return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [{
            amount: {
              currency_code: options.currency || "USD",
              value: amount.toString()
            }
          }]
        });
      }}
      onApprove={async (data, actions) => {
        const orderDetails = await actions?.order?.capture();
        if (orderDetails) {
          onSuccess(orderDetails, amount);
        }
      }}
      onError={(err) => {
        console.error("PayPal Button Error:", err);
        toast.error('PayPal Error', {
          description: 'An error occurred with PayPal payment'
        });
      }}
    />
  );
};

const PayPalDeposit = () => {
  const { user } = useAuth();
  const [customAmount, setCustomAmount] = useState('');
  const [directAmount, setDirectAmount] = useState('');
  const [showManualOption, setShowManualOption] = useState(false);
  const navigate = useNavigate();

  // PayPal configuration
  const paypalConfig = {
    clientId: "ATFgOxb5_ulsypPJ944oFWC0p9YeGGcDmH5hzRqTgMTVfpR-jB2aHJ4-PA-0uK3TA58CT_Gc8PZozUCK",
    currency: "USD",
    intent: "capture",
    components: "buttons",
    disableFunding: "credit,card",
    dataDsr: "false"
  };

  // Detect if PayPal fails to load after a certain time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowManualOption(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const presetAmounts = [10, 20, 50, 100];

  const handlePayPalSuccess = async (orderDetails, amount) => {
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

  // Handle manual deposit request
  const handleManualDeposit = async () => {
    try {
      const amount = parseFloat(directAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Invalid Amount', {
          description: 'Please enter a valid amount'
        });
        return;
      }

      toast.success('Deposit Request Submitted', {
        description: `Your request to deposit $${amount} has been submitted for manual approval.`
      });

      // In a real app, you would create a pending deposit record here
      // and send it to the admin for approval
      
      // For demo purposes, we'll create a mock deposit
      const mockDeposit = {
        id: `manual-${Date.now()}`,
        user_id: user?.id,
        amount: amount,
        status: 'pending',
        payment_method: 'Manual Transfer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      navigate('/deposit/success', { 
        state: { 
          deposit: mockDeposit
        }
      });
    } catch (error) {
      toast.error('Request Failed', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  };

  return (
    <PayPalScriptProvider options={paypalConfig}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {presetAmounts.map(amount => (
            <div key={amount} className="relative rounded-md border shadow-sm p-4 text-center">
              <div className="font-semibold mb-2">${amount}</div>
              <PayPalButtonWrapper amount={amount} onSuccess={handlePayPalSuccess} />
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Custom Amount</h3>
          <div className="flex flex-col space-y-2">
            <Input 
              type="number" 
              placeholder="Enter amount (USD)" 
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="1"
              className="mb-2"
            />
            <div className="h-[50px]">
              {customAmount && parseFloat(customAmount) > 0 && (
                <PayPalButtonWrapper 
                  amount={parseFloat(customAmount)} 
                  onSuccess={handlePayPalSuccess} 
                />
              )}
            </div>
          </div>
        </div>

        {/* Manual deposit option that shows if PayPal doesn't load */}
        {showManualOption && (
          <div className="border-t pt-4">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Having trouble with PayPal?</AlertTitle>
              <AlertDescription>
                You can request a manual deposit that will be processed by our team.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col space-y-2">
              <Input 
                type="number" 
                placeholder="Enter amount for manual deposit" 
                value={directAmount}
                onChange={(e) => setDirectAmount(e.target.value)}
                min="1"
              />
              <Button onClick={handleManualDeposit}>
                Request Manual Deposit
              </Button>
            </div>
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalDeposit;
