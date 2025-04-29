
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Wallet, Lock, CreditCard, Clock, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { USDTPresetAmounts } from './usdt/USDTPresetAmounts';
import { USDTWalletInfo } from './usdt/USDTWalletInfo';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePayment } from '@/contexts/PaymentContext';

export interface DepositResponse {
  success: boolean;
  message?: string;
  data?: {
    deposit: {
      id: string;
      amount: number;
      status: string;
    };
    transaction: {
      id: string;
      amount: number;
    };
  };
}

interface VerificationResult {
  success?: boolean;
  depositId?: string;
  error?: any;
  message?: string;
  data?: {
    deposit: {
      id: string;
      amount: number;
      status: string;
    };
    transaction: {
      id: string;
      amount: number;
    };
  };
}

// Define schema for USDT deposit form
const usdtDepositSchema = z.object({
  amount: z
    .string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, { message: "Số tiền phải lớn hơn 0" })
    .refine(val => {
      const num = parseFloat(val);
      return num <= 50000;
    }, { message: "Số tiền không được vượt quá $50,000" })
    .refine(val => {
      const num = parseFloat(val);
      return Number.isInteger(num * 100) / 100;
    }, { message: "Số tiền chỉ được có tối đa 2 chữ số thập phân" }),
  txid: z
    .string()
    .min(64, { message: "Transaction hash phải có đúng 64 ký tự" })
    .max(64, { message: "Transaction hash phải có đúng 64 ký tự" })
    .regex(/^[0-9a-fA-F]+$/, { message: "Transaction hash phải là chuỗi kí tự hex" })
    .trim()
});

type USDTDepositFormValues = z.infer<typeof usdtDepositSchema>;

