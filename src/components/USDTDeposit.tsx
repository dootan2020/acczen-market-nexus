
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Wallet, Lock, CreditCard, Copy, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const USDTDeposit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [txid, setTxid] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0);
  
  // Wallet address from your configuration
  const walletAddress = "TPmnvx4m1AgrNUvj5dCrAkL5aNbN61FGAs";

  const depositMutation = useMutation({
    mutationFn: async (txid: string) => {
      if (!user) throw new Error('User not authenticated');

      // Create pending deposit record
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Address Copied', {
        description: 'Wallet address copied to clipboard'
      });
    } catch (err) {
      toast.error('Copy Failed', {
        description: 'Could not copy address to clipboard'
      });
    }
  };

  const presetAmounts = [10, 20, 50, 100];

  return (
    <Card className="w-full max-w-xl mx-auto border-border/40 shadow-md">
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
          <Clock className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">Lưu ý quan trọng</AlertTitle>
          <AlertDescription className="text-amber-600">
            Chỉ gửi USDT qua mạng TRC20. Các mạng khác không được hỗ trợ và có thể dẫn đến mất tiền.
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <p className="text-sm font-medium mb-2">Địa chỉ ví USDT (TRC20):</p>
          <div className="relative">
            <div className="bg-muted p-4 rounded-lg break-all font-mono text-sm">
              {walletAddress}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => copyToClipboard(walletAddress)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 mb-4 flex justify-center">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-border/40">
              <QRCodeSVG value={walletAddress} size={180} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Số tiền muốn nạp (USDT)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số USDT..."
              min="1"
              step="0.01"
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setAmount(preset.toString())}
              >
                ${preset}
              </Button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mã giao dịch (TXID)
            </label>
            <Input
              type="text"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              placeholder="Nhập mã giao dịch..."
              className="font-mono text-sm bg-white"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sau khi chuyển USDT, nhập mã giao dịch (TXID) từ ví hoặc sàn giao dịch của bạn
            </p>
          </div>

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

          <div className="flex flex-col items-center space-y-4 text-center">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/90"
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
