
import { useMemo } from 'react';
import { format } from 'date-fns';
import { useReportsData } from '@/hooks/admin/useReportsData';
import { useStatsData } from './useStatsData';
import { useDepositsData } from './useDepositsData';
import { useOrdersData } from './useOrdersData';
import { usePaymentMethodData } from './usePaymentMethodData';
import { StatsData, DepositsChartData, OrdersChartData, ChartData } from '@/types/reports';
import { DateRangeType } from '@/hooks/admin/useReportsData';

export const useReports = () => {
  // Get base reports data which handles date range state and base data fetching
  const {
    data,
    isLoading: isBaseLoading,
    dateRangeType,
    dateRange,
    handleDateRangeTypeChange,
    handleCustomDateRangeChange,
    refetch
  } = useReportsData();

  // Get specific data from specialized hooks with proper destructuring
  const { statsData, isLoading: isStatsLoading } = useStatsData(dateRange);
  const { deposits, depositsChartData, isLoading: isDepositsLoading } = useDepositsData(dateRange);
  const { ordersChartData, isLoading: isOrdersLoading } = useOrdersData(dateRange);
  const { paymentMethodData, isLoading: isPaymentMethodLoading } = usePaymentMethodData(dateRange);

  // Combine loading states
  const isLoading = isBaseLoading || isStatsLoading || isDepositsLoading || 
                   isOrdersLoading || isPaymentMethodLoading;

  // Format date range for display
  const formattedDateRange = useMemo(() => {
    if (!dateRange) return 'Custom Range';
    
    const fromDate = format(dateRange.from, 'MMM d, yyyy');
    const toDate = format(dateRange.to, 'MMM d, yyyy');
    
    return `${fromDate} - ${toDate}`;
  }, [dateRange]);

  // Handle date range changes - Fix type error by explicitly typing parameter
  const handleDateRangeChange = (type: DateRangeType) => {
    handleDateRangeTypeChange(type);
  };

  const handleDateRangePickerChange = (range: any) => {
    handleCustomDateRangeChange(range);
  };

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
    formattedDateRange
  };
};
