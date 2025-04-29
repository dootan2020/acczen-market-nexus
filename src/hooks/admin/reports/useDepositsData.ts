
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export function useDepositsData(dateRange: DateRange | undefined) {
  const depositsQuery = useQuery({
    queryKey: ['admin-reports-deposits', dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];
      
      const { data, error } = await supabase
        .from('deposits')
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

  return {
    deposits: depositsQuery.data || [],
    depositsChartData,
    isLoading: depositsQuery.isLoading,
    isError: depositsQuery.isError,
    error: depositsQuery.error,
    refetch: depositsQuery.refetch
  };
}
