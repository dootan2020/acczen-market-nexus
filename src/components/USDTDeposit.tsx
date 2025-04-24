
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from 'qrcode.react';
import { Loader, AlertCircle, CheckCircle, Copy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface USDTDepositProps {
  onSubmit?: () => void;
}

const USDTDeposit = ({ onSubmit }: USDTDepositProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [txid, setTxid] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  
  // This would come from your admin configuration
  const walletAddress = "TRC20WalletAddressHere"; // Replace with actual wallet address

  const depositMutation = useMutation({
    mutationFn: async (txid: string) => {
      if (!user) throw new Error('User not authenticated');

      // First, create a pending deposit record
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

      // Start verification process
      setIsVerifying(true);
      
      try {
        // Call the edge function to verify the transaction
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
      } finally {
        setIsVerifying(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Deposit Successful',
        description: 'Your USDT deposit has been verified and added to your balance',
        variant: 'default'
      });
      onSubmit?.();
      setAmount('');
      setTxid('');
      // Navigate to success page
      navigate('/deposit/success', { 
        state: { 
          deposit: data.data.deposit,
          transaction: data.data.transaction
        } 
      });
    },
    onError: (error) => {
      toast({
        title: 'Deposit Verification Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !txid) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }
    depositMutation.mutate(txid);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Failed to Copy',
        description: 'Could not copy address to clipboard',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Deposit USDT (TRC20)</CardTitle>
        <CardDescription>
          Send USDT on the Tron network (TRC20) to add funds to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Only send USDT using the TRC20 network. Other networks are not supported and may result in lost funds.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Send USDT to this address:</p>
            <div className="bg-muted p-4 rounded-lg break-all relative">
              {walletAddress}
              <Button
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={() => copyToClipboard(walletAddress)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex justify-center">
              <QRCodeSVG value={walletAddress} size={128} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="number"
                placeholder="Amount in USDT"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>
            
            <div>
              <Input
                type="text"
                placeholder="Transaction ID (TXID)"
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={depositMutation.isPending || isVerifying}
            >
              {depositMutation.isPending || isVerifying ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {isVerifying ? 'Verifying Transaction...' : 'Submitting...'}
                </>
              ) : (
                'Submit Deposit'
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default USDTDeposit;
