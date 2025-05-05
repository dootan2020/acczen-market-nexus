
import React from 'react';
import { DashboardOverview } from '@/components/admin/dashboard/DashboardOverview';
import AdminLayout from '@/components/AdminLayout';
import { useDashboardStats } from '@/hooks/admin/useDashboardStats';
import { StatsData } from '@/types/reports';

const Dashboard = () => {
  const { data: statsData, isLoading } = useDashboardStats();

  // Create default empty data object that matches the expected structure
  const emptyData: StatsData = {
    totalUsers: 0,
    activeUsers: 0,
    conversionRate: 0,
    totalOrders: 0,
    totalDepositAmount: 0,
    totalDeposits: 0,
    averageOrderValue: 0,
    paypalDeposits: 0,
    usdtDeposits: 0,
    paypalAmount: 0,
    usdtAmount: 0
  };

  // Transform the payment method data to match ChartData structure if needed
  const transformedPaymentData = statsData?.paymentMethodData?.map(item => ({
    name: item.method,
    value: item.amount
  })) || [];

  return (
    <AdminLayout title="Dashboard">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <DashboardOverview
        statsData={statsData || emptyData}
        revenueChartData={statsData?.revenueChartData || []}
        ordersChartData={statsData?.orderChartData || []}
        paymentMethodData={transformedPaymentData}
        isLoading={isLoading}
      />
    </AdminLayout>
  );
};

export default Dashboard;
