
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ResponsiveContainer
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');
  
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats', timeRange],
    queryFn: async () => {
      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at');
      
      // Calculate revenue
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      // Get orders count
      const ordersCount = orders?.length || 0;
      
      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id, 
          total_amount,
          status,
          created_at,
          profiles (id, email, username)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      // Generate sales data for the chart
      const salesData = generateSalesData(orders || [], timeRange);
      
      return {
        usersCount: usersCount || 0,
        totalRevenue,
        ordersCount,
        recentOrders: recentOrders || [],
        salesData
      };
    }
  });
  
  // Generate sales data for the chart based on time range
  const generateSalesData = (orders: any[], range: string) => {
    const now = new Date();
    let daysCount: number;
    let format: string;
    
    if (range === '7days') {
      daysCount = 7;
      format = 'day';
    } else if (range === '30days') {
      daysCount = 30;
      format = 'day';
    } else if (range === '12months') {
      daysCount = 12;
      format = 'month';
    } else {
      daysCount = 7;
      format = 'day';
    }
    
    const data = [];
    
    if (format === 'day') {
      for (let i = daysCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Filter orders for this day
        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          return orderDate === dateStr;
        });
        
        // Calculate revenue for the day
        const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        
        data.push({
          name: `${date.getMonth() + 1}/${date.getDate()}`,
          revenue: revenue.toFixed(2),
          orders: dayOrders.length
        });
      }
    } else {
      // Monthly format
      for (let i = daysCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Filter orders for this month
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          const orderMonthStr = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
          return orderMonthStr === monthStr;
        });
        
        // Calculate revenue for the month
        const revenue = monthOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        
        data.push({
          name: date.toLocaleString('default', { month: 'short' }),
          revenue: revenue.toFixed(2),
          orders: monthOrders.length
        });
      }
    }
    
    return data;
  };
  
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                12% 
              </span>
              {' '} from last month
            </p>
          </CardContent>
        </Card>
        
        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.usersCount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                4% 
              </span>
              {' '} from last month
            </p>
          </CardContent>
        </Card>
        
        {/* Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ordersCount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 inline-flex items-center">
                <ArrowDownRight className="mr-1 h-4 w-4" />
                2% 
              </span>
              {' '} from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="7days" value={timeRange} onValueChange={setTimeRange} className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sales Overview</h2>
          <TabsList>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="12months">12 Months</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="7days" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={stats?.salesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#2ECC71" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="30days" className="space-y-4">
          {/* Same chart but with 30days data */}
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={stats?.salesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#2ECC71" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="12months" className="space-y-4">
          {/* Same chart but with 12months data */}
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={stats?.salesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#2ECC71" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent orders</p>
              ) : (
                stats?.recentOrders.map((order: any) => (
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
        
        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Email Accounts', value: 4000 },
                  { name: 'Social Accounts', value: 3000 },
                  { name: 'Software Keys', value: 2000 },
                  { name: 'Digital Services', value: 2780 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3498DB" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
