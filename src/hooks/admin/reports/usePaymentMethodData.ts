
import { PaymentMethodHookResult, ChartData } from "@/types/reports";
import { DateRange } from "react-day-picker";
import { useStatsData } from "./useStatsData";
import { useMemo } from "react";

export function usePaymentMethodData(dateRange: DateRange | undefined): PaymentMethodHookResult {
  // Leverage the statsData hook to get payment data
  const { statsData, isLoading: statsLoading } = useStatsData(dateRange);
  
  // Create chart data directly from stats with memoization to avoid recalculations
  const paymentMethodData: ChartData[] = useMemo(() => {
    if (statsLoading || !statsData) return [];
    
    return [
      { name: 'PayPal', value: statsData.paypalAmount },
      { name: 'USDT', value: statsData.usdtAmount },
    ];
  }, [statsData, statsLoading]);

  return {
    paymentMethodData,
    isLoading: statsLoading
  };
}
