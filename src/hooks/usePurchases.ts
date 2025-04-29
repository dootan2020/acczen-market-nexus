
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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
          // Properly transform JSON data to match OrderItemData type
          data: item.data ? safeTransformData(item.data) : null
        }))
      })) || [];
      
      return { orders, count: count ?? 0 };
    },
    enabled: !!user,
  });

  // Helper function to safely transform JSON data to OrderItemData
  const safeTransformData = (data: Json): OrderItemData | null => {
    if (!data) return null;
    
    // If it's an object, we can work with it
    if (typeof data === 'object' && data !== null) {
      // If it's an array, we can't transform it to OrderItemData
      if (Array.isArray(data)) return null;
      
      // Return the object as OrderItemData
      return data as OrderItemData;
    }
    
    // If it's a primitive (string, number, boolean), we can't transform it
    return null;
  };

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
