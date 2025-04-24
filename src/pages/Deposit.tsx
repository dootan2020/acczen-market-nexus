
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DepositPage = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number | string>('');
  const [customAmount, setCustomAmount] = useState('');

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

      // Update user balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: (user.balance || 0) + depositAmount })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Deposit Successful',
        description: `Deposited $${amount} to your account`
      });
      setAmount('');
    },
    onError: (error) => {
      toast({
        title: 'Deposit Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  const handlePresetDeposit = (presetAmount: number) => {
    setAmount(presetAmount);
    handleDeposit(presetAmount);
  };

  const handleCustomDeposit = () => {
    const customAmountValue = parseFloat(customAmount);
    if (!isNaN(customAmountValue) && customAmountValue > 0) {
      setAmount(customAmountValue);
      handleDeposit(customAmountValue);
    } else {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid deposit amount',
        variant: 'destructive'
      });
    }
  };

  const handleDeposit = (depositAmount: number) => {
    depositMutation.mutate(depositAmount);
  };

  const presetAmounts = [10, 20, 50, 100];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Deposit Funds</h1>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Deposit Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {presetAmounts.map(amount => (
                  <Button 
                    key={amount} 
                    variant="outline"
                    onClick={() => handlePresetDeposit(amount)}
                    disabled={depositMutation.isPending}
                  >
                    ${amount}
                  </Button>
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
                <Button 
                  onClick={handleCustomDeposit}
                  disabled={depositMutation.isPending}
                >
                  Deposit
                </Button>
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
    </div>
  );
};

export default DepositPage;
