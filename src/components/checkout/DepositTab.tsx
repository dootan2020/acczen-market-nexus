
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PayPalDeposit from '@/components/PayPalDeposit';
import USDTDeposit from '@/components/USDTDeposit';

const DepositTab = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="paypal">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="paypal">
            PayPal
          </TabsTrigger>
          <TabsTrigger value="usdt">
            USDT (TRC20)
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="paypal">
          <PayPalDeposit />
        </TabsContent>
        
        <TabsContent value="usdt">
          <USDTDeposit />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepositTab;
