
import React, { useMemo } from 'react';
import { TimeRangeSelector } from './TimeRangeSelector';
import { Card, CardContent } from "@/components/ui/card";
import { StatsData, DepositsChartData } from '@/types/reports';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportFilters } from './ReportFilters';
import { DateRange } from 'react-day-picker';
import { DateRangeType } from '@/hooks/admin/useReportsData';
import { formatCurrency } from '@/utils/formatters';
import { Loader } from 'lucide-react';

interface ReportsHeaderProps {
  dateRangeType: string;
  onDateRangeChange: (value: DateRangeType) => void;
  dateRange: DateRange | undefined;
  onDateRangePickerChange: (range: DateRange | undefined) => void;
  onRefresh: () => void;
  isLoading: boolean;
  formattedDateRange: string;
  statsData: StatsData;
  depositsChartData: DepositsChartData[] | undefined;
}

export const ReportsHeader = React.memo(({
  dateRangeType,
  onDateRangeChange,
  dateRange,
  onDateRangePickerChange,
  onRefresh,
  isLoading,
  formattedDateRange,
  statsData,
  depositsChartData
}: ReportsHeaderProps) => {
  // Memoize calculated values to avoid recomputation on re-renders
  const totalRevenue = useMemo(() => {
    return isLoading ? 0 : statsData?.totalDepositAmount || 0;
  }, [isLoading, statsData]);
  
  const ordersCount = useMemo(() => {
    return isLoading ? 0 : statsData?.totalOrders || 0;
  }, [isLoading, statsData]);
  
  const avgOrderValue = useMemo(() => {
    return isLoading ? 0 : statsData?.averageOrderValue || 0;
  }, [isLoading, statsData]);
  
  // Format currency amounts using memoization
  const formattedRevenue = useMemo(() => formatCurrency(totalRevenue), [totalRevenue]);
  const formattedAvgOrder = useMemo(() => formatCurrency(avgOrderValue), [avgOrderValue]);
  
  // Determine if the data is trending up or down
  const isRevenueUp = useMemo(() => {
    if (!depositsChartData || depositsChartData.length < 2) return true;
    const lastIndex = depositsChartData.length - 1;
    return depositsChartData[lastIndex].amount >= depositsChartData[lastIndex - 1].amount;
  }, [depositsChartData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your business performance and metrics
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <TimeRangeSelector
            dateRangeType={dateRangeType}
            formattedDateRange={formattedDateRange}
            onDateRangeChange={onDateRangeChange}
            dateRange={dateRange}
            onDateRangePickerChange={onDateRangePickerChange}
          />
          
          <ReportFilters
            dateRangeType={dateRangeType}
            onDateRangeChange={onDateRangeChange}
            dateRange={dateRange}
            onDateRangePickerChange={onDateRangePickerChange}
            onRefresh={onRefresh}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <div className="mt-1 space-y-1">
                  <h2 className="text-3xl font-bold">{formattedRevenue}</h2>
                  <p className={`text-xs flex items-center ${isRevenueUp ? 'text-green-500' : 'text-red-500'}`}>
                    <span className={`mr-1 ${isRevenueUp ? 'rotate-0' : 'rotate-180'}`}>↑</span>
                    {isRevenueUp ? 'Up from' : 'Down from'} previous period
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Orders Card */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <div className="mt-1 space-y-1">
                  <h2 className="text-3xl font-bold">{ordersCount}</h2>
                  <p className="text-xs text-muted-foreground">Completed transactions</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Average Order Value Card */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                <div className="mt-1 space-y-1">
                  <h2 className="text-3xl font-bold">{formattedAvgOrder}</h2>
                  <p className="text-xs text-muted-foreground">Per transaction</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

ReportsHeader.displayName = 'ReportsHeader';
