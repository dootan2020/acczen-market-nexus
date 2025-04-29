
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import USDTDeposit from '@/components/USDTDeposit';
import PayPalDeposit from '@/components/PayPalDeposit';
import { Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Layout from "@/components/Layout";

const DepositPage = () => {
  const { user, balance } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('paypal');

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  // Logged in validation
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <Alert variant="destructive" className="max-w-lg mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Vui lòng đăng nhập để sử dụng tính năng nạp tiền.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Nạp tiền</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="w-full">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Thông tin thanh toán</AlertTitle>
              <AlertDescription>
                Nạp tiền qua PayPal thường được xử lý ngay lập tức và nạp tiền qua tiền điện tử có thể mất tới 30 phút.
              </AlertDescription>
            </Alert>
            
            <Tabs 
              defaultValue="paypal" 
              value={activeTab} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
                <TabsTrigger value="usdt">USDT</TabsTrigger>
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
              <CardTitle>Số dư hiện tại</CardTitle>
              <CardDescription>
                Số tiền khả dụng để mua hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                ${balance?.toFixed(2) ?? "0.00"}
              </div>
              <p className="text-muted-foreground mt-2">
                Tổng số dư khả dụng trong tài khoản của bạn
              </p>

              <div className="mt-6 space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Giao dịch gần đây</h3>
                  <p className="text-sm text-muted-foreground">
                    Xem lịch sử giao dịch của bạn trong dashboard.
                  </p>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <h3 className="font-medium mb-1">Cần trợ giúp?</h3>
                  <p className="text-sm text-muted-foreground">
                    Nếu bạn gặp sự cố khi nạp tiền, vui lòng liên hệ đội hỗ trợ của chúng tôi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DepositPage;
