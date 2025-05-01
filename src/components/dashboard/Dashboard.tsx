
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
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', supabase.auth.getUser().data?.user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data as Order[] || [];
    }
  });

  // Fetch user profile with explicit type annotations
  const { data: profile } = useQuery<Profile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabase.auth.getUser().data?.user?.id)
        .single();
      
      return data as Profile;
    }
  });

  // Fetch user statistics with explicit type annotations
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data } = await supabase
        .rpc('get_user_stats', {
          user_id: supabase.auth.getUser().data?.user?.id
        });
      
      return data as UserStats || { total_orders: 0, total_spent: 0 };
    }
  });
  
  return (
    <div className="space-y-8">
      <DashboardWelcome />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AccountBalance balance={profile?.balance || 0} />
        <OrderStatistics 
          totalOrders={userStats?.total_orders || 0}
          totalSpent={userStats?.total_spent || 0}
        />
        <QuickActions />
      </div>
      
      <RecentOrders orders={recentOrders || []} />
    </div>
  );
};

export default Dashboard;
