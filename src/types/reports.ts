
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

export interface OrderCount {
  date: string;
  count: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export interface PaymentMethodData {
  method: string;
  amount: number;
}

// Add a conversion function to transform PaymentMethodData to ChartData
export function convertPaymentMethodToChartData(data: PaymentMethodData[]): ChartData[] {
  return data.map(item => ({
    name: item.method,
    value: item.amount
  }));
}

export interface CategoryStockData {
  category_name: string;
  stock_count: number;
}
