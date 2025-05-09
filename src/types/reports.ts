
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

export interface DepositsChartData {
  date: string;
  amount: number;
  count: number;
}

export interface OrdersChartData {
  date: string;
  amount: number;
  count: number;
}
