
import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard, Wallet, InfoIcon, Loader2 } from "lucide-react";
import { PAYPAL_OPTIONS } from './paypal-config';
import { PayPalButtonWrapper } from './PayPalButtonWrapper';
import { PayPalErrorBoundary } from './PayPalErrorBoundary';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { USDTPresetAmounts } from '../usdt/USDTPresetAmounts';
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define the validation schema
const depositSchema = z.object({
  amount: z
    .string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, { message: "Số tiền phải lớn hơn 0" })
    .refine(val => {
      const num = parseFloat(val);
      return num <= 10000;
    }, { message: "Số tiền không được vượt quá $10,000" })
});

type DepositFormValues = z.infer<typeof depositSchema>;

const PayPalDeposit = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const FEE_PERCENTAGE = 0.044; // 4.4%
  const FEE_FIXED = 0.30; // $0.30 USD

  // Initialize form
  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: '',
    },
    mode: "onChange"
  });
  
  const watchAmount = form.watch("amount");

  const calculateTotal = (amount: number) => {
    if (amount <= 0) return 0;
    const fee = (amount * FEE_PERCENTAGE) + FEE_FIXED;
    return Number((amount + fee).toFixed(2));
  };

  useEffect(() => {
    const amount = selectedAmount || (watchAmount ? parseFloat(watchAmount) : 0);
    setTotalAmount(calculateTotal(amount));
  }, [selectedAmount, watchAmount]);

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      form.setValue("amount", value, { shouldValidate: true });
      setSelectedAmount(null);
    }
  };

  const handlePaymentSuccess = async (orderDetails: any, amount: number): Promise<void> => {
    try {
      setIsProcessing(true);
      toast.info('Processing your deposit...', {
        duration: 5000,
      });
      
      const { data, error } = await supabase.functions.invoke('process-paypal-deposit', {
        body: {
          orderID: orderDetails.id,
          amount: amount,
          userID: (await supabase.auth.getUser()).data.user?.id,
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

      // Refresh user data to update balance
      await refreshUser();

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
    } finally {
      setIsProcessing(false);
    }
  };

  const onPresetAmountSelect = (value: string) => {
    setSelectedAmount(parseFloat(value));
    form.setValue("amount", value, { shouldValidate: true });
  };

  const amount = selectedAmount || (watchAmount ? parseFloat(watchAmount) : 0);
  const formIsValid = form.formState.isValid;

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

          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="amount" className="font-medium">
                      Số tiền muốn nạp (USD)
                    </Label>
                    <FormControl>
                      <Input
                        id="amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="Nhập số tiền..."
                        value={field.value}
                        onChange={handleCustomAmountChange}
                        className="bg-white mt-1.5"
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <USDTPresetAmounts
                selectedAmount={form.getValues("amount")}
                onAmountSelect={onPresetAmountSelect}
                disabled={isProcessing}
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
            </form>
          </Form>

          {isProcessing ? (
            <div className="py-4 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Đang xử lý thanh toán...</span>
            </div>
          ) : amount > 0 && formIsValid ? (
            <div className="pt-2">
              <PayPalErrorBoundary amount={amount} onSuccess={handlePaymentSuccess}>
                <PayPalButtonWrapper amount={amount} onSuccess={handlePaymentSuccess} />
              </PayPalErrorBoundary>
            </div>
          ) : null}

          <div className="flex flex-col items-center space-y-4 pt-2 text-center">
            <Button
              variant="ghost" 
              className="text-primary hover:text-primary/90 w-full"
              onClick={() => navigate('/deposit')}
              disabled={isProcessing}
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
