
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfToday, endOfToday, endOfMonth, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";

// Types
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

// Pre-defined date ranges
export const DATE_RANGES = {
  TODAY: 'today',
  LAST_7_DAYS: '7days',
  LAST_30_DAYS: '30days',
  THIS_MONTH: 'month',
  CUSTOM: 'custom',
};

export function useReportsData() {
  // State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [dateRangeType, setDateRangeType] = useState(DATE_RANGES.LAST_30_DAYS);

  // Update date range based on selection
  const handleDateRangeChange = (value: string) => {
    setDateRangeType(value);
    
    const today = new Date();
    switch (value) {
      case DATE_RANGES.TODAY:
        setDateRange({
          from: startOfToday(),
          to: endOfToday(),
        });
        break;
      case DATE_RANGES.LAST_7_DAYS:
        setDateRange({
          from: subDays(today, 7),
          to: today,
        });
        break;
      case DATE_RANGES.LAST_30_DAYS:
        setDateRange({
          from: subDays(today, 30),
          to: today,
        });
        break;
      case DATE_RANGES.THIS_MONTH:
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today),
        });
        break;
      // For custom, do nothing as it's handled by the date picker component
    }
  };

  // Custom date range handler
  const handleDateRangePickerChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setDateRangeType(DATE_RANGES.CUSTOM);
    }
  };

  // Fetch deposits data
  const depositsQuery = useQuery({
    queryKey: ['admin-reports-deposits', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .gte('created_at', dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '2000-01-01')
        .lte('created_at', dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  // Fetch orders data
  const ordersQuery = useQuery({
    queryKey: ['admin-reports-orders', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '2000-01-01')
        .lte('created_at', dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  // Fetch users data
  const usersQuery = useQuery({
    queryKey: ['admin-reports-users', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Process data for stats
  const statsData: StatsData = (() => {
    const deposits = depositsQuery.data || [];
    const orders = ordersQuery.data || [];
    const users = usersQuery.data || [];
    
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
      ? (activeUsers.length / users.length * 100).toFixed(1)
      : "0";
    
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
      conversionRate: parseFloat(conversionRate)
    };
  })();

  // Prepare deposits chart data
  const depositsChartData = (() => {
    const deposits = depositsQuery.data || [];
    if (!dateRange?.from || !dateRange?.to) return [];
    
    // Group deposits by day
    const depositsByDay = deposits.reduce((acc: Record<string, {date: string, amount: number, count: number}>, deposit) => {
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
  })();

  // Prepare orders chart data
  const ordersChartData = (() => {
    const orders = ordersQuery.data || [];
    if (!dateRange?.from || !dateRange?.to) return [];
    
    // Group orders by day
    const ordersByDay = orders.reduce((acc: Record<string, {date: string, amount: number, count: number}>, order) => {
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
  })();

  // Payment method distribution chart data
  const paymentMethodData: ChartData[] = [
    { name: 'PayPal', value: statsData.paypalAmount },
    { name: 'USDT', value: statsData.usdtAmount },
  ];

  // Loading state
  const isLoading = depositsQuery.isLoading || ordersQuery.isLoading || usersQuery.isLoading;

  // Format date range for display
  const formattedDateRange = (() => {
    if (!dateRange?.from) {
      return 'Select date range';
    }
    if (!dateRange.to) {
      return format(dateRange.from, 'PPP');
    }
    return `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`;
  })();

  return {
    dateRange,
    dateRangeType,
    handleDateRangeChange,
    handleDateRangePickerChange,
    formattedDateRange,
    statsData,
    depositsChartData,
    ordersChartData,
    paymentMethodData,
    isLoading,
    refetch: () => {
      depositsQuery.refetch();
      ordersQuery.refetch();
      usersQuery.refetch();
    }
  };
}
