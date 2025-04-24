
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import USDTDeposit from '@/components/USDTDeposit';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DepositPage = () => {
  const { user } = useAuth();
  const [customAmount, setCustomAmount] = useState('');

  // PayPal configuration
  const paypalConfig = {
    clientId: "your-paypal-client-id",
    currency: "USD",
    intent: "capture"
  };

  const presetAmounts = [10, 20, 50, 100];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Deposit Funds</h1>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Tabs defaultValue="paypal">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="usdt">USDT</TabsTrigger>
            </TabsList>
            
            <TabsContent value="paypal">
              <Card>
                <CardHeader>
                  <CardTitle>PayPal Deposit</CardTitle>
                </CardHeader>
                <CardContent>
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
                                    currency_code: "USD", // Added currency_code
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
                              intent: "CAPTURE",
                              purchase_units: [{
                                amount: {
                                  currency_code: "USD", // Added currency_code
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
                  </PayPalScriptProvider>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usdt">
              <USDTDeposit />
            </TabsContent>
          </Tabs>
        </div>
        
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
    </div>
  );
};

export default DepositPage;
