import React, { useState } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PAYPAL_OPTIONS } from './paypal-config';
import { PayPalButtonWrapper } from './PayPalButtonWrapper';
import { PayPalErrorBoundary } from './PayPalErrorBoundary';

const PayPalDeposit = () => {
  const { user } = useAuth();
  const [customAmount, setCustomAmount] = useState('');
  const [directAmount, setDirectAmount] = useState('');
  const [showManualOption, setShowManualOption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handlePayPalSuccess = async (orderDetails: any, amount: number) => {
    if (!user?.id) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to make a deposit'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const idempotencyKey = `${user.id}-${orderDetails.id}-${Date.now()}`;
      
      const { data, error } = await supabase.functions.invoke('process-paypal-deposit', {
        body: {
          orderID: orderDetails.id,
          amount: amount,
          userID: user.id,
          idempotencyKey
        }
      });

      if (error) throw new Error(error.message || 'Failed to process deposit');

      if (data?.success) {
        toast.success('Deposit Successful', {
          description: `$${amount} has been added to your account`
        });
        
        navigate('/deposit/success', { 
          state: { 
            deposit: {
              id: data.depositId || orderDetails.id,
              user_id: user.id,
              amount: amount,
              payment_method: 'PayPal',
              status: 'completed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              paypal_order_id: orderDetails.id,
              paypal_payer_id: orderDetails.payer?.payer_id,
              paypal_payer_email: orderDetails.payer?.email_address
            }
          }
        });
      } else {
        toast.error('Deposit Failed', {
          description: data?.message || 'Something went wrong with your deposit'
        });
      }
    } catch (error) {
      console.error('Deposit processing error:', error);
      toast.error('Deposit Failed', {
        description: error instanceof Error ? error.message : 'An error occurred while processing your deposit'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualDeposit = async () => {
    try {
      const amount = parseFloat(directAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Invalid Amount', {
          description: 'Please enter a valid amount'
        });
        return;
      }

      setIsSubmitting(true);

      const { data, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user?.id,
          amount: amount,
          status: 'pending',
          payment_method: 'Manual Transfer',
          metadata: {
            request_time: new Date().toISOString(),
            requester_ip: 'client_request'
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Deposit Request Submitted', {
        description: `Your request to deposit $${amount} has been submitted for manual approval.`
      });
      
      navigate('/deposit/success', { 
        state: { 
          deposit: data
        }
      });
    } catch (error) {
      toast.error('Request Failed', {
        description: error instanceof Error ? error.message : 'An error occurred while submitting your deposit request'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetAmounts = [10, 20, 50, 100];

  return (
    <PayPalScriptProvider options={PAYPAL_OPTIONS}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {presetAmounts.map(amount => (
            <div key={amount} className="relative rounded-md border shadow-sm p-4 text-center">
              <div className="font-semibold mb-2">${amount}</div>
              <PayPalErrorBoundary amount={amount} onSuccess={handlePayPalSuccess}>
                <PayPalButtonWrapper amount={amount} onSuccess={handlePayPalSuccess} />
              </PayPalErrorBoundary>
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
              step="0.01"
              className="mb-2"
            />
            <div className="h-[50px]">
              {customAmount && parseFloat(customAmount) > 0 && (
                <PayPalErrorBoundary 
                  amount={parseFloat(customAmount)} 
                  onSuccess={handlePayPalSuccess}
                >
                  <PayPalButtonWrapper 
                    amount={parseFloat(customAmount)} 
                    onSuccess={handlePayPalSuccess} 
                  />
                </PayPalErrorBoundary>
              )}
            </div>
          </div>
        </div>

        {showManualOption && (
          <div className="border-t pt-4">
            <div className="flex flex-col space-y-2">
              <Input 
                type="number" 
                placeholder="Enter amount for manual deposit" 
                value={directAmount}
                onChange={(e) => setDirectAmount(e.target.value)}
                min="1"
                step="0.01"
              />
              <Button 
                onClick={handleManualDeposit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Request Manual Deposit"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalDeposit;
