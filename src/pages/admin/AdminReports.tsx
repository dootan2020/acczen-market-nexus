
import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfToday, endOfToday, endOfMonth, startOfMonth, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, CreditCard, Users, ShoppingBag, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface StatsData {
  totalDeposits: number;
  totalDepositAmount: number;
  totalOrders: number;
  averageOrderValue: number;
  totalUsers: number;
  activeUsers: number;
  paypalDeposits: number;
  usdtDeposits: number;
  paypalAmount: number;
  usdtAmount: number;
  conversionRate: number;
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#2ECC71', '#3498DB', '#F1C40F', '#E74C3C'];

// Pre-defined date ranges
const DATE_RANGES = {
  TODAY: 'today',
  LAST_7_DAYS: '7days',
  LAST_30_DAYS: '30days',
  THIS_MONTH: 'month',
  CUSTOM: 'custom',
};

const AdminReports = () => {
  // State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [dateRangeType, setDateRangeType] = useState(DATE_RANGES.LAST_30_DAYS);
  const [activeTab, setActiveTab] = useState('overview');

  // Update date range based on selection
  const handleDateRangeChange = (value: string) => {
    setDateRangeType(value);
    
    const today = new Date();
    switch (value) {
      case DATE_RANGES.TODAY:
        setDateRange({
          from: startOfToday(),
          to: endOfToday(),
        });
        break;
      case DATE_RANGES.LAST_7_DAYS:
        setDateRange({
          from: subDays(today, 7),
          to: today,
        });
        break;
      case DATE_RANGES.LAST_30_DAYS:
        setDateRange({
          from: subDays(today, 30),
          to: today,
        });
        break;
      case DATE_RANGES.THIS_MONTH:
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today),
        });
        break;
      // For custom, do nothing as it's handled by the date picker component
    }
  };

  // Custom date range handler
  const handleDateRangePickerChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setDateRangeType(DATE_RANGES.CUSTOM);
    }
  };

  // Format date range for display
  const formattedDateRange = useMemo(() => {
    if (!dateRange?.from) {
      return 'Select date range';
    }
    if (!dateRange.to) {
      return format(dateRange.from, 'PPP');
    }
    return `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`;
  }, [dateRange]);

  // Fetch deposits data
  const depositsQuery = useQuery({
    queryKey: ['admin-reports-deposits', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .gte('created_at', dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '2000-01-01')
        .lte('created_at', dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  // Fetch orders data
  const ordersQuery = useQuery({
    queryKey: ['admin-reports-orders', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '2000-01-01')
        .lte('created_at', dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  // Fetch users data
  const usersQuery = useQuery({
    queryKey: ['admin-reports-users', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Process data for stats
  const statsData: StatsData = useMemo(() => {
    const deposits = depositsQuery.data || [];
    const orders = ordersQuery.data || [];
    const users = usersQuery.data || [];
    
    // Filter completed deposits
    const completedDeposits = deposits.filter(d => d.status === 'completed');
    
    // Calculate PayPal vs USDT stats
    const paypalDeposits = completedDeposits.filter(d => d.payment_method === 'PayPal');
    const usdtDeposits = completedDeposits.filter(d => d.payment_method === 'USDT');
    
    const paypalAmount = paypalDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const usdtAmount = usdtDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalDepositAmount = paypalAmount + usdtAmount;
    
    // User and conversion stats
    const activeUsers = users.filter(u => {
      const hasOrder = orders.some(o => o.user_id === u.id);
      const hasDeposit = deposits.some(d => d.user_id === u.id);
      return hasOrder || hasDeposit;
    });
    
    const conversionRate = users.length > 0 
      ? (activeUsers.length / users.length * 100).toFixed(1)
      : 0;
    
    return {
      totalDeposits: completedDeposits.length,
      totalDepositAmount,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length
        : 0,
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      paypalDeposits: paypalDeposits.length,
      usdtDeposits: usdtDeposits.length,
      paypalAmount,
      usdtAmount,
      conversionRate: parseFloat(conversionRate as string)
    };
  }, [depositsQuery.data, ordersQuery.data, usersQuery.data]);

  // Prepare data for charts
  const depositsChartData = useMemo(() => {
    const deposits = depositsQuery.data || [];
    if (!dateRange?.from || !dateRange?.to) return [];
    
    // Group deposits by day
    const depositsByDay = deposits.reduce((acc: Record<string, {date: string, amount: number, count: number}>, deposit) => {
      const date = format(new Date(deposit.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 };
      }
      
      if (deposit.status === 'completed') {
        acc[date].amount += deposit.amount || 0;
        acc[date].count += 1;
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(depositsByDay).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [depositsQuery.data, dateRange]);

  const ordersChartData = useMemo(() => {
    const orders = ordersQuery.data || [];
    if (!dateRange?.from || !dateRange?.to) return [];
    
    // Group orders by day
    const ordersByDay = orders.reduce((acc: Record<string, {date: string, amount: number, count: number}>, order) => {
      const date = format(new Date(order.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 };
      }
      
      acc[date].amount += order.total_amount || 0;
      acc[date].count += 1;
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(ordersByDay).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [ordersQuery.data, dateRange]);

  // Payment method distribution chart data
  const paymentMethodData = useMemo((): ChartData[] => [
    { name: 'PayPal', value: statsData.paypalAmount },
    { name: 'USDT', value: statsData.usdtAmount },
  ], [statsData]);

  // Loading state
  const isLoading = depositsQuery.isLoading || ordersQuery.isLoading || usersQuery.isLoading;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Analyze user activity, deposits, and orders
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <Select
            value={dateRangeType}
            onValueChange={handleDateRangeChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DATE_RANGES.TODAY}>Today</SelectItem>
              <SelectItem value={DATE_RANGES.LAST_7_DAYS}>Last 7 days</SelectItem>
              <SelectItem value={DATE_RANGES.LAST_30_DAYS}>Last 30 days</SelectItem>
              <SelectItem value={DATE_RANGES.THIS_MONTH}>This month</SelectItem>
              <SelectItem value={DATE_RANGES.CUSTOM}>Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRangeType === DATE_RANGES.CUSTOM && (
            <DatePickerWithRange
              date={dateRange}
              onChange={handleDateRangePickerChange}
            />
          )}
          
          <Button
            variant="outline"
            className="h-10"
            onClick={() => {
              depositsQuery.refetch();
              ordersQuery.refetch();
              usersQuery.refetch();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {formattedDateRange && (
        <div className="text-sm text-muted-foreground mb-4">
          Showing data for: <span className="font-medium">{formattedDateRange}</span>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Key stats cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">${statsData.totalDepositAmount.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {statsData.totalDeposits} transactions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{statsData.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      Avg. ${statsData.averageOrderValue.toFixed(2)}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{statsData.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {statsData.activeUsers} active users
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{statsData.conversionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Users with orders or deposits
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {/* Payment Methods Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of deposits by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            {/* Payment Stats */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Payment Statistics</CardTitle>
                <CardDescription>Detailed breakdown of payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">PayPal</span>
                        <span className="font-bold">${statsData.paypalAmount.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {statsData.paypalDeposits} transactions
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ 
                            width: `${statsData.totalDepositAmount ? (statsData.paypalAmount / statsData.totalDepositAmount * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">USDT</span>
                        <span className="font-bold">${statsData.usdtAmount.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {statsData.usdtDeposits} transactions
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ 
                            width: `${statsData.totalDepositAmount ? (statsData.usdtAmount / statsData.totalDepositAmount * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total</span>
                        <span className="font-bold">${statsData.totalDepositAmount.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {statsData.totalDeposits} transactions
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Trends</CardTitle>
              <CardDescription>Daily deposit amounts over selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={depositsChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                      labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#2ECC71" 
                      name="Deposit Amount" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3498DB" 
                      name="Deposit Count"
                      yAxisId={1}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>PayPal Deposits</CardTitle>
                <CardDescription>Transaction history and amounts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-60 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={depositsChartData.map(d => ({
                        ...d,
                        paypalAmount: (depositsQuery.data || [])
                          .filter(deposit => 
                            deposit.payment_method === 'PayPal' && 
                            deposit.status === 'completed' &&
                            format(new Date(deposit.created_at), 'yyyy-MM-dd') === d.date
                          )
                          .reduce((sum, d) => sum + (d.amount || 0), 0)
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                        labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                      />
                      <Legend />
                      <Bar 
                        dataKey="paypalAmount" 
                        fill="#2ECC71" 
                        name="PayPal Deposits"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>USDT Deposits</CardTitle>
                <CardDescription>Transaction history and amounts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-60 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={depositsChartData.map(d => ({
                        ...d,
                        usdtAmount: (depositsQuery.data || [])
                          .filter(deposit => 
                            deposit.payment_method === 'USDT' && 
                            deposit.status === 'completed' &&
                            format(new Date(deposit.created_at), 'yyyy-MM-dd') === d.date
                          )
                          .reduce((sum, d) => sum + (d.amount || 0), 0)
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                        labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                      />
                      <Legend />
                      <Bar 
                        dataKey="usdtAmount" 
                        fill="#3498DB" 
                        name="USDT Deposits"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Trends</CardTitle>
              <CardDescription>Daily order volume and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={ordersChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value: number, name) => {
                        if (name === 'amount') return [`$${value.toFixed(2)}`, 'Revenue'];
                        return [value, 'Orders'];
                      }}
                      labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#E74C3C" 
                      name="Revenue" 
                      yAxisId="left"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#F1C40F" 
                      name="Order Count"
                      yAxisId="right"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
