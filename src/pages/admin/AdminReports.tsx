
import React from 'react';
import { ReportsContent } from "@/components/admin/reports/ReportsContent";
import { useReportsData } from "@/hooks/useReportsData";

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
  
  return (
    <div className="space-y-6">
      <ReportsContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statsData={statsData}
        paymentMethodData={paymentMethodData}
        depositsChartData={depositsChartData}
        ordersChartData={ordersChartData}
        dateRange={dateRange}
        isLoading={isLoading}
        depositsData={depositsChartData}
      />
    </div>
  );
};

export default AdminReports;
