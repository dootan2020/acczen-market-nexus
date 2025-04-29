
import React, { useEffect } from 'react';
import { useReportsData } from "@/hooks/useReportsData";
import { DashboardOverview } from '@/components/admin/dashboard/DashboardOverview';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BestSellingProducts } from "@/components/admin/reports/BestSellingProducts";
import { OrdersReport } from "@/components/admin/reports/OrdersReport";
import { DepositsReport } from "@/components/admin/reports/DepositsReport";
import { Loader2 } from 'lucide-react';

const AdminHome = () => {
  // Get report data from the hook with safe fallbacks
  const { 
    statsData, 
    paymentMethodData,
    depositsChartData,
    ordersChartData, 
    isLoading,
    dateRange
  } = useReportsData();

  // Debug logging 
  useEffect(() => {
    console.log("AdminHome: Initial render", {
      hasStatsData: !!statsData,
      hasPaymentMethodData: !!paymentMethodData?.length,
      hasDepositsChartData: !!depositsChartData?.length,
      hasOrdersChartData: !!ordersChartData?.length,
      isLoading,
      dateRange
    });
  }, []);

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
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Safe empty arrays for null or undefined data
  const safeDepositsData = depositsChartData || [];
  const safeOrdersData = ordersChartData || [];
  const safePaymentData = paymentMethodData || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <DashboardOverview 
        statsData={statsData}
        revenueChartData={safeDepositsData}
        ordersChartData={safeOrdersData}
        paymentMethodData={safePaymentData}
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
              ordersChartData={safeOrdersData} 
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
            depositsChartData={safeDepositsData} 
            isLoading={isLoading} 
            depositsData={safeDepositsData} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;
