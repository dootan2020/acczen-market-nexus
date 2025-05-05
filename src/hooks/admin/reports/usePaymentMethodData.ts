
import { ChartData } from "@/types/reports";
import { StatsData } from "@/types/reports";

export function usePaymentMethodData(statsData: StatsData) {
  // Payment method distribution chart data
  const paymentMethodData: ChartData[] = [
    { name: 'PayPal', value: statsData.paypalAmount },
    { name: 'USDT', value: statsData.usdtAmount },
  ];

  return paymentMethodData;
}
