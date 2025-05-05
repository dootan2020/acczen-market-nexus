
import { ChartData, RevenueData, PaymentMethodData } from '@/types/reports';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  conversionRate: number;
  totalOrders: number;
  totalDepositAmount: number;
  totalDeposits: number;
  averageOrderValue: number;
  orderCountByDay: { date: string; count: number }[];
  depositAmountByDay: { date: string; amount: number }[];
  revenueByDay: RevenueData[];
  paymentMethodData: PaymentMethodData[];
  revenueChartData: ChartData[];
  orderChartData: ChartData[];
  productCategoryData: ChartData[];
}
