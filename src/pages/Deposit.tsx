
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const DepositPage = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number | string>('');
  const [customAmount, setCustomAmount] = useState('');

  // PayPal configuration
  const paypalConfig = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture"
  };

  const depositMutation = useMutation({
    mutationFn: async (depositAmount: number) => {
      if (!user) throw new Error('User not authenticated');

      // Create a deposit record
      const { data, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: depositAmount,
          payment_method: 'PayPal Sandbox',
          status: 'pending'
        })
        .select();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Deposit Initiated',
        description: `Deposit of $${amount} is being processed`
      });
    },
    onError: (error) => {
      toast({
        title: 'Deposit Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  const handlePayPalDeposit = (selectedAmount: number) => {
    setAmount(selectedAmount);
  };

  const presetAmounts = [10, 20, 50, 100];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Deposit Funds</h1>
      
      <PayPalScriptProvider options={paypalConfig}>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {presetAmounts.map(amount => (
                    <PayPalButtons 
                      key={amount}
                      style={{ layout: 'vertical', color: 'blue', shape: 'rect' }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            amount: {
                              value: amount.toString()
                            }
                          }]
                        });
                      }}
                      onApprove={async (data, actions) => {
                        const orderDetails = await actions.order.capture();
                        
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
                        } else {
                          toast({
                            title: 'Deposit Failed',
                            description: response.data?.message || 'Something went wrong',
                            variant: 'destructive'
                          });
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
                        purchase_units: [{
                          amount: {
                            value: amount.toString()
                          }
                        }]
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const orderDetails = await actions.order.capture();
                      const amount = parseFloat(customAmount);
                      
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
                        setCustomAmount('');
                      } else {
                        toast({
                          title: 'Deposit Failed',
                          description: response.data?.message || 'Something went wrong',
                          variant: 'destructive'
                        });
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                ${user?.balance ?? 0}
              </div>
              <p className="text-muted-foreground">
                Total available balance in your account
              </p>
            </CardContent>
          </Card>
        </div>
      </PayPalScriptProvider>
    </div>
  );
};

export default DepositPage;
