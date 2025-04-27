
import React, { useState } from 'react';
import { useReportsData } from "@/hooks/useReportsData";
import { ReportsHeader } from "@/components/admin/reports/ReportsHeader";
import { ReportsContent } from "@/components/admin/reports/ReportsContent";

const AdminReports = () => {
  const {
    dateRange,
    dateRangeType,
    handleDateRangeChange,
    handleDateRangePickerChange,
    formattedDateRange,
    statsData,
    depositsChartData,
    ordersChartData,
    paymentMethodData,
    isLoading,
    refetch
  } = useReportsData();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="container mx-auto p-4">
      <ReportsHeader 
        dateRangeType={dateRangeType}
        onDateRangeChange={handleDateRangeChange}
        dateRange={dateRange}
        onDateRangePickerChange={handleDateRangePickerChange}
        onRefresh={refetch}
        isLoading={isLoading}
        formattedDateRange={formattedDateRange}
        statsData={statsData}
        depositsChartData={depositsChartData}
      />
      
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
