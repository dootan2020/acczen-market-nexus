
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import USDTDeposit from '@/components/USDTDeposit';
import PayPalDeposit from '@/components/PayPalDeposit';
import { Info, AlertTriangle, CreditCard, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { useCurrencyContext } from "@/contexts/CurrencyContext";

const DepositPage = () => {
  const { user, balance } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('paypal');
  const { formatUSD } = useCurrencyContext();

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  // Logged in validation
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to access deposit features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 px-4 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Add Funds to Your Account</h1>
        <p className="text-muted-foreground">
          Choose your preferred payment method below
        </p>
        
        <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full">
          <Progress value={0} className="h-2 bg-chatgpt-primary" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="w-full">
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
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="paypal" className="data-[state=active]:bg-chatgpt-primary data-[state=active]:text-white">
                <div className="flex items-center gap-2">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5962 8.82398C18.709 8.19698 18.5962 7.75598 18.3819 7.37698C18.0518 6.79198 17.3302 6.48398 16.4314 6.48398H13.9634C13.8506 6.48398 13.7378 6.58198 13.7378 6.69798L12.404 14.85C12.404 14.948 12.4718 15.046 12.5734 15.046H14.3035C14.4724 15.046 14.6301 14.92 14.6638 14.752L15.1068 12.2H16.3051C18.6641 12.2 19.9978 10.836 20.4072 8.82398H18.5962ZM16.6989 10.066H15.6791L16.073 8.10998C16.073 8.05198 16.1072 7.99398 16.1747 7.99398H16.7571C17.2794 7.99398 17.5754 8.10998 17.6542 8.43598C17.7219 8.86198 17.2907 10.066 16.6989 10.066Z" fill="currentColor"></path>
                    <path d="M10.1832 11.2281C9.91607 12.8601 8.69588 13.9461 7.22888 13.9461C6.49536 13.9461 5.89355 13.7111 5.5073 13.2651C5.13918 12.8361 4.99817 12.2221 5.10731 11.5761C5.35631 9.95707 6.58564 8.84707 8.03352 8.84707C8.74791 8.84707 9.33147 9.08207 9.72772 9.52807C10.132 9.98307 10.2849 10.6091 10.1832 11.2281ZM8.37265 9.94807C8.16652 9.77407 7.87441 9.69807 7.50629 9.69807C6.6629 9.69807 5.96664 10.4051 5.83477 11.3801C5.77221 11.8611 5.86307 12.2451 6.06919 12.5101C6.26619 12.7581 6.5583 12.8691 6.94542 12.8691C7.7753 12.8691 8.47155 12.1621 8.60342 11.1871C8.67505 10.7051 8.58419 10.2111 8.37265 9.94807Z" fill="currentColor"></path>
                    <path d="M21.4626 6.69824H19.7212C19.6084 6.69824 19.4956 6.79624 19.4618 6.91224L18.1279 15.0642C18.1279 15.1622 18.1957 15.2602 18.2974 15.2602H19.1623C19.3201 15.2602 19.4329 15.1622 19.4329 15.0462L19.8758 12.4942C19.8758 12.3782 19.9886 12.2802 20.1353 12.2802H20.9439C23.303 12.2802 24.6367 10.9162 25.0461 8.90422C25.159 8.27722 25.0461 7.83622 24.8318 7.45724C24.484 6.87224 23.7702 6.69824 21.4626 6.69824ZM22.4598 9.18624C22.2455 10.4452 21.2818 10.4452 20.3659 10.4452H19.9547L20.3655 7.99624C20.3655 7.93824 20.3993 7.88025 20.4672 7.88025H20.6475C21.2524 7.88025 21.8237 7.88025 22.1088 8.20625C22.3005 8.41225 22.3515 8.73825 22.2598 9.18624H22.4598Z" fill="currentColor"></path>
                    <path d="M11.387 13.9461C10.6534 13.9461 10.0516 13.7111 9.66535 13.2651C9.29722 12.8361 9.15621 12.2221 9.26534 11.5761C9.51434 9.95707 10.7437 8.84707 12.1916 8.84707C12.906 8.84707 13.4895 9.08207 13.8858 9.52807C14.2901 9.98307 14.443 10.6091 14.3413 11.2281C14.0742 12.8601 12.854 13.9461 11.387 13.9461ZM12.5307 9.94807C12.3246 9.77407 12.0325 9.69807 11.6644 9.69807C10.821 9.69807 10.1247 10.4051 9.99286 11.3801C9.9303 11.8611 10.0212 12.2451 10.2273 12.5101C10.4243 12.7581 10.7163 12.8691 11.1035 12.8691C11.9334 12.8691 12.6296 12.1621 12.7615 11.1871C12.8331 10.7051 12.7423 10.2111 12.5307 9.94807Z" fill="currentColor"></path>
                    <path d="M6.01519 6.69824H4.27373C4.16099 6.69824 4.04824 6.79624 4.0144 6.91224L2.68054 15.0642C2.68054 15.1622 2.74825 15.2602 2.84987 15.2602H3.66284C3.77559 15.2602 3.88833 15.1622 3.92217 15.0462L4.3842 12.3952C4.3842 12.2792 4.49695 12.1812 4.64354 12.1812H5.4565C7.81562 12.1812 9.14947 10.8172 9.55887 8.80522C9.67162 8.17822 9.55887 7.73722 9.34455 7.35824C9.01445 6.87224 8.32278 6.69824 6.01519 6.69824ZM7.01246 9.18624C6.79813 10.4452 5.83441 10.4452 4.91857 10.4452H4.4999L4.91557 7.99624C4.91557 7.93824 4.94984 7.88025 5.01755 7.88025H5.19804C5.80297 7.88025 6.37419 7.88025 6.65931 8.20625C6.85109 8.41225 6.90026 8.73825 6.81246 9.18624H7.01246Z" fill="currentColor"></path>
                  </svg>
                  PayPal
                </div>
              </TabsTrigger>
              <TabsTrigger value="usdt" className="data-[state=active]:bg-chatgpt-primary data-[state=active]:text-white">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  USDT
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="paypal" className="mt-0">
              <PayPalDeposit />
            </TabsContent>
            
            <TabsContent value="usdt" className="mt-0">
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
            <div className="text-4xl font-bold text-chatgpt-primary">
              {formatUSD(balance ?? 0)}
            </div>
            <p className="text-muted-foreground mt-2">
              Total available balance in your account
            </p>

            <div className="mt-6 space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Processing Times</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>PayPal</span>
                    <span className="text-green-600 font-medium">Instant</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>USDT (TRC20)</span>
                    <span className="font-medium">~30 minutes</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <h3 className="font-medium mb-1">Need help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you're having trouble with deposits, please contact our support team via the Help page.
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
