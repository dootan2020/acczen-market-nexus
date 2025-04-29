
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
    refetch,
    formattedDateRange,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    depositsData,
    ordersData,
    totalDeposits,
    totalOrders
  } = useReportsData();
  
  const [activeTab, setActiveTab] = React.useState('overview');
  
  // For products tab, we'll extract from Best Selling Products component
  const productsData = React.useMemo(() => {
    return [];  // This will be fetched directly in the BestSellingProducts component
  }, []);
  
  React.useEffect(() => {
    // Reset pagination when changing tabs
    setCurrentPage(1);
  }, [activeTab, setCurrentPage]);
  
  if (isLoading && !depositsData.length && !ordersData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }
  
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
        depositsData={depositsData}
        ordersData={ordersData}
        productsData={productsData}
        dateRangeType={dateRangeType}
        onDateRangeChange={handleDateRangeChange}
        onDateRangePickerChange={handleDateRangePickerChange}
        onRefresh={refetch}
        formattedDateRange={formattedDateRange}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalDeposits={totalDeposits}
        totalOrders={totalOrders}
      />
    </div>
  );
};

export default AdminReports;
