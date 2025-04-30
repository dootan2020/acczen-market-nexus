
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountBalance } from "./AccountBalance";
import { OrderStatistics } from "./OrderStatistics";
import { RecentOrders } from "./RecentOrders";
import { DashboardWelcome } from "./DashboardWelcome";
import { AccountOverview } from "./AccountOverview";
import { QuickActions } from "./QuickActions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Tables } from "@/types/supabase";

// Define explicit interfaces for the nested types
interface ProductInfo {
  name: string;
}

interface OrderItem {
  product: ProductInfo;
}

// Define the OrderWithItems type with explicit structure
interface OrderWithItems {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

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
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as OrderWithItems[];
    },
    enabled: !!user,
  });

  // Fetch user stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      // Get total spend
      const { data: totalSpend, error: spendError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', user?.id)
        .eq('status', 'completed');
      
      if (spendError) throw spendError;
      
      // Get total products purchased
      const { data: productCount, error: productError } = await supabase
        .from('order_items')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id);
      
      if (productError) throw productError;
      
      return {
        totalSpend: totalSpend?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        totalProducts: productCount?.length || 0,
        totalOrders: totalSpend?.length || 0
      };
    },
    enabled: !!user,
  });

  // Fetch user profile
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

  const isLoading = isLoadingOrders || isLoadingStats || isLoadingProfile;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardWelcome />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AccountBalance balance={profile?.balance || 0} />
        <OrderStatistics orderCount={stats?.totalOrders || 0} />
        
        {/* Additional stats cards */}
        <Card className="shadow-sm border-primary/10 transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M16 12h-6.5a2 2 0 1 0 0 4H12a2 2 0 1 1 0 4H8"></path>
              <path d="M12 6v2m0 8v2"></path>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalSpend.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-primary/10 transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Purchased</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <path d="M3 6h18"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || "0"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AccountOverview />
        <QuickActions />
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* Recent Orders with full width */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>Your latest product purchases</CardDescription>
            </div>
            <Link to="/dashboard/purchases">
              <Button variant="ghost" size="sm" className="text-chatgpt-primary hover:text-chatgpt-primary/80">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">{order.order_items[0]?.product?.name || "Unknown Product"}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                      }`}>
                        {order.status}
                      </span>
                      <div className="font-medium">${order.total_amount.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-4">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <path d="M3 6h18"></path>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <h3 className="text-lg font-medium mb-1">No purchases yet</h3>
                <p className="text-muted-foreground mb-4">Start shopping to see your purchases here</p>
                <Link to="/products">
                  <Button className="bg-chatgpt-primary hover:bg-chatgpt-primary/90">Browse Products</Button>
                </Link>
              </div>
            )}
          </CardContent>
          {recentOrders && recentOrders.length > 0 && (
            <CardFooter className="border-t px-6 py-4">
              <Link to="/dashboard/purchases" className="w-full">
                <Button className="w-full bg-chatgpt-primary hover:bg-chatgpt-primary/90">
                  View All Purchases
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
