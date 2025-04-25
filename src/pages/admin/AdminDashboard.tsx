import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDashboardStats, TimeRange } from '@/hooks/useDashboardStats';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

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
    return num.toLocaleString('en-US');
  };
  
  const formatCurrency = (num: number) => {
    return `$${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };
  
  const renderPercentChange = (value: number) => {
    if (value > 0) {
      return (
        <span className="text-green-500 inline-flex items-center">
          <ArrowUpRight className="mr-1 h-4 w-4" />
          {value.toFixed(1)}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="text-red-500 inline-flex items-center">
          <ArrowDownRight className="mr-1 h-4 w-4" />
          {Math.abs(value).toFixed(1)}%
        </span>
      );
    }
    return <span>0%</span>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
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
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error loading dashboard data</AlertTitle>
          <AlertDescription>
            {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.orderStats.revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {renderPercentChange(stats?.percentChanges.revenue || 0)}
              {' '} from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.userStats.total || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                +{formatNumber(stats?.userStats.new || 0)}
              </span>
              {' '} new this period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.orderStats.total || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {renderPercentChange(stats?.percentChanges.orderCount || 0)}
              {' '} from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.depositStats.amount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {renderPercentChange(stats?.percentChanges.depositAmount || 0)}
              {' '} from previous period
            </p>
          </CardContent>
        </Card>
      </div>
      
      {(lowStockProducts?.length || apiErrors?.length) ? (
        <div className="space-y-4 mb-6">
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
      
      <Tabs defaultValue={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="mb-6">
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
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Revenue"
                    stroke="#2ECC71" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders vs Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  ...(stats?.ordersData || []).slice(-7).map(item => ({
                    name: item.name,
                    Orders: item.value
                  })),
                  ...(stats?.depositsData || []).slice(-7).map(item => ({
                    name: item.name,
                    Deposits: item.value
                  }))
                ].reduce((acc, curr) => {
                  const existingItem = acc.find(item => item.name === curr.name);
                  if (existingItem) {
                    return acc.map(item => 
                      item.name === curr.name 
                        ? { ...item, ...curr } 
                        : item
                    );
                  }
                  return [...acc, curr];
                }, [] as any[])
                .sort((a, b) => a.name.localeCompare(b.name))
              }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, undefined]} 
                />
                <Legend />
                <Bar 
                  dataKey="Orders" 
                  fill="#3498DB" 
                  name="Orders" 
                />
                <Bar 
                  dataKey="Deposits" 
                  fill="#2ECC71" 
                  name="Deposits" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'PayPal', value: stats?.depositStats.paypal || 0 },
                    { name: 'USDT', value: stats?.depositStats.usdt || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 w-full mt-2">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">PayPal</p>
                <p className="text-lg font-medium">{formatCurrency(stats?.depositStats.paypal || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">USDT</p>
                <p className="text-lg font-medium">{formatCurrency(stats?.depositStats.usdt || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats?.orderStats.completed || 0 },
                    { name: 'Pending', value: stats?.orderStats.pending || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#2ECC71" />
                  <Cell fill="#F1C40F" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm text-muted-foreground mr-auto">Completed</span>
                <span className="font-medium">{formatNumber(stats?.orderStats.completed || 0)}</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                <span className="text-sm text-muted-foreground mr-auto">Pending</span>
                <span className="font-medium">{formatNumber(stats?.orderStats.pending || 0)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-auto">Total</span>
                  <span className="font-medium">{formatNumber(stats?.orderStats.total || 0)}</span>
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
