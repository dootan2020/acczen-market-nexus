
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 10;

// Define types to match the structure from OrderItem in PurchasesTable
interface OrderItemData {
  product_keys?: string[];
  kiosk_token?: string;
  taphoammo_order_id?: string;
  [key: string]: any; // Allow for any additional properties
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  data: OrderItemData | null;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export const usePurchases = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Fetch orders with pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['purchases', page, search],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            id,
            quantity,
            price,
            total,
            data,
            product:products(id, name, price)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`order_items.product.name.ilike.%${search}%`);
      }

      // Add pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      // First get the count - using the correct pattern for count queries
      const countQuery = supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user?.id);
        
      if (search) {
        countQuery.or(`order_items.product.name.ilike.%${search}%`);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      // Then fetch the paginated data
      const { data: ordersData, error } = await query.range(from, to);
      
      if (error) throw error;
      
      // Process the data to ensure OrderItemData is correctly formatted
      const orders: Order[] = ordersData?.map(order => ({
        ...order,
        order_items: order.order_items.map(item => ({
          ...item,
          // Ensure data is properly structured or set to null if undefined
          data: item.data || null
        }))
      })) || [];
      
      return { orders, count: count ?? 0 };
    },
    enabled: !!user,
  });

  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return {
    orders: data?.orders ?? [],
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
