
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { 
  StatsData, 
  ChartData, 
  DATE_RANGES, 
  DayData 
} from "./types";
import { 
  getDateRangeForType, 
  formatDateRangeForDisplay 
} from "./dateUtils";
import { 
  processStatsData, 
  processDepositsChartData, 
  processOrdersChartData, 
  generatePaymentMethodData 
} from "./dataProcessing";
import { 
  useDepositsQuery, 
  useOrdersQuery, 
  useUsersQuery 
} from "./useReportsQueries";

export function useReportsData() {
  // State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [dateRangeType, setDateRangeType] = useState(DATE_RANGES.LAST_30_DAYS);

  // Update date range based on selection
  const handleDateRangeChange = (value: string) => {
    setDateRangeType(value);
    
    if (value !== DATE_RANGES.CUSTOM) {
      setDateRange(getDateRangeForType(value));
    }
  };

  // Custom date range handler
  const handleDateRangePickerChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setDateRangeType(DATE_RANGES.CUSTOM);
    }
  };

  // Fetch data using our query hooks
  const depositsQuery = useDepositsQuery(dateRange);
  const ordersQuery = useOrdersQuery(dateRange);
  const usersQuery = useUsersQuery();

  // Process data into required formats
  const statsData: StatsData = processStatsData(
    depositsQuery.data || [], 
    ordersQuery.data || [], 
    usersQuery.data || []
  );

  const depositsChartData: DayData[] = processDepositsChartData(depositsQuery.data || []);
  const ordersChartData: DayData[] = processOrdersChartData(ordersQuery.data || []);
  const paymentMethodData: ChartData[] = generatePaymentMethodData(statsData);

  // Loading state
  const isLoading = depositsQuery.isLoading || ordersQuery.isLoading || usersQuery.isLoading;

  // Format date range for display
  const formattedDateRange = formatDateRangeForDisplay(dateRange);

  return {
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
    refetch: () => {
      depositsQuery.refetch();
      ordersQuery.refetch();
      usersQuery.refetch();
    }
  };
}
