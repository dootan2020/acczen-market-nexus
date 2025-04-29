
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { formatDateForDB } from "./dateUtils";

export function useDepositsQuery(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ['admin-reports-deposits', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .gte('created_at', dateRange?.from ? formatDateForDB(dateRange.from) : '2000-01-01')
        .lte('created_at', dateRange?.to ? formatDateForDB(dateRange.to) : formatDateForDB(new Date()))
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });
}

export function useOrdersQuery(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ['admin-reports-orders', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', dateRange?.from ? formatDateForDB(dateRange.from) : '2000-01-01')
        .lte('created_at', dateRange?.to ? formatDateForDB(dateRange.to) : formatDateForDB(new Date()))
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });
}

export function useUsersQuery() {
  return useQuery({
    queryKey: ['admin-reports-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });
}
