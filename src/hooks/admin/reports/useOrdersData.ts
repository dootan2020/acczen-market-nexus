
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export function useOrdersData(dateRange: DateRange | undefined) {
  const ordersQuery = useQuery({
    queryKey: ['admin-reports-orders', dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('created_at', format(dateRange.to, 'yyyy-MM-dd'))
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

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

  return {
    orders: ordersQuery.data || [],
    ordersChartData,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch
  };
}
