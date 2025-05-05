
import { PaymentMethodData, ChartData } from "@/types/reports";
import { DateRange } from "react-day-picker";

export function usePaymentMethodData(dateRange: DateRange | undefined) {
  // This is a placeholder that can be filled with actual data fetching logic later
  // For now, we're using the stats data directly in the useReports hook
  return {
    paymentMethodData: [] as ChartData[],
    isLoading: false
  };
}
