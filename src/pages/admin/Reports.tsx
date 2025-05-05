
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useReports } from '@/hooks/admin/reports/useReports';
import { ReportsContent } from '@/components/admin/reports/ReportsContent';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonStats, SkeletonChartLine } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { ReportsHeader } from '@/components/admin/reports/ReportsHeader';
import { Deposit } from '@/types/deposits';

const ReportsPage = () => {
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
  
  // Cast deposits to the correct type
  const typedDeposits = deposits as unknown as Deposit[];

  return (
    <AdminLayout>
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
    </AdminLayout>
  );
};

export default ReportsPage;
