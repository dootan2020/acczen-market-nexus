
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Deposit } from '@/types/deposits';

const PAGE_SIZE = 10;

export const useDepositsHistory = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const fetchDeposits = async () => {
    if (!user) return [];
    
    try {
      // Build the query
      let query = supabase
        .from('deposits')
        .select('*, profiles:profiles(email, username)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      // Apply search filter if provided
      if (search) {
        query = query.or(`payment_method.ilike.%${search}%,status.ilike.%${search}%`);
      }
      
      // Apply pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Calculate total pages
      if (count !== null) {
        setTotalPages(Math.ceil(count / PAGE_SIZE));
      }
      
      return data as Deposit[];
    } catch (error) {
      console.error('Error fetching deposits history:', error);
      throw error;
    }
  };

  const { 
    data: deposits = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['deposits', user?.id, page, search],
    queryFn: fetchDeposits,
    enabled: !!user
  });

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  return {
    deposits,
    page,
    setPage,
    search,
    setSearch,
    isLoading,
    error,
    totalPages,
    refetch
  };
};
