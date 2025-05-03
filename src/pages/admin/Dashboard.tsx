
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { DashboardOverview } from '@/components/admin/dashboard/DashboardOverview';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRange } from "react-day-picker";
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Download, LineChart, RefreshCcw } from 'lucide-react';

interface OrderCount {
  date: string;
  count: number;
}

interface RevenueData {
  date: string;
  amount: number;
}

interface PaymentMethodData {
  method: string;
  amount: number;
}

interface CategoryStockData {
  category_name: string;
  stock_count: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  conversionRate: number;
  totalOrders: number;
  totalDepositAmount: number;
  totalDeposits: number;
  averageOrderValue: number;
  orderCountByDay: OrderCount[];
  revenueByDay: RevenueData[];
  paymentMethods: PaymentMethodData[];
  categoryStock: CategoryStockData[];
  revenueChartData: ChartData[];
  orderChartData: ChartData[];
  paymentMethodData: ChartData[];
  productCategoryData: ChartData[];
}

const Dashboard: React.FC = () => {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: dashboardStats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard', date?.from, date?.to],
    queryFn: async () => {
      const fromDate = date?.from ? startOfDay(date.from) : subDays(new Date(), 30);
      const toDate = date?.to ? endOfDay(date.to) : new Date();

      // Get user stats
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Get orders in date range
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, user_id')
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString());

      if (ordersError) throw ordersError;

      // Get deposits in date range
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('id, created_at, amount, payment_method, status')
        .eq('status', 'completed')
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString());

      if (depositsError) throw depositsError;

      // Recent user data
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, username, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Recent order data
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          total_amount, 
          status, 
          user_id, 
          profiles:user_id (username, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get stock by category
      const { data: stockData } = await supabase
        .from('products')
        .select(`
          id, 
          stock_quantity,
          categories:category_id (id, name)
        `)
        .order('stock_quantity', { ascending: false });

      // Calculate order counts by day
      const ordersByDayMap = new Map<string, number>();
      const revenueByDayMap = new Map<string, number>();
      
      ordersData?.forEach(order => {
        const day = format(new Date(order.created_at), 'yyyy-MM-dd');
        ordersByDayMap.set(day, (ordersByDayMap.get(day) || 0) + 1);
        revenueByDayMap.set(day, (revenueByDayMap.get(day) || 0) + (order.total_amount || 0));
      });

      // Calculate payment methods
      const paymentMethodsMap = new Map<string, number>();
      depositsData?.forEach(deposit => {
        const method = deposit.payment_method || 'Unknown';
        paymentMethodsMap.set(method, (paymentMethodsMap.get(method) || 0) + (deposit.amount || 0));
      });

      // Calculate category stock
      const categoryStockMap = new Map<string, number>();
      stockData?.forEach(product => {
        if (product.categories) {
          const categoryName = product.categories.name || 'Uncategorized';
          categoryStockMap.set(categoryName, (categoryStockMap.get(categoryName) || 0) + (product.stock_quantity || 0));
        } else {
          categoryStockMap.set('Uncategorized', (categoryStockMap.get('Uncategorized') || 0) + (product.stock_quantity || 0));
        }
      });

      // Calculate active users (created order in last 30 days)
      const activeUserIds = new Set(ordersData?.map(order => order.user_id) || []);
      
      // Convert Map to Array for orderCountByDay
      const orderCountByDay: OrderCount[] = Array.from(ordersByDayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Convert Map to Array for revenueByDay
      const revenueByDay: RevenueData[] = Array.from(revenueByDayMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Convert Map to Array for paymentMethods
      const paymentMethods: PaymentMethodData[] = Array.from(paymentMethodsMap.entries())
        .map(([method, amount]) => ({ method, amount }))
        .sort((a, b) => b.amount - a.amount);
      
      // Convert Map to Array for categoryStock
      const categoryStock: CategoryStockData[] = Array.from(categoryStockMap.entries())
        .map(([category_name, stock_count]) => ({ category_name, stock_count }))
        .sort((a, b) => b.stock_count - a.stock_count);

      // Transform for charts
      const revenueChartData = revenueByDay.map(item => ({
        name: format(new Date(item.date), 'MMM dd'),
        value: item.amount
      }));
      
      const orderChartData = orderCountByDay.map(item => ({
        name: format(new Date(item.date), 'MMM dd'),
        value: item.count
      }));
      
      const paymentMethodData = paymentMethods.map(item => ({
        name: item.method.charAt(0).toUpperCase() + item.method.slice(1),
        value: item.amount
      }));
      
      const productCategoryData = categoryStock.map(item => ({
        name: item.category_name,
        value: item.stock_count
      }));

      return {
        totalUsers: usersData?.length || 0,
        activeUsers: activeUserIds.size,
        conversionRate: usersData?.length ? Math.round((activeUserIds.size / usersData.length) * 100) : 0,
        totalOrders: ordersData?.length || 0,
        totalDepositAmount: depositsData?.reduce((sum, deposit) => sum + (deposit.amount || 0), 0) || 0,
        totalDeposits: depositsData?.length || 0,
        averageOrderValue: ordersData?.length ? 
          (ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0) / ordersData.length) : 0,
        orderCountByDay,
        revenueByDay,
        paymentMethods,
        categoryStock,
        revenueChartData,
        orderChartData,
        paymentMethodData,
        productCategoryData
      };
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // Implementation for exporting dashboard data
    alert("Export functionality will be implemented here");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Heading 
          title="Dashboard" 
          description="Overview of your business performance"
        />
        <div className="flex flex-col md:flex-row gap-2">
          <DatePicker date={date} onSelect={setDate} align="end" />
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Dashboard Settings</SheetTitle>
                  <SheetDescription>
                    Customize your dashboard view
                  </SheetDescription>
                </SheetHeader>
                {/* Dashboard settings content */}
                <div className="py-6">
                  <p>Settings content will go here</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : dashboardStats ? (
        <DashboardOverview 
          statsData={{
            totalUsers: dashboardStats.totalUsers,
            totalOrders: dashboardStats.totalOrders,
            totalDeposits: dashboardStats.totalDeposits,
            totalDepositAmount: dashboardStats.totalDepositAmount,
            averageOrderValue: dashboardStats.averageOrderValue,
            activeUsers: dashboardStats.activeUsers,
            conversionRate: dashboardStats.conversionRate,
            paypalAmount: dashboardStats.paymentMethods.find(p => p.method.toLowerCase() === 'paypal')?.amount || 0,
            paypalDeposits: dashboardStats.paymentMethods.filter(p => p.method.toLowerCase() === 'paypal').length,
            usdtAmount: dashboardStats.paymentMethods.find(p => p.method.toLowerCase() === 'usdt')?.amount || 0,
            usdtDeposits: dashboardStats.paymentMethods.filter(p => p.method.toLowerCase() === 'usdt').length
          }}
          revenueChartData={dashboardStats.revenueChartData}
          ordersChartData={dashboardStats.orderChartData}
          paymentMethodData={dashboardStats.paymentMethodData}
          isLoading={isLoading}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
            <CardDescription>
              Unable to load dashboard data. Please try refreshing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh}>Refresh Dashboard</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Recent orders content */}
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Recent orders will be displayed here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Recent users content */}
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Recent users will be displayed here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
