
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OrderRow, isOrderRow } from '@/types/orders';

export function usePurchases() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  const pageSize = 10;

  const fetchPurchases = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch total count for pagination
      const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (countError) throw countError;
      
      if (count) {
        setTotalPages(Math.ceil(count / pageSize));
      }
      
      // Fetch orders with pagination
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            price,
            total,
            data,
            product:product_id(
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      // Apply search filter if provided
      if (search) {
        query = query.or(`id.ilike.%${search}%,order_items.product->>name.ilike.%${search}%`);
      }
      
      // Apply pagination
      query = query.range((page - 1) * pageSize, page * pageSize - 1);
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      const typedData = data?.filter(isOrderRow) || [];
      setOrders(typedData);
      
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch purchases');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPurchases();
  }, [user, page, search]);
  
  return {
    orders,
    isLoading,
    error,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    refresh: fetchPurchases
  };
}
