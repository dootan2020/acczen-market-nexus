
import { useReportDateRange } from "./useReportDateRange";
import { useDepositsData } from "./useDepositsData";
import { useOrdersData } from "./useOrdersData";
import { useUsersData } from "./useUsersData";
import { useStatsData } from "./useStatsData";
import { usePaymentMethodData } from "./usePaymentMethodData";

export function useReports() {
  // Get date range
  const { 
    dateRange, 
    dateRangeType, 
    handleDateRangeChange, 
    handleDateRangePickerChange,
    formattedDateRange 
  } = useReportDateRange();
  
  // Fetch data based on date range
  const { 
    deposits,
    depositsChartData, 
    isLoading: isDepositsLoading, 
    refetch: refetchDeposits 
  } = useDepositsData(dateRange);
  
  const { 
    orders,
    ordersChartData, 
    isLoading: isOrdersLoading, 
    refetch: refetchOrders 
  } = useOrdersData(dateRange);
  
  const { 
    users, 
    isLoading: isUsersLoading, 
    refetch: refetchUsers 
  } = useUsersData();
  
  // Calculate stats
  const statsData = useStatsData(dateRange);
  
  // Generate payment method charts
  const paymentMethodData = usePaymentMethodData(statsData);
  
  // Combined loading state
  const isLoading = isDepositsLoading || isOrdersLoading || isUsersLoading;
  
  // Combined refetch function
  const refetch = () => {
    refetchDeposits();
    refetchOrders();
    refetchUsers();
  };

  return {
    // Date range
    dateRange,
    dateRangeType,
    handleDateRangeChange,
    handleDateRangePickerChange,
    formattedDateRange,
    
    // Stats
    statsData,
    
    // Chart data
    depositsChartData,
    ordersChartData,
    paymentMethodData,
    
    // Raw data
    deposits,
    
    // Status
    isLoading,
    
    // Actions
    refetch
  };
}
