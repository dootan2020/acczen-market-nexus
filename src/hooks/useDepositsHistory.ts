
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Deposit } from '@/types/deposits';

const PAGE_SIZE = 10;

export const useDepositsHistory = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Fetch deposits with pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['deposits-history', page, search],
    queryFn: async () => {
      let query = supabase
        .from('deposits')
        .select(`
          id,
          user_id,
          amount,
          payment_method,
          status,
          created_at,
          updated_at,
          paypal_payer_email,
          transaction_hash
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`payment_method.ilike.%${search}%,paypal_payer_email.ilike.%${search}%,transaction_hash.ilike.%${search}%`);
      }

      // Add pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      // First get the count
      const countQuery = supabase
        .from('deposits')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user?.id);
        
      if (search) {
        countQuery.or(`payment_method.ilike.%${search}%,paypal_payer_email.ilike.%${search}%,transaction_hash.ilike.%${search}%`);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      // Then fetch the paginated data
      const { data: deposits, error } = await query.range(from, to);
      
      if (error) throw error;
      
      return { deposits: deposits as Deposit[], count: count ?? 0 };
    },
    enabled: !!user,
  });

  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return {
    deposits: data?.deposits ?? [],
    count: data?.count ?? 0,
    page,
    setPage,
    search, 
    setSearch,
    isLoading,
    error,
    totalPages,
    PAGE_SIZE,
  };
};
