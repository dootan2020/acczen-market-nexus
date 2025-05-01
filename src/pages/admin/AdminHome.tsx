
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package,
  BarChart3,
  Plus,
  Eye,
  UserCog,
  Activity,
  ArrowUp,
  ArrowDown,
  LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';

// Define interfaces for dashboard stats
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
  productStats: {
    total: number;
    inStock: number;
    outOfStock: number;
  };
  revenueData: Array<{
    date: string;
    amount: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'order' | 'user' | 'deposit';
    user: string;
    action: string;
    time: string;
    status: string;
  }>;
  growthStats: {
    userGrowth: number;
    orderGrowth: number;
    revenueGrowth: number;
    productGrowth: number;
  };
  timeRange: 'daily' | 'weekly' | 'monthly';
}

const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Fetch user stats
      const { data: users } = await supabase
        .from('profiles')
        .select('id, created_at');
      
      // Fetch order stats
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at');
      
      // Fetch deposit stats
      const { data: deposits } = await supabase
        .from('deposits')
        .select('id, amount, status, payment_method, created_at');
      
      // Fetch product stats
      const { data: products } = await supabase
        .from('products')
        .select('id, stock_quantity, category_id, created_at');
      
      // Fetch categories for category stats
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');
      
      // Calculate the date for "one month ago"
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      // Calculate user growth (new users in the last month)
      const newUsers = users?.filter(user => 
        new Date(user.created_at) > oneMonthAgo
      ).length || 0;
      
      // Get orders from the last month for growth calculation
      const recentOrders = orders?.filter(order => 
        new Date(order.created_at) > oneMonthAgo
      ) || [];
      
      // Calculate mock growth percentages
      const userGrowth = users && users.length > 0 ? (newUsers / users.length) * 100 : 0;
      const orderGrowth = 15.2; // Mock data
      const revenueGrowth = 23.1; // Mock data
      const productGrowth = 7.5; // Mock data
      
      // Calculate revenue data for the chart (last 7 days)
      const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });
      
      const revenueData = last7Days.map(date => {
        const dayOrders = orders?.filter(order => 
          order.created_at.startsWith(date) && 
          order.status === 'completed'
        ) || [];
        
        const amount = dayOrders.reduce((sum, order) => sum + order.total_amount, 0);
        
        return {
          date,
          amount
        };
      });
      
      // Generate category data for the pie chart
      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
      
      // Group orders by category
      const ordersByCategory: Record<string, number> = {};
      if (orders && products && categories) {
        // This would need to be expanded to actual logic based on your data model
        categories.forEach((category, index) => {
          ordersByCategory[category.id] = orders.length / (index + 1); 
        });
      }
      
      const categoryData = categories?.map((category, index) => ({
        name: category.name,
        value: ordersByCategory[category.id] || 0,
        color: COLORS[index % COLORS.length]
      })) || [];
      
      // Generate mock recent activity
      const recentActivity = [
        {
          id: '1',
          type: 'order' as const,
          user: 'john@example.com',
          action: 'Placed an order',
          time: '5 minutes ago',
          status: 'pending'
        },
        {
          id: '2',
          type: 'user' as const,
          user: 'sarah@example.com',
          action: 'Created account',
          time: '1 hour ago',
          status: 'completed'
        },
        {
          id: '3',
          type: 'deposit' as const,
          user: 'mike@example.com',
          action: 'Made a deposit',
          time: '3 hours ago',
          status: 'completed'
        },
        {
          id: '4',
          type: 'order' as const,
          user: 'dave@example.com',
          action: 'Placed an order',
          time: '5 hours ago',
          status: 'failed'
        },
      ];
      
      // Return aggregated stats
      return {
        userStats: {
          total: users?.length || 0,
          new: newUsers
        },
        orderStats: {
          total: orders?.length || 0,
          completed: orders?.filter(order => order.status === 'completed').length || 0,
          pending: orders?.filter(order => order.status === 'pending').length || 0,
          revenue: orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        },
        depositStats: {
          total: deposits?.length || 0,
          completed: deposits?.filter(deposit => deposit.status === 'completed').length || 0,
          amount: deposits?.reduce((sum, deposit) => sum + (deposit.amount || 0), 0) || 0,
          paypal: deposits?.filter(deposit => deposit.payment_method === 'paypal').length || 0,
          usdt: deposits?.filter(deposit => deposit.payment_method === 'usdt').length || 0
        },
        productStats: {
          total: products?.length || 0,
          inStock: products?.filter(product => (product.stock_quantity || 0) > 0).length || 0,
          outOfStock: products?.filter(product => (product.stock_quantity || 0) === 0).length || 0
        },
        revenueData,
        categoryData,
        recentActivity,
        growthStats: {
          userGrowth,
          orderGrowth,
          revenueGrowth,
          productGrowth
        },
        timeRange: 'weekly' as const
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

const AdminHome = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#19C37D]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-[#19C37D]" /> Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back to your admin dashboard</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/admin/reports">
              <BarChart3 className="h-4 w-4 mr-2" /> View Reports
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userStats.total.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats?.growthStats.userGrowth && stats.growthStats.userGrowth > 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="h-3 w-3" /> 
                  {stats.growthStats.userGrowth.toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="h-3 w-3" /> 
                  {stats?.growthStats.userGrowth ? Math.abs(stats.growthStats.userGrowth).toFixed(1) : '0'}%
                </span>
              )}
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.orderStats.total.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats?.growthStats.orderGrowth && stats.growthStats.orderGrowth > 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="h-3 w-3" /> 
                  {stats.growthStats.orderGrowth.toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="h-3 w-3" /> 
                  {stats?.growthStats.orderGrowth ? Math.abs(stats.growthStats.orderGrowth).toFixed(1) : '0'}%
                </span>
              )}
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.orderStats.revenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) || '0.00'}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats?.growthStats.revenueGrowth && stats.growthStats.revenueGrowth > 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="h-3 w-3" /> 
                  {stats.growthStats.revenueGrowth.toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="h-3 w-3" /> 
                  {stats?.growthStats.revenueGrowth ? Math.abs(stats.growthStats.revenueGrowth).toFixed(1) : '0'}%
                </span>
              )}
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.productStats.inStock.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats?.growthStats.productGrowth && stats.growthStats.productGrowth > 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="h-3 w-3" /> 
                  {stats.growthStats.productGrowth.toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="h-3 w-3" /> 
                  {stats?.growthStats.productGrowth ? Math.abs(stats.growthStats.productGrowth).toFixed(1) : '0'}%
                </span>
              )}
              <span className="ml-1">inventory change</span>
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.revenueData || []}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#19C37D" 
                    fill="#19C37D" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Orders by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categoryData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats?.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(0), 'Orders']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="border-none shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className={`rounded-full p-2 ${
                    activity.type === 'order' 
                      ? 'bg-blue-100 text-blue-600' 
                      : activity.type === 'user' 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'order' && <ShoppingBag className="h-4 w-4" />}
                    {activity.type === 'user' && <Users className="h-4 w-4" />}
                    {activity.type === 'deposit' && <DollarSign className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{activity.user}</h3>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                        : activity.status === 'pending' 
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {stats && stats.recentActivity.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No recent activity</p>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">View All Activity</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full flex items-center justify-start bg-[#19C37D] hover:bg-[#19C37D]/90" asChild>
              <Link to="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" /> Add New Product
              </Link>
            </Button>
            
            <Button className="w-full flex items-center justify-start" variant="outline" asChild>
              <Link to="/admin/orders">
                <Eye className="mr-2 h-4 w-4" /> View Orders
              </Link>
            </Button>
            
            <Button className="w-full flex items-center justify-start" variant="outline" asChild>
              <Link to="/admin/users">
                <UserCog className="mr-2 h-4 w-4" /> Manage Users
              </Link>
            </Button>
            
            <Button className="w-full flex items-center justify-start" variant="outline" asChild>
              <Link to="/admin/api-monitoring">
                <Activity className="mr-2 h-4 w-4" /> API Monitoring
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
