
import React from 'react';
import { DashboardWelcome } from './DashboardWelcome';
import { RecentOrders } from './RecentOrders';
import { AccountBalance } from './AccountBalance';
import { OrderStatistics } from './OrderStatistics';
import { QuickActions } from './QuickActions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define explicit interfaces to avoid deep type instantiation
interface ProductInfo {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  subtotal: number;
  product_id: string;
  product?: ProductInfo;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items?: OrderItem[];
  order_items?: any[]; // Added to align with expected type
}

interface UserStats {
  total_orders: number;
  total_spent: number;
}

interface Profile {
  id: string;
  username: string;
  email: string;
  balance: number;
}

const Dashboard = () => {
  // Fetch recent orders with explicit type annotations
  const { data: recentOrders } = useQuery<Order[]>({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userData?.user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data as Order[] || [];
    }
  });

  // Fetch user profile with explicit type annotations
  const { data: profile } = useQuery<Profile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData?.user?.id)
        .single();
      
      return data as Profile;
    }
  });

  // Fetch user statistics with explicit type annotations
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      // Use a standard Supabase query instead of RPC since get_user_stats doesn't seem to exist
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', userData?.user?.id);
      
      // Calculate stats manually since the RPC isn't available
      const stats: UserStats = {
        total_orders: ordersData?.length || 0,
        total_spent: ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      };
      
      return stats;
    }
  });
  
  // Fix: Ensure the component returns a single root element
  return (
    <div className="space-y-8">
      <DashboardWelcome />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AccountBalance balance={profile?.balance || 0} />
        <OrderStatistics 
          orderCount={userStats?.total_orders || 0}
        />
        <QuickActions />
      </div>
      
      <RecentOrders orders={recentOrders || []} />
    </div>
  );
};

export default Dashboard;
