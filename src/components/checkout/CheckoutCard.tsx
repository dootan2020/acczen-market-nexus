
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard } from "lucide-react";
import BalancePaymentTab from './BalancePaymentTab';
import DepositTab from './DepositTab';

interface CheckoutCardProps {
  balanceUSD: number;
  totalUSD: number;
  hasEnoughBalance: boolean;
  isProcessing: boolean;
  onPurchase: () => void;
}

const CheckoutCard = ({ 
  balanceUSD, 
  totalUSD, 
  hasEnoughBalance, 
  isProcessing,
  onPurchase
}: CheckoutCardProps) => {
  const [activeTab, setActiveTab] = useState<string>('balance');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>Complete your purchase</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="balance">
              <Wallet className="mr-2 h-4 w-4" />
              Account Balance
            </TabsTrigger>
            <TabsTrigger value="deposit">
              <CreditCard className="mr-2 h-4 w-4" />
              Add Funds
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="balance">
            <BalancePaymentTab
              balanceUSD={balanceUSD}
              totalUSD={totalUSD}
              hasEnoughBalance={hasEnoughBalance}
              isProcessing={isProcessing}
              onPurchase={onPurchase}
            />
          </TabsContent>
          
          <TabsContent value="deposit">
            <DepositTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CheckoutCard;
