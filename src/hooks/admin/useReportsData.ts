
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfMonth, startOfYear, startOfWeek, addWeeks, addMonths, addYears, endOfDay, startOfDay } from 'date-fns';
import { StatsData, DepositsChartData, PaymentMethodData, DateRangeType } from '@/types/reports';

// Helper function to get date range from type
const getDateRangeFromType = (type: DateRangeType): DateRange => {
  const today = new Date();
  let from: Date;

  switch (type) {
    case 'week':
      from = startOfWeek(today);
      break;
    case 'month':
      from = startOfMonth(today);
      break;
    case 'quarter':
      from = subDays(today, 90);
      break;
    case 'year':
      from = startOfYear(today);
      break;
    case 'all':
      // Get date from 3 years ago to represent "all time"
      from = subDays(today, 365 * 3);
      break;
    default:
      from = subDays(today, 7); // Default to last 7 days
  }

  return {
    from,
    to: today
  };
};

// Helper to format date range for display
const formatDateRange = (range: DateRange): string => {
  if (!range.from) return 'Select date range';
  if (!range.to) return `From ${format(range.from, 'PPP')}`;
  return `${format(range.from, 'PPP')} - ${format(range.to, 'PPP')}`;
};

export const useReportsData = () => {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('week');
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromType('week'));
  const [formattedDateRange, setFormattedDateRange] = useState<string>(formatDateRange(getDateRangeFromType('week')));

  // Update date range when range type changes
  const handleDateRangeChange = useCallback((type: DateRangeType) => {
    setDateRangeType(type);
    setDateRange(getDateRangeFromType(type));
  }, []);

  // Handle custom date range selection
  const handleDateRangePickerChange = useCallback((range: DateRange) => {
    setDateRange(range);
    if (range.from && range.to) {
      setDateRangeType('custom');
    }
  }, []);

  // Format date range for display
  useEffect(() => {
    setFormattedDateRange(formatDateRange(dateRange));
  }, [dateRange]);

  // Fetch stats data based on date range
  const { 
    data: statsData, 
    isLoading: isStatsLoading, 
    refetch: refetchStats
  } = useQuery<StatsData>({
    queryKey: ['admin-stats', dateRange],
    queryFn: async () => {
      try {
        if (!dateRange.from || !dateRange.to) {
          throw new Error('Invalid date range');
        }

        const fromDate = startOfDay(dateRange.from).toISOString();
        const toDate = endOfDay(dateRange.to).toISOString();

        // Fetch orders stats
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, total_amount, created_at, status')
          .gte('created_at', fromDate)
          .lte('created_at', toDate);

        if (ordersError) throw ordersError;

        // Fetch deposits stats
        const { data: depositsData, error: depositsError } = await supabase
          .from('deposits')
          .select('id, amount, created_at, status, payment_method')
          .gte('created_at', fromDate)
          .lte('created_at', toDate);

        if (depositsError) throw depositsError;

        // Fetch users stats
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, created_at')
          .gte('created_at', fromDate)
          .lte('created_at', toDate);

        if (usersError) throw usersError;

        // Calculate statistics
        const completedOrders = ordersData.filter(order => order.status === 'completed');
        const completedDeposits = depositsData.filter(deposit => deposit.status === 'completed');

        const totalOrders = completedOrders.length;
        const totalDepositAmount = completedDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
        const totalDeposits = completedDeposits.length;
        const totalUsers = usersData.length;
        
        // Calculate payment method stats
        const paypalDeposits = completedDeposits.filter(d => d.payment_method === 'paypal').length;
        const usdtDeposits = completedDeposits.filter(d => d.payment_method === 'usdt').length;
        const paypalAmount = completedDeposits
          .filter(d => d.payment_method === 'paypal')
          .reduce((sum, d) => sum + d.amount, 0);
        const usdtAmount = completedDeposits
          .filter(d => d.payment_method === 'usdt')
          .reduce((sum, d) => sum + d.amount, 0);

        // Calculate average order value
        const averageOrderValue = totalOrders > 0 
          ? completedOrders.reduce((sum, order) => sum + order.total_amount, 0) / totalOrders 
          : 0;

        // Calculate active users (users with at least one order)
        const userOrdersMap = new Set(ordersData.map(order => order.user_id));
        const activeUsers = userOrdersMap.size;

        // Calculate conversion rate
        const conversionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

        return {
          totalOrders,
          totalDepositAmount,
          totalDeposits,
          totalUsers,
          activeUsers,
          conversionRate,
          averageOrderValue,
          paypalDeposits,
          usdtDeposits,
          paypalAmount,
          usdtAmount
        };
      } catch (error) {
        console.error('Error fetching stats data:', error);
        return {
          totalOrders: 0,
          totalDepositAmount: 0,
          totalDeposits: 0,
          totalUsers: 0,
          activeUsers: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          paypalDeposits: 0,
          usdtDeposits: 0,
          paypalAmount: 0,
          usdtAmount: 0
        };
      }
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Fetch deposits chart data
  const { 
    data: depositsChartData, 
    isLoading: isDepositsChartLoading 
  } = useQuery<DepositsChartData[]>({
    queryKey: ['admin-deposits-chart', dateRange, dateRangeType],
    queryFn: async () => {
      try {
        if (!dateRange.from || !dateRange.to) {
          throw new Error('Invalid date range');
        }

        const fromDate = startOfDay(dateRange.from).toISOString();
        const toDate = endOfDay(dateRange.to).toISOString();

        // Fetch all deposits within date range
        const { data: depositsData, error } = await supabase
          .from('deposits')
          .select('amount, created_at, status')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .eq('status', 'completed');

        if (error) throw error;

        // Format data for chart based on date range type
        let formattedData: DepositsChartData[] = [];
        
        // Helper to get the period key based on date range type
        const getPeriodKey = (date: Date) => {
          switch (dateRangeType) {
            case 'week':
              return format(date, 'EEE'); // Mon, Tue, etc.
            case 'month':
              return format(date, 'd'); // 1, 2, 3, etc.
            case 'quarter':
              return format(date, 'MMM d'); // Jan 1, Jan 2, etc.
            case 'year':
              return format(date, 'MMM'); // Jan, Feb, etc.
            case 'all':
              return format(date, 'MMM yyyy'); // Jan 2023, Feb 2023, etc.
            default:
              return format(date, 'd MMM'); // 1 Jan, 2 Jan, etc.
          }
        };

        // Group deposits by period
        const depositsMap: Record<string, number> = {};
        
        depositsData.forEach(deposit => {
          const date = new Date(deposit.created_at);
          const periodKey = getPeriodKey(date);
          
          depositsMap[periodKey] = (depositsMap[periodKey] || 0) + deposit.amount;
        });

        // Convert map to array for chart
        formattedData = Object.entries(depositsMap).map(([name, value]) => ({
          name,
          value
        }));

        // Sort data by date
        return formattedData.sort((a, b) => {
          // This is a simplified sort that works for most formats
          // For more complex cases, you may need to parse the dates
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        console.error('Error fetching deposits chart data:', error);
        return [];
      }
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Fetch orders chart data
  const { 
    data: ordersChartData, 
    isLoading: isOrdersChartLoading 
  } = useQuery({
    queryKey: ['admin-orders-chart', dateRange, dateRangeType],
    queryFn: async () => {
      try {
        if (!dateRange.from || !dateRange.to) {
          throw new Error('Invalid date range');
        }

        const fromDate = startOfDay(dateRange.from).toISOString();
        const toDate = endOfDay(dateRange.to).toISOString();

        // Fetch all orders within date range
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select('total_amount, created_at, status')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .eq('status', 'completed');

        if (error) throw error;

        // Helper to get the period key based on date range type (same as for deposits)
        const getPeriodKey = (date: Date) => {
          switch (dateRangeType) {
            case 'week':
              return format(date, 'EEE'); // Mon, Tue, etc.
            case 'month':
              return format(date, 'd'); // 1, 2, 3, etc.
            case 'quarter':
              return format(date, 'MMM d'); // Jan 1, Jan 2, etc.
            case 'year':
              return format(date, 'MMM'); // Jan, Feb, etc.
            case 'all':
              return format(date, 'MMM yyyy'); // Jan 2023, Feb 2023, etc.
            default:
              return format(date, 'd MMM'); // 1 Jan, 2 Jan, etc.
          }
        };

        // Group orders by period
        const ordersMap: Record<string, { amount: number, count: number }> = {};
        
        ordersData.forEach(order => {
          const date = new Date(order.created_at);
          const periodKey = getPeriodKey(date);
          
          if (!ordersMap[periodKey]) {
            ordersMap[periodKey] = { amount: 0, count: 0 };
          }
          
          ordersMap[periodKey].amount += order.total_amount;
          ordersMap[periodKey].count += 1;
        });

        // Convert map to array for chart
        const formattedData = Object.entries(ordersMap).map(([name, data]) => ({
          name,
          amount: data.amount,
          count: data.count
        }));

        // Sort data by date
        return formattedData.sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        console.error('Error fetching orders chart data:', error);
        return [];
      }
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Fetch payment methods data
  const { 
    data: paymentMethodData, 
    isLoading: isPaymentMethodLoading 
  } = useQuery<PaymentMethodData[]>({
    queryKey: ['admin-payment-methods', dateRange],
    queryFn: async () => {
      try {
        if (!dateRange.from || !dateRange.to) {
          throw new Error('Invalid date range');
        }

        const fromDate = startOfDay(dateRange.from).toISOString();
        const toDate = endOfDay(dateRange.to).toISOString();

        // Fetch all completed deposits within date range
        const { data: depositsData, error } = await supabase
          .from('deposits')
          .select('amount, payment_method')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .eq('status', 'completed');

        if (error) throw error;

        // Group by payment method
        const methodMap: Record<string, number> = {};
        
        depositsData.forEach(deposit => {
          const method = deposit.payment_method || 'unknown';
          methodMap[method] = (methodMap[method] || 0) + deposit.amount;
        });

        // Convert to array for chart
        return Object.entries(methodMap).map(([method, amount]) => ({
          method,
          amount
        }));
      } catch (error) {
        console.error('Error fetching payment method data:', error);
        return [];
      }
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Fetch deposits list
  const { 
    data: deposits, 
    isLoading: isDepositsLoading 
  } = useQuery({
    queryKey: ['admin-deposits-list', dateRange],
    queryFn: async () => {
      try {
        if (!dateRange.from || !dateRange.to) {
          throw new Error('Invalid date range');
        }

        const fromDate = startOfDay(dateRange.from).toISOString();
        const toDate = endOfDay(dateRange.to).toISOString();

        // Fetch all deposits within date range with user profiles
        const { data, error } = await supabase
          .from('deposits')
          .select(`
            *,
            profiles:user_id (
              email,
              username
            )
          `)
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching deposits list:', error);
        return [];
      }
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Combined loading state
  const isLoading = isStatsLoading || isDepositsChartLoading || isOrdersChartLoading || isPaymentMethodLoading || isDepositsLoading;

  // Combined refetch function
  const refetch = () => {
    refetchStats();
  };

  return {
    dateRange,
    dateRangeType,
    handleDateRangeChange,
    handleDateRangePickerChange,
    statsData,
    depositsChartData,
    ordersChartData,
    paymentMethodData,
    deposits,
    isLoading,
    refetch,
    formattedDateRange
  };
};
