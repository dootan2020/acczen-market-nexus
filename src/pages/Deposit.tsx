
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import USDTDeposit from '@/components/USDTDeposit';
import PayPalDeposit from '@/components/PayPalDeposit';
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DepositPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('paypal');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Deposit Funds</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Payment Information</AlertTitle>
            <AlertDescription>
              Deposits are typically processed instantly for PayPal and may take up to 30 minutes for cryptocurrency transactions.
            </AlertDescription>
          </Alert>
          
          <Tabs 
            defaultValue="paypal" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="usdt">USDT</TabsTrigger>
            </TabsList>
            
            <TabsContent value="paypal">
              <Card>
                <CardHeader>
                  <CardTitle>PayPal Deposit</CardTitle>
                  <CardDescription>
                    Instantly add funds to your account using PayPal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PayPalDeposit />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usdt">
              <USDTDeposit />
            </TabsContent>
          </Tabs>
        </div>
        
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>
              Your available funds for making purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ${user?.balance?.toFixed(2) ?? "0.00"}
            </div>
            <p className="text-muted-foreground mt-2">
              Total available balance in your account
            </p>

            <div className="mt-6 space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Recent Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  View your transaction history in the dashboard.
                </p>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <h3 className="font-medium mb-1">Need help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you're having trouble with deposits, please contact our support team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DepositPage;
