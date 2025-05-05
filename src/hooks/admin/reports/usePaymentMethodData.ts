
import { PaymentMethodData, StatsData } from "@/types/reports";
import { DateRange } from "react-day-picker";

export function usePaymentMethodData(dateRange: DateRange | undefined) {
  // This is a placeholder to be filled with actual data fetching logic
  // We'll return an empty array until integration with the useStatsData hook is completed
  return {
    paymentMethodData: [] as PaymentMethodData[],
    isLoading: false
  };
}
