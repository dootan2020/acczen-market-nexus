
import { useMemo } from 'react';
import { format } from 'date-fns';
import { useReportsData, DateRangeType, DateRange } from '@/hooks/admin/useReportsData';
import { useStatsData } from './useStatsData';
import { useDepositsData } from './useDepositsData';
import { useOrdersData } from './useOrdersData';
import { StatsData, DepositsChartData, OrdersChartData, PaymentMethodData, ChartData } from '@/types/reports';

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

  // Get specific data from specialized hooks
  const statsData = useStatsData(dateRange);
  const isStatsLoading = false; // We'll consider this always loaded for now
  const { deposits, depositsChartData, isLoading: isDepositsLoading } = useDepositsData(dateRange);
  const { ordersChartData, isLoading: isOrdersLoading } = useOrdersData(dateRange);
  
  // Create payment method data directly from statsData
  const paymentMethodData: ChartData[] = [
    { name: 'PayPal', value: statsData?.paypalAmount || 0 },
    { name: 'USDT', value: statsData?.usdtAmount || 0 },
  ];
  const isPaymentMethodLoading = false;

  // Combine loading states
  const isLoading = isBaseLoading || isDepositsLoading || isOrdersLoading || isPaymentMethodLoading;

  // Format date range for display
  const formattedDateRange = useMemo(() => {
    if (!dateRange) return 'Custom Range';
    
    const fromDate = format(dateRange.from, 'MMM d, yyyy');
    const toDate = format(dateRange.to, 'MMM d, yyyy');
    
    return `${fromDate} - ${toDate}`;
  }, [dateRange]);

  // Handle date range changes
  const handleDateRangeChange = (type: DateRangeType) => {
    handleDateRangeTypeChange(type);
  };

  const handleDateRangePickerChange = (range: DateRange) => {
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
