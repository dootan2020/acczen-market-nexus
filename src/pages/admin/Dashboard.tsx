
import React from 'react';
import { DashboardOverview } from '@/components/admin/dashboard/DashboardOverview';
import AdminLayout from '@/components/AdminLayout';
import { useDashboardStats } from '@/hooks/admin/useDashboardStats';

const Dashboard = () => {
  const { data: statsData, isLoading } = useDashboardStats();

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <DashboardOverview
        statsData={statsData || {
          totalUsers: 0,
          activeUsers: 0,
          conversionRate: 0,
          totalOrders: 0,
          totalDepositAmount: 0,
          totalDeposits: 0,
          averageOrderValue: 0,
          orderCountByDay: [],
          depositAmountByDay: [],
          revenueByDay: [],
          paymentMethodData: [],
          revenueChartData: [],
          orderChartData: [],
          productCategoryData: []
        }}
        revenueChartData={statsData?.revenueChartData || []}
        ordersChartData={statsData?.orderChartData || []}
        paymentMethodData={statsData?.paymentMethodData || []}
        isLoading={isLoading}
      />
    </AdminLayout>
  );
};

export default Dashboard;
