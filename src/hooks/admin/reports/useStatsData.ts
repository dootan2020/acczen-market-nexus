
import { StatsData } from "@/types/reports";
import { useDepositsData } from "./useDepositsData";
import { useOrdersData } from "./useOrdersData";
import { useUsersData } from "./useUsersData";
import { DateRange } from "react-day-picker";

export function useStatsData(dateRange: DateRange | undefined) {
  const { deposits } = useDepositsData(dateRange);
  const { orders } = useOrdersData(dateRange);
  const { users } = useUsersData();
  
  // Process data for stats
  const statsData: StatsData = (() => {
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
      ? parseFloat((activeUsers.length / users.length * 100).toFixed(1))
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
  })();

  return statsData;
}
