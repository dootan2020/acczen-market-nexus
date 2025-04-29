
import React from 'react';
import { useReportsData } from "@/hooks/useReportsData";
import { DashboardOverview } from '@/components/admin/dashboard/DashboardOverview';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BestSellingProducts } from "@/components/admin/reports/BestSellingProducts";
import { OrdersReport } from "@/components/admin/reports/OrdersReport";
import { DepositsReport } from "@/components/admin/reports/DepositsReport";

const AdminHome = () => {
  // Get report data from the hook
  const { 
    statsData, 
    paymentMethodData,
    depositsChartData,
    ordersChartData, 
    isLoading,
    dateRange
  } = useReportsData();

  console.log("AdminHome: Rendering with data", {
    hasStatsData: !!statsData,
    hasPaymentMethodData: !!paymentMethodData?.length,
    hasDepositsChartData: !!depositsChartData?.length,
    hasOrdersChartData: !!ordersChartData?.length,
    isLoading
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <DashboardOverview 
        statsData={statsData}
        revenueChartData={depositsChartData || []}
        ordersChartData={ordersChartData || []}
        paymentMethodData={paymentMethodData || []}
        isLoading={isLoading}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Best Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <BestSellingProducts dateRange={dateRange} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersReport 
              ordersChartData={ordersChartData || []} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <DepositsReport 
            depositsChartData={depositsChartData || []} 
            isLoading={isLoading} 
            depositsData={depositsChartData || []} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;
