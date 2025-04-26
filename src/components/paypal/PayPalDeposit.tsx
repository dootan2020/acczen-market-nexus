import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard } from "lucide-react";
import { PAYPAL_OPTIONS } from './paypal-config';
import { PayPalButtonWrapper } from './PayPalButtonWrapper';
import { PayPalErrorBoundary } from './PayPalErrorBoundary';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PayPalDeposit = () => {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();

  const presetAmounts = [10, 20, 50, 100];
  const FEE_PERCENTAGE = 0.044; // 4.4%
  const FEE_FIXED = 0.30; // $0.30 USD

  const calculateTotal = (amount: number) => {
    if (amount <= 0) return 0;
    const fee = (amount * FEE_PERCENTAGE) + FEE_FIXED;
    return Number((amount + fee).toFixed(2));
  };

  useEffect(() => {
    const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
    setTotalAmount(calculateTotal(amount));
  }, [selectedAmount, customAmount]);

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handlePresetAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handlePaymentSuccess = async (orderDetails: any, amount: number): Promise<void> => {
    try {
      const { data, error } = await supabase.functions.invoke('process-paypal-deposit', {
        body: {
          orderID: orderDetails.id,
          amount: amount,
          userID: supabase.auth.getUser().then(res => res.data.user?.id),
          idempotencyKey: orderDetails.id,
        },
      });

      if (error) {
        console.error('Error processing deposit:', error);
        toast.error('Payment Processing Error', { 
          description: 'There was a problem processing your deposit. Please contact support.' 
        });
        return;
      }

      toast.success('Deposit Successful', { 
        description: `$${amount.toFixed(2)} has been added to your account.` 
      });

      navigate('/deposit/success', { 
        state: { 
          deposit: {
            id: data.depositId,
            amount: amount,
            payment_method: 'PayPal',
            status: 'completed',
            updated_at: new Date().toISOString()
          } 
        } 
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Payment Processing Error', { 
        description: 'There was an unexpected error. Please try again later.' 
      });
    }
  };

  const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  return (
    <PayPalScriptProvider options={PAYPAL_OPTIONS}>
      <div className="space-y-6">
        <Card className="border-border/40 shadow-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <img 
                src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_200x51.png" 
                alt="PayPal"
                className="h-8 mb-2"
              />
            </div>
            <CardTitle className="text-2xl font-semibold">
              Nạp tiền qua PayPal
            </CardTitle>
            <CardDescription>
              Nạp tiền an toàn và nhanh chóng qua PayPal
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">
                  Số tiền muốn nạp (USD)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Nhập số tiền..."
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presetAmounts.map((presetAmount) => (
                  <Button
                    key={presetAmount}
                    variant={selectedAmount === presetAmount ? "default" : "outline"}
                    onClick={() => handlePresetAmount(presetAmount)}
                    className="w-full h-12 text-lg font-medium"
                  >
                    ${presetAmount}
                  </Button>
                ))}
              </div>

              <Card className="bg-muted/30 border-border/40">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Phí giao dịch:</span>
                      <span className="font-medium">{(FEE_PERCENTAGE * 100).toFixed(1)}% + ${FEE_FIXED.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="font-medium">Tổng thanh toán:</span>
                      <span className="text-lg font-bold text-primary">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {amount > 0 && (
              <div className="pt-2">
                <PayPalErrorBoundary amount={amount} onSuccess={handlePaymentSuccess}>
                  <PayPalButtonWrapper amount={amount} onSuccess={handlePaymentSuccess} />
                </PayPalErrorBoundary>
              </div>
            )}

            <div className="space-y-4 text-center">
              <Button
                variant="ghost" 
                className="text-primary hover:text-primary/90"
                onClick={() => navigate('/deposit')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Chọn phương thức khác
              </Button>
              
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Kết nối bảo mật SSL 256-bit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalDeposit;
