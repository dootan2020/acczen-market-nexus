
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, DollarSign, Package, Users, ShoppingBag, AlertCircle } from 'lucide-react';

const AdminHome = () => {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu hôm nay
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 VND</div>
            <p className="text-xs text-muted-foreground">
              +0% so với hôm qua
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đơn hàng
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              0 đơn hàng mới
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sản phẩm
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              0 sản phẩm hết hàng
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Người dùng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              0 người dùng mới
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê hệ thống</CardTitle>
              <CardDescription>
                Tổng quát về hoạt động của hệ thống Digital Deals Hub.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-4 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Chưa có dữ liệu thống kê.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích</CardTitle>
              <CardDescription>
                Phân tích chi tiết về hoạt động kinh doanh.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Chưa có dữ liệu phân tích.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo</CardTitle>
              <CardDescription>
                Báo cáo chi tiết về doanh thu và hoạt động.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Chưa có báo cáo nào.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminHome;
