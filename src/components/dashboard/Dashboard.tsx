
import React, { Suspense } from 'react';
import { DashboardWelcome } from './DashboardWelcome';
import { RecentOrders } from './RecentOrders';
import { AccountBalance } from './AccountBalance';
import { OrderStatistics } from './OrderStatistics';
import { QuickActions } from './QuickActions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

// Create loading skeletons for better UX
const LoadingBalance = () => (
  <Card>
    <CardContent className="flex flex-col gap-2 p-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-10 w-1/2 mt-2" />
      <Skeleton className="h-4 w-full mt-2" />
    </CardContent>
  </Card>
);

const LoadingStats = () => (
  <Card>
    <CardContent className="flex flex-col gap-2 p-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-10 w-1/2 mt-2" />
      <Skeleton className="h-4 w-full mt-2" />
    </CardContent>
  </Card>
);

const LoadingOrders = () => (
  <Card>
    <CardContent className="p-6">
      <Skeleton className="h-8 w-1/4 mb-4" />
      <div className="space-y-2">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  // Fetch recent orders with explicit type annotations and optimistic updates
  const { 
    data: recentOrders, 
    isLoading: ordersLoading,
    error: ordersError 
  } = useQuery<Order[]>({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userData?.user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as Order[] || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    retry: 2,
    meta: {
      errorMessage: 'Failed to fetch orders'
    }
  });

  // Show toast on error
  React.useEffect(() => {
    if (ordersError) {
      toast({
        title: 'Error loading orders',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  }, [ordersError]);

  // Fetch user profile with explicit type annotations
  const { 
    data: profile, 
    isLoading: profileLoading,
    error: profileError 
  } = useQuery<Profile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData?.user?.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
    retry: 2,
    meta: {
      errorMessage: 'Failed to fetch profile'
    }
  });

  // Show toast on error
  React.useEffect(() => {
    if (profileError) {
      toast({
        title: 'Error loading profile',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  }, [profileError]);

  // Fetch user statistics with explicit type annotations
  const { 
    data: userStats, 
    isLoading: statsLoading,
    error: statsError 
  } = useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      // Use a standard Supabase query instead of RPC since get_user_stats doesn't seem to exist
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', userData?.user?.id);
      
      if (error) throw error;
      
      // Calculate stats manually since the RPC isn't available
      const stats: UserStats = {
        total_orders: ordersData?.length || 0,
        total_spent: ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      };
      
      return stats;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
    retry: 2,
    meta: {
      errorMessage: 'Failed to fetch stats'
    }
  });

  // Show toast on error
  React.useEffect(() => {
    if (statsError) {
      toast({
        title: 'Error loading statistics',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  }, [statsError]);
  
  // Check for any loading states
  const isLoading = profileLoading || statsLoading || ordersLoading;
  
  // Check for errors
  const hasErrors = profileError || statsError || ordersError;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <DashboardWelcome />
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <LoadingBalance />
          <LoadingStats />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/3 mb-2" />
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <LoadingOrders />
      </div>
    );
  }
  
  if (hasErrors) {
    return (
      <div className="space-y-8">
        <DashboardWelcome />
        
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            We encountered an issue while loading your dashboard data.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </Card>
      </div>
    );
  }
  
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
      
      <Suspense fallback={<LoadingOrders />}>
        <RecentOrders orders={recentOrders || []} />
      </Suspense>
    </div>
  );
};

export default React.memo(Dashboard);
