
import { PaymentMethodHookResult, ChartData } from "@/types/reports";
import { DateRange } from "react-day-picker";
import { useStatsData } from "./useStatsData";

export function usePaymentMethodData(dateRange: DateRange | undefined): PaymentMethodHookResult {
  // Leverage the statsData hook to get payment data
  const { statsData, isLoading: statsLoading } = useStatsData(dateRange);
  
  // Create chart data directly from stats
  const paymentMethodData: ChartData[] = !statsLoading ? [
    { name: 'PayPal', value: statsData.paypalAmount },
    { name: 'USDT', value: statsData.usdtAmount },
  ] : [];

  return {
    paymentMethodData,
    isLoading: statsLoading
  };
}
