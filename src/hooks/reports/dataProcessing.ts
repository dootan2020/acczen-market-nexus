
import { format } from "date-fns";
import { StatsData, ChartData, DayData } from "./types";

export function processStatsData(deposits: any[], orders: any[], users: any[]): StatsData {
  // Filter completed deposits
  const completedDeposits = deposits.filter(d => d.status === 'completed');
  
  // Calculate PayPal vs USDT stats
  const paypalDeposits = completedDeposits.filter(d => d.payment_method === 'PayPal');
  const usdtDeposits = completedDeposits.filter(d => d.payment_method === 'USDT');
  
  const paypalAmount = paypalDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
  const usdtAmount = usdtDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalDepositAmount = paypalAmount + usdtAmount;
  
  // User and conversion stats
  const activeUsers = users.filter(u => {
    const hasOrder = orders.some(o => o.user_id === u.id);
    const hasDeposit = deposits.some(d => d.user_id === u.id);
    return hasOrder || hasDeposit;
  });
  
  const conversionRate = users.length > 0 
    ? (activeUsers.length / users.length * 100)
    : 0;
  
  return {
    totalDeposits: completedDeposits.length,
    totalDepositAmount,
    totalOrders: orders.length,
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length
      : 0,
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    paypalDeposits: paypalDeposits.length,
    usdtDeposits: usdtDeposits.length,
    paypalAmount,
    usdtAmount,
    conversionRate
  };
}

export function processDepositsChartData(deposits: any[]): DayData[] {
  if (!deposits || !Array.isArray(deposits) || deposits.length === 0) {
    return [];
  }
  
  // Group deposits by day
  const depositsByDay = deposits.reduce((acc: Record<string, DayData>, deposit) => {
    if (!deposit || !deposit.created_at) return acc;
    
    const date = format(new Date(deposit.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { date, amount: 0, count: 0 };
    }
    
    if (deposit.status === 'completed') {
      acc[date].amount += deposit.amount || 0;
      acc[date].count += 1;
    }
    
    return acc;
  }, {});
  
  // Convert to array and sort by date
  return Object.values(depositsByDay).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function processOrdersChartData(orders: any[]): DayData[] {
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return [];
  }
  
  // Group orders by day
  const ordersByDay = orders.reduce((acc: Record<string, DayData>, order) => {
    if (!order || !order.created_at) return acc;
    
    const date = format(new Date(order.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { date, amount: 0, count: 0 };
    }
    
    acc[date].amount += order.total_amount || 0;
    acc[date].count += 1;
    
    return acc;
  }, {});
  
  // Convert to array and sort by date
  return Object.values(ordersByDay).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function generatePaymentMethodData(statsData: StatsData): ChartData[] {
  return [
    { name: 'PayPal', value: statsData.paypalAmount },
    { name: 'USDT', value: statsData.usdtAmount },
  ];
}
