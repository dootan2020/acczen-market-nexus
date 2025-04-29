
import React, { Suspense } from 'react';
import { ReportsContent } from "@/components/admin/reports/ReportsContent";
import { useReports } from "@/hooks/admin/reports/useReports";
import { Loader2 } from 'lucide-react';
import { ReportsHeader } from '@/components/admin/reports/ReportsHeader';
import { Card, CardContent } from '@/components/ui/card';

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
    deposits
  } = useReports();
  
  const [activeTab, setActiveTab] = React.useState('overview');
  
  console.log("AdminReports: Rendering with data", {
    hasStatsData: !!statsData,
    hasPaymentMethodData: !!paymentMethodData?.length,
    hasDepositsChartData: !!depositsChartData?.length,
    hasOrdersChartData: !!ordersChartData?.length,
    isLoading
  });
  
  return (
    <div className="space-y-6">
      {/* Reports Header with Date Range and Summary Stats */}
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
      
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Đang tải dữ liệu báo cáo...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <ReportsContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            statsData={statsData}
            paymentMethodData={paymentMethodData || []}
            depositsChartData={depositsChartData || []}
            ordersChartData={ordersChartData || []}
            dateRange={dateRange}
            isLoading={isLoading}
            depositsData={deposits || []}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AdminReports;
