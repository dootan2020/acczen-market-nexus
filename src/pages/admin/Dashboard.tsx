
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, Users, ShoppingCart, Package, 
  ArrowUpRight, ArrowDownRight,
  Calendar, Activity
} from 'lucide-react';

// Type definitions
interface DashboardStats {
  revenue: {
    total: number;
    previous: number;
    percentChange: number;
  };
  orders: {
    total: number;
    previous: number;
    percentChange: number;
    completed: number;
    pending: number;
  };
  users: {
    total: number;
    new: number;
    percentChange: number;
  };
  products: {
    total: number;
    outOfStock: number;
  };
  recentOrders: Array<{
    id: string;
    user: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

const COLORS = ['#19C37D', '#3498DB', '#F1C40F', '#E74C3C'];

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Get revenue stats
      const { data: revenue, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

      if (revenueError) throw revenueError;

      // Get previous month revenue for comparison
      const { data: previousRevenue, error: previousRevenueError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString())
        .lt('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

      if (previousRevenueError) throw previousRevenueError;

      // Get orders stats
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, created_at');

      if (ordersError) throw ordersError;

      // Get users stats
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (usersError) throw usersError;

      // Get products stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock_quantity');

      if (productsError) throw productsError;

      // Get recent orders with user info
      const { data: recentOrders, error: recentOrdersError } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, profiles:user_id(username, email)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentOrdersError) throw recentOrdersError;

      // Calculate stats
      const currentMonthRevenue = revenue?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const prevMonthRevenue = previousRevenue?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const revenueChange = prevMonthRevenue > 0 
        ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
        : 0;

      const currentMonthOrders = orders?.filter(order => 
        new Date(order.created_at) >= new Date(new Date().setMonth(new Date().getMonth() - 1))
      ).length || 0;
      
      const prevMonthOrders = orders?.filter(order => 
        new Date(order.created_at) >= new Date(new Date().setMonth(new Date().getMonth() - 2)) &&
        new Date(order.created_at) < new Date(new Date().setMonth(new Date().getMonth() - 1))
      ).length || 0;
      
      const ordersChange = prevMonthOrders > 0 
        ? ((currentMonthOrders - prevMonthOrders) / prevMonthOrders) * 100 
        : 0;

      const newUsers = users?.filter(user => 
        new Date(user.created_at) >= new Date(new Date().setMonth(new Date().getMonth() - 1))
      ).length || 0;
      
      const prevMonthUsers = users?.filter(user => 
        new Date(user.created_at) >= new Date(new Date().setMonth(new Date().getMonth() - 2)) &&
        new Date(user.created_at) < new Date(new Date().setMonth(new Date().getMonth() - 1))
      ).length || 0;
      
      const usersChange = prevMonthUsers > 0 
        ? ((newUsers - prevMonthUsers) / prevMonthUsers) * 100 
        : 0;

      // Format recent orders
      const formattedRecentOrders = recentOrders?.map(order => ({
        id: order.id,
        user: order.profiles?.username || order.profiles?.email || 'Unknown',
        amount: Number(order.total_amount),
        status: order.status,
        date: new Date(order.created_at).toLocaleDateString()
      })) || [];

      // Generate revenue chart data
      const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const revenueChartData = lastSevenDays.map(day => {
        const dayRevenue = revenue
          ?.filter(order => order.created_at.startsWith(day))
          .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        
        return {
          name: day.split('-').slice(1).join('/'), // Format as MM/DD
          value: dayRevenue
        };
      });

      return {
        revenue: {
          total: currentMonthRevenue,
          previous: prevMonthRevenue,
          percentChange: revenueChange
        },
        orders: {
          total: orders?.length || 0,
          previous: prevMonthOrders,
          percentChange: ordersChange,
          completed: orders?.filter(order => order.status === 'completed').length || 0,
          pending: orders?.filter(order => order.status === 'pending').length || 0
        },
        users: {
          total: users?.length || 0,
          new: newUsers,
          percentChange: usersChange
        },
        products: {
          total: products?.length || 0,
          outOfStock: products?.filter(product => product.stock_quantity <= 0).length || 0
        },
        recentOrders: formattedRecentOrders,
        revenueChartData,
        productCategoryData: [
          { name: 'Email Accounts', value: products?.filter(p => p.category_id === 'email').length || 25 },
          { name: 'Social Media', value: products?.filter(p => p.category_id === 'social').length || 15 },
          { name: 'Software', value: products?.filter(p => p.category_id === 'software').length || 35 },
          { name: 'Other', value: products?.filter(p => !['email', 'social', 'software'].includes(p.category_id || '')).length || 10 }
        ]
      } as DashboardStats;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Skeleton loading states
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 w-1/3 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-5 w-1/4 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.revenue.total || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {stats && stats.revenue.percentChange > 0 ? (
                <span className="text-green-500 flex items-center mr-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {stats.revenue.percentChange.toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center mr-1">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  {Math.abs((stats?.revenue.percentChange || 0)).toFixed(1)}%
                </span>
              )}
              <span>from previous month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.orders.total || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {stats && stats.orders.percentChange > 0 ? (
                <span className="text-green-500 flex items-center mr-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {stats.orders.percentChange.toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500 flex items-center mr-1">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  {Math.abs((stats?.orders.percentChange || 0)).toFixed(1)}%
                </span>
              )}
              <span>from previous month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats?.users.new || 0}
              </span>
              <span>new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.products.total || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-amber-500 flex items-center mr-1">
                <Activity className="h-3 w-3 mr-1" />
                {stats?.products.outOfStock || 0}
              </span>
              <span>out of stock</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different insights */}
      <Tabs defaultValue="revenue">
        <TabsList className="mb-6">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Revenue Overview - Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats?.revenueChartData || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#19C37D" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#19C37D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#19C37D"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.productCategoryData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats?.productCategoryData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Products']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Completed', value: stats?.orders.completed || 0 },
                      { name: 'Pending', value: stats?.orders.pending || 0 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Orders" fill="#19C37D" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">Order ID</th>
                  <th className="py-3 px-4 text-left font-medium">Customer</th>
                  <th className="py-3 px-4 text-left font-medium">Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders.map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.user}</td>
                    <td className="py-3 px-4">{formatCurrency(order.amount)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{order.date}</td>
                  </tr>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
