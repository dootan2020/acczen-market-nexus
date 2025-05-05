
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

// Define DateRangeType
export type DateRangeType = 'today' | '7days' | '30days' | 'month' | 'week' | 'quarter' | 'year' | 'all' | 'custom';

// Basic chart data interface used for various visualizations
export interface ChartData {
  name: string;
  value: number;
}

export interface DepositsChartData {
  date: string;
  amount: number;
  count: number;
  name?: string; // Added for chart compatibility
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

// Payment method data with proper structure
export interface PaymentMethodData {
  method: string;
  amount: number;
}

// Convert PaymentMethodData to ChartData for visualization consistency
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

// Interface for stats data hook return value
export interface StatsDataHookResult {
  statsData: StatsData;
  isLoading: boolean;
}

// Interface for payment method hook return value
export interface PaymentMethodHookResult {
  paymentMethodData: ChartData[];
  isLoading: boolean;
}
