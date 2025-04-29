
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfToday, endOfToday, endOfMonth, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    
    // Reset to page 1 when changing date range
    setCurrentPage(1);
  };

  // Custom date range handler
  const handleDateRangePickerChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setDateRangeType(DATE_RANGES.CUSTOM);
      setCurrentPage(1); // Reset to page 1 when changing date range
    }
  };

  // Format dates for queries
  const getFormattedDateRange = useCallback(() => {
    return {
      from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '2000-01-01',
      to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    };
  }, [dateRange]);

  // Fetch deposits data
  const depositsQuery = useQuery({
    queryKey: ['admin-reports-deposits', dateRange],
    queryFn: async () => {
      try {
        const { from, to } = getFormattedDateRange();
        
        const { data, error, count } = await supabase
          .from('deposits')
          .select('*', { count: 'exact' })
          .gte('created_at', from)
          .lte('created_at', to)
          .order('created_at', { ascending: false });
  
        if (error) throw error;
        return { data, count: count || 0 };
      } catch (error: any) {
        toast.error('Failed to load deposit data', {
          description: error.message || 'Please try again later'
        });
        console.error('Deposits query error:', error);
        return { data: [], count: 0 };
      }
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });

  // Fetch orders data
  const ordersQuery = useQuery({
    queryKey: ['admin-reports-orders', dateRange],
    queryFn: async () => {
      try {
        const { from, to } = getFormattedDateRange();
        
        const { data, error, count } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .gte('created_at', from)
          .lte('created_at', to)
          .order('created_at', { ascending: false });
  
        if (error) throw error;
        return { data, count: count || 0 };
      } catch (error: any) {
        toast.error('Failed to load orders data', {
          description: error.message || 'Please try again later'
        });
        console.error('Orders query error:', error);
        return { data: [], count: 0 };
      }
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });

  // Fetch users data
  const usersQuery = useQuery({
    queryKey: ['admin-reports-users'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });
  
        if (error) throw error;
        return data;
      } catch (error: any) {
        toast.error('Failed to load users data', {
          description: error.message || 'Please try again later'
        });
        console.error('Users query error:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // Cache user data longer (10 minutes)
    refetchOnWindowFocus: false
  });

  // Process data for stats
  const statsData: StatsData = (() => {
    const deposits = depositsQuery.data?.data || [];
    const orders = ordersQuery.data?.data || [];
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
    const deposits = depositsQuery.data?.data || [];
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
    const orders = ordersQuery.data?.data || [];
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

  // Refresh function with optimistic UI updates
  const refetch = useCallback(async () => {
    toast.promise(
      Promise.all([
        depositsQuery.refetch(),
        ordersQuery.refetch(),
        usersQuery.refetch(),
      ]), 
      {
        loading: 'Refreshing data...',
        success: 'Data updated successfully',
        error: 'Failed to refresh data'
      }
    );
  }, [depositsQuery, ordersQuery, usersQuery]);

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
    refetch,
    // Pagination
    currentPage,
    setCurrentPage,
    pageSize, 
    setPageSize,
    // Data for tables
    depositsData: depositsQuery.data?.data || [],
    ordersData: ordersQuery.data?.data || [],
    // Total counts for pagination
    totalDeposits: depositsQuery.data?.count || 0,
    totalOrders: ordersQuery.data?.count || 0
  };
}
