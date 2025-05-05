
import { useMemo } from 'react';
import { format } from 'date-fns';
import { useReportsData } from '@/hooks/admin/useReportsData';
import { StatsData, DepositsChartData, OrdersChartData, ChartData, DateRangeType } from '@/types/reports';
import { DateRange } from 'react-day-picker';

export const useReports = () => {
  // Get base reports data which handles date range state and base data fetching
  const {
    dateRangeType,
    dateRange,
    handleDateRangeChange,
    handleDateRangePickerChange,
    statsData,
    depositsChartData,
    ordersChartData,
    paymentMethodData,
    deposits,
    isLoading,
    refetch,
    formattedDateRange
  } = useReportsData();

  // Format date range for display
  const formattedRange = useMemo(() => {
    if (!dateRange) return 'Custom Range';
    
    const fromDate = dateRange.from ? format(dateRange.from, 'MMM d, yyyy') : '';
    const toDate = dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : '';
    
    if (fromDate && toDate) {
      return `${fromDate} - ${toDate}`;
    }
    return formattedDateRange;
  }, [dateRange, formattedDateRange]);

  return {
    statsData,
    depositsChartData,
    ordersChartData,
    paymentMethodData,
    deposits,
    isLoading,
    dateRangeType,
    dateRange,
    handleDateRangeChange,
    handleDateRangePickerChange,
    refetch,
    formattedDateRange: formattedRange
  };
};
