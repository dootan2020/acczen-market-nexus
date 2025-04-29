
import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard, Wallet, InfoIcon } from "lucide-react";
import { PAYPAL_OPTIONS } from './paypal-config';
import { PayPalButtonWrapper } from './PayPalButtonWrapper';
import { PayPalErrorBoundary } from './PayPalErrorBoundary';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { USDTPresetAmounts } from '../usdt/USDTPresetAmounts';

const PayPalDeposit = () => {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();

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
        toast.error('Lỗi xử lý thanh toán', { 
          description: 'Đã xảy ra lỗi khi xử lý nạp tiền. Vui lòng liên hệ hỗ trợ.' 
        });
        return;
      }

      toast.success('Nạp tiền thành công', { 
        description: `$${amount.toFixed(2)} đã được thêm vào tài khoản của bạn.` 
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
      toast.error('Lỗi xử lý thanh toán', { 
        description: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.' 
      });
    }
  };

  const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  return (
    <PayPalScriptProvider options={PAYPAL_OPTIONS}>
      <Card className="w-full border-border/40 shadow-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Nạp tiền qua PayPal
          </CardTitle>
          <CardDescription>
            Nạp tiền an toàn và nhanh chóng qua PayPal
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="bg-amber-50/50 border-amber-200">
            <InfoIcon className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700">Thông tin quan trọng</AlertTitle>
            <AlertDescription className="text-amber-600">
              Phí giao dịch PayPal: {(FEE_PERCENTAGE * 100).toFixed(1)}% + ${FEE_FIXED.toFixed(2)} sẽ được tính vào tổng tiền thanh toán.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="font-medium">
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
                className="bg-white mt-1.5"
              />
            </div>

            <USDTPresetAmounts
              selectedAmount={customAmount ? customAmount : selectedAmount?.toString() || ''}
              onAmountSelect={(value) => {
                setSelectedAmount(parseFloat(value));
                setCustomAmount('');
              }}
            />

            <Card className="bg-muted/30 border-border/40">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phí giao dịch:</span>
                    <span className="font-medium">{(FEE_PERCENTAGE * 100).toFixed(1)}% + ${FEE_FIXED.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <span className="font-medium">Tổng thanh toán:</span>
                    <span className="text-lg font-bold text-green-600">
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

          <div className="flex flex-col items-center space-y-4 pt-2 text-center">
            <Button
              variant="ghost" 
              className="text-primary hover:text-primary/90 w-full"
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
    </PayPalScriptProvider>
  );
};

export default PayPalDeposit;
