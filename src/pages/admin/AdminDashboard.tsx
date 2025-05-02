
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Wallet, 
  AlertTriangle,
  Package,
  Plus,
  Eye,
  User,
  Activity,
  LayoutDashboard
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDashboardStats, TimeRange } from '@/hooks/useDashboardStats';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

// Define proper types for dashboard stats
interface DashboardStats {
  userStats: { 
    total: number; 
    new: number; 
  };
  orderStats: { 
    total: number;
    completed: number;
    pending: number; 
    revenue: number;
  };
  depositStats: { 
    total: number;
    completed: number; 
    amount: number;
    paypal: number;
    usdt: number;
  };
  salesData: any[];
  ordersData: any[];
  depositsData: any[];
  recentOrders: any[];
  percentChanges: { 
    newUsers: number; 
    orderCount: number; 
    revenue: number;
    depositAmount: number;
    // Add missing properties
    userGrowth: number;
    productGrowth: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    timestamp: string;
    type: string;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
  }>;
  productStats: {
    total: number;
    inStock: number;
    lowStock: number;
  };
  timeRange: TimeRange;
}

const AdminDashboard = () => {
  const { data: stats, isLoading, error, timeRange, setTimeRange } = useDashboardStats();
  
  const { data: lowStockProducts } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .lt('stock_quantity', 5)
        .gt('stock_quantity', 0)
        .order('stock_quantity', { ascending: true });
        
      if (error) throw error;
      return data;
    }
  });
  
  const { data: apiErrors } = useQuery({
    queryKey: ['recent-api-errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_logs')
        .select('*')
        .eq('status', 'error')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data;
    }
  });
  
  const COLORS = ['#2ECC71', '#3498DB', '#F1C40F', '#E74C3C'];
  
  const formatNumber = (num: number) => {
    return num?.toLocaleString('en-US') || '0';
  };
  
  const formatCurrency = (num: number) => {
    return `$${(num || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };
  
  const handleQuickAction = (action: string) => {
    toast({
      description: `${action} functionality will be implemented soon.`,
    });
  };

  const typedStats = stats as unknown as DashboardStats;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading dashboard data</AlertTitle>
          <AlertDescription>
            {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-chatgpt-primary/10">
            <LayoutDashboard className="h-6 w-6 text-chatgpt-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/products">
          <Button className="bg-chatgpt-primary hover:bg-chatgpt-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
        
        <Link to="/admin/orders">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Orders
          </Button>
        </Link>
        
        <Link to="/admin/users">
          <Button variant="outline">
            <User className="mr-2 h-4 w-4" />
            User Management
          </Button>
        </Link>
        
        <Link to="/admin/api-monitoring">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            API Monitoring
          </Button>
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={formatNumber(typedStats?.userStats?.total || 0)}
          icon={<Users className="h-5 w-5" />}
          description={`+${formatNumber(typedStats?.userStats?.new || 0)} new`}
          percentChange={typedStats?.percentChanges?.userGrowth || 0}
          trend={typedStats?.percentChanges?.userGrowth > 0 ? 'up' : typedStats?.percentChanges?.userGrowth < 0 ? 'down' : 'neutral'}
        />
        
        <StatCard
          title="Total Orders"
          value={formatNumber(typedStats?.orderStats?.total || 0)}
          icon={<ShoppingCart className="h-5 w-5" />}
          percentChange={typedStats?.percentChanges?.orderCount || 0}
          trend={typedStats?.percentChanges?.orderCount > 0 ? 'up' : typedStats?.percentChanges?.orderCount < 0 ? 'down' : 'neutral'}
          description="from previous period"
        />
        
        <StatCard
          title="Total Revenue"
          value={formatCurrency(typedStats?.orderStats?.revenue || 0)}
          icon={<DollarSign className="h-5 w-5" />}
          percentChange={typedStats?.percentChanges?.revenue || 0}
          trend={typedStats?.percentChanges?.revenue > 0 ? 'up' : typedStats?.percentChanges?.revenue < 0 ? 'down' : 'neutral'}
          description="from previous period"
        />
        
        <StatCard
          title="Products in Stock"
          value={formatNumber(typedStats?.productStats?.inStock || 0)}
          icon={<Package className="h-5 w-5" />}
          description={`${formatNumber(typedStats?.productStats?.lowStock || 0)} low stock`}
          percentChange={typedStats?.percentChanges?.productGrowth || 0}
          trend={typedStats?.percentChanges?.productGrowth > 0 ? 'up' : typedStats?.percentChanges?.productGrowth < 0 ? 'down' : 'neutral'}
        />
      </div>
      
      {/* Alerts */}
      {(lowStockProducts?.length || apiErrors?.length) ? (
        <div className="space-y-4">
          {lowStockProducts?.length ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Low stock products</AlertTitle>
              <AlertDescription>
                {lowStockProducts.length} product(s) are running low on inventory.
              </AlertDescription>
            </Alert>
          ) : null}
          
          {apiErrors?.length ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>API Issues Detected</AlertTitle>
              <AlertDescription>
                There have been {apiErrors.length} API errors recently. Check the API monitoring page.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      ) : null}
      
      {/* Revenue Chart */}
      <Tabs defaultValue={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sales Overview</h2>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="12months">12 Months</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={timeRange} className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={typedStats?.salesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#19C37D" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#19C37D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Revenue"
                    stroke="#19C37D" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Charts and Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Orders by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={typedStats?.categoryData || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Orders" fill="#19C37D" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typedStats?.recentActivity?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                typedStats?.recentActivity?.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="text-right">
                      <p 
                        className={`text-xs px-2 py-1 rounded-full ${
                          activity.type === 'order' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                          activity.type === 'user' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}
                      >
                        {activity.type}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {/* Show more link if there are activities */}
              {typedStats?.recentActivity?.length > 0 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" className="text-chatgpt-primary hover:text-chatgpt-primary/90">
                    View all activity
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Order Status and Recent Orders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent orders</p>
              ) : (
                stats?.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.profiles?.username || order.profiles?.email}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${Number(order.total_amount).toFixed(2)}</p>
                      <p className={`text-xs ${
                        order.status === 'completed' ? 'text-green-500' : 
                        order.status === 'failed' ? 'text-red-500' : 
                        'text-yellow-500'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats?.orderStats?.completed || 0 },
                    { name: 'Pending', value: stats?.orderStats?.pending || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#19C37D" />
                  <Cell fill="#F1C40F" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-4 mt-4">
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm text-muted-foreground mr-auto">Completed</span>
                <span className="font-medium">{formatNumber(stats?.orderStats?.completed || 0)}</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                <span className="text-sm text-muted-foreground mr-auto">Pending</span>
                <span className="font-medium">{formatNumber(stats?.orderStats?.pending || 0)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-auto">Total</span>
                  <span className="font-medium">{formatNumber(stats?.orderStats?.total || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
