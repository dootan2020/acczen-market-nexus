
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountBalance } from "./AccountBalance";
import { OrderStatistics } from "./OrderStatistics";
import { RecentOrders } from "./RecentOrders";
import { Loading } from "@/components/ui/loading";

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch recent orders
  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            product:products(name)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user balance
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoadingProfile || isLoadingOrders) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AccountBalance balance={profile?.balance || 0} />
        <OrderStatistics orderCount={recentOrders?.length || 0} />
      </div>

      <RecentOrders orders={recentOrders || []} />
    </div>
  );
}

export default Dashboard;
