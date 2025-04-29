
import { DateRange } from "react-day-picker";

// Pre-defined date ranges
export const DATE_RANGES = {
  TODAY: 'today',
  LAST_7_DAYS: '7days',
  LAST_30_DAYS: '30days',
  THIS_MONTH: 'month',
  CUSTOM: 'custom',
};

export interface StatsData {
  totalDeposits: number;
  totalDepositAmount: number;
  totalOrders: number;
  averageOrderValue: number;
  totalUsers: number;
  activeUsers: number;
  paypalDeposits: number;
  usdtDeposits: number;
  paypalAmount: number;
  usdtAmount: number;
  conversionRate: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DayData {
  date: string;
  amount: number;
  count: number;
}