const USDTDeposit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0);
  const [depositId, setDepositId] = useState<string>('');
  const { refreshDeposits } = usePayment();
  
  // Initialize form
  const form = useForm<USDTDepositFormValues>({
    resolver: zodResolver(usdtDepositSchema),
    defaultValues: {
      amount: '',
      txid: ''
    },
    mode: "onChange"
  });
  
  const walletAddress = "TPmnvx4m1AgrNUvj5dCrAkL5aNbN61FGAs";

  const depositMutation = useMutation({
    mutationFn: async (formData: USDTDepositFormValues): Promise<VerificationResult> => {
      if (!user) throw new Error('User not authenticated');

      // Validate data before proceeding
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      if (!formData.txid || formData.txid.length !== 64) {
        throw new Error('Invalid transaction hash');
      }

      // Create deposit record first
      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: amount,
          payment_method: 'USDT',
          transaction_hash: formData.txid,
          status: 'pending'
        })
        .select()
        .single();

      if (depositError) throw depositError;
      
      if (!depositData || !depositData.id) {
        throw new Error('Failed to create deposit record');
      }
      
      setDepositId(depositData.id);
      await refreshDeposits(); // Refresh deposits to show pending status
      
      setIsVerifying(true);
      
      try {
        const verifyResponse = await supabase.functions.invoke<DepositResponse>('verify-usdt-transaction', {
          body: {
            txid: formData.txid,
            expected_amount: amount,
            user_id: user.id,
            deposit_id: depositData.id,
            wallet_address: walletAddress
          }
        });

        if (verifyResponse.error) {
          return {
            success: false,
            depositId: depositData.id, 
            error: verifyResponse.error,
            message: verifyResponse.error.message || 'Transaction verification failed'
          };
        }

        if (!verifyResponse.data?.success) {
          return {
            success: false,
            depositId: depositData.id,
            message: verifyResponse.data?.message || 'Transaction verification failed'
          };
        }
        
        await refreshDeposits(); // Refresh deposits to get updated status
        return {
          success: true,
          data: verifyResponse.data.data,
          message: verifyResponse.data.message
        };
      } catch (error: any) {
        // We still return the deposit ID for tracking even if verification failed
        return { 
          success: false,
          depositId: depositData.id, 
          error: error,
          message: error.message || 'Transaction verification failed'
        };
      } finally {
        setIsVerifying(false);
      }
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success('USDT Deposit Successful', {
          description: `$${form.getValues("amount")} USDT has been added to your balance`
        });
        form.reset();
        navigate('/deposit/success', { 
          state: { 
            deposit: result.data.deposit,
            transaction: result.data.transaction
          } 
        });
      } else if (result.depositId) {
        // If we have a deposit ID but verification failed, show a message and redirect
        // to the transaction status page where they can track the status
        toast.info('Deposit is being verified', {
          description: 'Your transaction has been submitted and is being verified. This may take a few minutes.'
        });
        navigate('/deposit/pending', { state: { depositId: result.depositId } });
      }
    },
    onError: (error) => {
      toast.error('Deposit Submission Failed', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
      
      if (verificationAttempts < 2) {
        setVerificationAttempts(prev => prev + 1);
      }
    }
  });

  const handleSubmit = (formData: USDTDepositFormValues) => {
    depositMutation.mutate(formData);
  };

  const onPresetAmountSelect = (value: string) => {
    if (value && !isNaN(parseFloat(value))) {
      form.setValue("amount", value, { shouldValidate: true });
    }
  };

  return (
    <Card className="w-full border-border/40 shadow-md">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          Nạp USDT (TRC20)
        </CardTitle>
        <CardDescription>
          Nạp tiền nhanh chóng và an toàn qua USDT TRC20
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert className="bg-amber-50/50 border-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">Lưu ý quan trọng</AlertTitle>
          <AlertDescription className="text-amber-600">
            Chỉ gửi USDT qua mạng TRC20. Các mạng khác không được hỗ trợ và có thể dẫn đến mất tiền.
          </AlertDescription>
        </Alert>

        <USDTWalletInfo walletAddress={walletAddress} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Wallet className="h-4 w-4 mr-1.5" /> Amount (USDT)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                            field.onChange(value);
                          }
                        }}
                        disabled={depositMutation.isPending || isVerifying}
                        className={form.formState.errors.amount ? "border-red-500 focus-visible:ring-red-500" : ""}
                        aria-invalid={!!form.formState.errors.amount}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <USDTPresetAmounts
                selectedAmount={form.getValues("amount")}
                onAmountSelect={onPresetAmountSelect}
                disabled={depositMutation.isPending || isVerifying}
              />

              <FormField
                control={form.control}
                name="txid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1.5" /> Transaction Hash
                      </div>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="p-0 h-auto text-xs text-muted-foreground"
                        onClick={() => {
                          window.open('https://tronscan.org/#/', '_blank');
                        }}
                      >
                        Where to find?
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your TRC20 transaction hash here..."
                        className={`font-mono resize-none ${form.formState.errors.txid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^[0-9a-fA-F]*$/.test(value)) {
                            field.onChange(value.trim());
                          }
                        }}
                        disabled={depositMutation.isPending || isVerifying}
                        aria-invalid={!!form.formState.errors.txid}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Paste the TRC20 transaction hash from your wallet after sending USDT.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {depositId && depositMutation.isSuccess && (
              <Alert className="bg-blue-50/50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Transaction Submitted</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Your transaction is currently being processed. You can check its status on the transactions page.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={depositMutation.isPending || isVerifying || !form.formState.isValid || Object.keys(form.formState.errors).length > 0}
            >
              {depositMutation.isPending || isVerifying ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  {isVerifying ? 'Đang xác minh...' : 'Đang xử lý...'}
                </>
              ) : (
                'Xác nhận nạp tiền'
              )}
            </Button>

            <div className="flex flex-col items-center space-y-4 pt-2 text-center">
              <Button
                variant="ghost"
                type="button"
                className="text-primary hover:text-primary/90 w-full"
                onClick={() => navigate('/deposit')}
                disabled={depositMutation.isPending || isVerifying}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Chọn phương thức khác
              </Button>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Kết nối bảo mật SSL 256-bit</span>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default USDTDeposit;
