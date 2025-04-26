
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
import { USDTTransactionForm } from './usdt/USDTTransactionForm';

const USDTDeposit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [txid, setTxid] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0);
  
  const walletAddress = "TPmnvx4m1AgrNUvj5dCrAkL5aNbN61FGAs";

  const depositMutation = useMutation({
    mutationFn: async (txid: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          payment_method: 'USDT',
          transaction_hash: txid,
          status: 'pending'
        })
        .select()
        .single();

      if (depositError) throw depositError;

      setIsVerifying(true);
      
      try {
        const verifyResponse = await supabase.functions.invoke('verify-usdt-transaction', {
          body: JSON.stringify({
            txid,
            expected_amount: parseFloat(amount),
            user_id: user.id,
            deposit_id: depositData.id,
            wallet_address: walletAddress
          })
        });

        if (!verifyResponse.data.success) {
          throw new Error(verifyResponse.data.message || 'Transaction verification failed');
        }
        
        return verifyResponse.data;
      } catch (error) {
        throw error;
      } finally {
        setIsVerifying(false);
      }
    },
    onSuccess: (data) => {
      toast.success('USDT Deposit Successful', {
        description: `$${amount} USDT has been added to your balance`
      });
      setAmount('');
      setTxid('');
      navigate('/deposit/success', { 
        state: { 
          deposit: data.data.deposit,
          transaction: data.data.transaction
        } 
      });
    },
    onError: (error) => {
      toast.error('Deposit Verification Failed', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
      
      if (verificationAttempts < 2) {
        setVerificationAttempts(prev => prev + 1);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !txid) {
      toast.error('Missing Information', {
        description: 'Please fill in all fields'
      });
      return;
    }
    depositMutation.mutate(txid);
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <USDTTransactionForm
            amount={amount}
            txid={txid}
            onAmountChange={setAmount}
            onTxidChange={setTxid}
          />

          <USDTPresetAmounts
            selectedAmount={amount}
            onAmountSelect={setAmount}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={depositMutation.isPending || isVerifying}
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
              className="text-primary hover:text-primary/90 w-full"
              onClick={() => navigate('/deposit')}
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
      </CardContent>
    </Card>
  );
};

export default USDTDeposit;
