import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { QRCode } from 'qrcode.react';

interface USDTDepositProps {
  onSubmit?: () => void;
}

const USDTDeposit = ({ onSubmit }: USDTDepositProps) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [txid, setTxid] = useState<string>('');
  
  // This would come from your admin configuration
  const walletAddress = "TRC20WalletAddressHere"; // Replace with actual wallet address

  const depositMutation = useMutation({
    mutationFn: async (txid: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          payment_method: 'USDT',
          transaction_hash: txid,
          status: 'pending'
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Deposit Initiated',
        description: 'Your USDT deposit is being verified'
      });
      onSubmit?.();
      setAmount('');
      setTxid('');
    },
    onError: (error) => {
      toast({
        title: 'Deposit Failed',
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Deposit USDT (TRC20)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Send USDT to this address:</p>
            <div className="bg-muted p-4 rounded-lg break-all">
              {walletAddress}
            </div>
            <div className="mt-4 flex justify-center">
              <QRCode value={walletAddress} size={128} />
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
              disabled={depositMutation.isPending}
            >
              {depositMutation.isPending ? 'Submitting...' : 'Submit Deposit'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default USDTDeposit;
