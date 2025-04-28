
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportOverview from "@/components/admin/reports/ReportOverview";
import BestSellingProducts from "@/components/admin/reports/BestSellingProducts";
import OrdersReport from "@/components/admin/reports/OrdersReport";
import DepositsReport from "@/components/admin/reports/DepositsReport";

const AdminHome = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <div className="grid gap-6">
        <ReportOverview />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Best Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <BestSellingProducts />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersReport />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <DepositsReport />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;
