
import React from 'react';
import { ReportsContent } from "@/components/admin/reports/ReportsContent";
import { useReportsData } from "@/hooks/useReportsData";
import { Loader2 } from 'lucide-react';

const AdminReports = () => {
  const {
    dateRange,
    dateRangeType,
    handleDateRangeChange,
    handleDateRangePickerChange,
    statsData,
    depositsChartData,
    ordersChartData,
    paymentMethodData,
    isLoading,
    refetch
  } = useReportsData();
  
  const [activeTab, setActiveTab] = React.useState('overview');
  
  console.log("AdminReports: Rendering with data", {
    hasStatsData: !!statsData,
    hasPaymentMethodData: !!paymentMethodData?.length,
    hasDepositsChartData: !!depositsChartData?.length,
    hasOrdersChartData: !!ordersChartData?.length,
    isLoading
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }
  
  // Ensure we have safe data to pass to components
  const safeDepositsData = depositsChartData || [];
  const safeOrdersData = ordersChartData || [];
  const safePaymentData = paymentMethodData || [];
  
  return (
    <div className="space-y-6">
      <ReportsContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statsData={statsData}
        paymentMethodData={safePaymentData}
        depositsChartData={safeDepositsData}
        ordersChartData={safeOrdersData}
        dateRange={dateRange}
        isLoading={isLoading}
        depositsData={safeDepositsData}
      />
    </div>
  );
};

export default AdminReports;
