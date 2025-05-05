
import React, { Suspense } from 'react';
import { ReportsContent } from "@/components/admin/reports/ReportsContent";
import { useReports } from "@/hooks/admin/reports/useReports";
import { ReportsHeader } from '@/components/admin/reports/ReportsHeader';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonStats, SkeletonChartLine } from '@/components/ui/skeleton';
import { Deposit } from '@/types/deposits';

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
  
  // Use a type guard to ensure deposits match the Deposit[] type
  const typedDeposits = deposits?.map(deposit => ({
    ...deposit,
    // Ensure metadata is in the correct format
    metadata: typeof deposit.metadata === 'undefined' ? null : deposit.metadata
  })) as Deposit[];
  
  return (
    <div className="space-y-6 max-w-full overflow-hidden">
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
        <div className="space-y-6">
          <SkeletonStats />
          <Card>
            <CardContent className="py-6">
              <SkeletonChartLine />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Suspense fallback={
          <div className="space-y-6">
            <SkeletonStats />
            <Card>
              <CardContent className="py-6">
                <SkeletonChartLine />
              </CardContent>
            </Card>
          </div>
        }>
          <ReportsContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            statsData={statsData}
            paymentMethodData={paymentMethodData}
            depositsChartData={depositsChartData || []}
            ordersChartData={ordersChartData || []}
            dateRange={dateRange}
            isLoading={isLoading}
            depositsData={typedDeposits || []}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AdminReports;
