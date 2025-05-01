
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { format as formatDate, subDays, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export type TimeRange = '7days' | '30days' | '12months' | 'today' | 'week' | 'month';

export const useDashboardStats = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    
    switch (timeRange) {
      case 'today':
        return {
          from: startOfToday(),
          to: endOfToday(),
          format: 'hour'
        };
      case 'week':
        return {
          from: startOfWeek(now),
          to: endOfWeek(now),
          format: 'day'
        };
      case 'month':
        return {
          from: startOfMonth(now),
          to: endOfMonth(now),
          format: 'day'
        };
      case '7days':
        return {
          from: subDays(now, 7),
          to: now,
          format: 'day'
        };
      case '30days':
        return {
          from: subDays(now, 30),
          to: now,
          format: 'day'
        };
      case '12months':
        return {
          from: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
          to: now,
          format: 'month'
        };
      default:
        return {
          from: subDays(now, 7),
          to: now,
          format: 'day'
        };
    }
  };

  const dateRange = getDateRange();

  // Fetch dashboard statistics
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats', timeRange],
    queryFn: async () => {
      const fromDate = formatDate(dateRange.from, 'yyyy-MM-dd');
      const toDate = formatDate(dateRange.to, 'yyyy-MM-dd');
      
      // Get users data
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Get new users in the selected period
      const { data: newUsers, error: newUsersError } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', fromDate)
        .lte('created_at', toDate);
        
      if (newUsersError) throw newUsersError;
      
      // Get orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at
        `);
        
      if (ordersError) throw ordersError;
      
      // Get orders in the selected period
      const { data: periodOrders, error: periodOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate);
        
      if (periodOrdersError) throw periodOrdersError;
      
      // Get products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id, 
          name,
          stock_quantity,
          category_id
        `);
      
      if (productsError) throw productsError;
      
      // Get categories for category data
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');
      
      if (categoriesError) throw categoriesError;
      
      // Create recent activity data
      const recentActivity = [
        ...orders.slice(0, 3).map(order => ({
          id: `order-${order.id}`,
          title: `New order #${order.id}`,
          timestamp: order.created_at,
          type: 'order'
        })),
        ...newUsers.slice(0, 3).map(user => ({
          id: `user-${user.id}`,
          title: `New user registered: ${user.email || user.username || user.id}`,
          timestamp: user.created_at,
          type: 'user'
        }))
      ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
      
      // Calculate category data
      const categoryData = (categories || []).map(category => {
        const categoryOrders = orders.filter(order => {
          const productIds = (products || [])
            .filter(product => product.category_id === category.id)
            .map(product => product.id);
          
          return productIds.includes(order.id);
        });
        
        return {
          name: category.name,
          value: categoryOrders.length
        };
      });
      
      // Get deposits data
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select(`
          id,
          amount,
          status,
          created_at,
          payment_method
        `);
        
      if (depositsError) throw depositsError;
      
      // Get deposits in the selected period
      const { data: periodDeposits, error: periodDepositsError } = await supabase
        .from('deposits')
        .select(`
          id,
          amount,
          status,
          created_at,
          payment_method
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate);
        
      if (periodDepositsError) throw periodDepositsError;
      
      // Get recent orders for display
      const { data: recentOrders, error: recentOrdersError } = await supabase
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
        
      if (recentOrdersError) throw recentOrdersError;
      
      // Generate time series data for charts
      const salesData = generateTimeSeriesData({
        data: periodOrders || [], 
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        format: dateRange.format,
        getValue: (item) => Number(item.total_amount) || 0
      });
      
      const ordersData = generateTimeSeriesData({
        data: periodOrders || [],
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        format: dateRange.format,
        getValue: () => 1  // Count of orders
      });
      
      const depositsData = generateTimeSeriesData({
        data: periodDeposits || [],
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        format: dateRange.format,
        getValue: (item) => Number(item.amount) || 0
      });
      
      // Calculate statistics
      const userStats = {
        total: users?.length || 0,
        new: newUsers?.length || 0
      };
      
      const completedOrders = orders?.filter(o => o.status === 'completed') || [];
      const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
      
      const orderStats = {
        total: orders?.length || 0,
        completed: completedOrders.length,
        pending: pendingOrders.length,
        revenue: completedOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
      };
      
      const completedDeposits = deposits?.filter(d => d.status === 'completed') || [];
      
      const depositStats = {
        total: deposits?.length || 0,
        completed: completedDeposits.length,
        amount: completedDeposits.reduce((sum, deposit) => sum + Number(deposit.amount || 0), 0),
        paypal: completedDeposits
          .filter(d => d.payment_method === 'PayPal')
          .reduce((sum, deposit) => sum + Number(deposit.amount || 0), 0),
        usdt: completedDeposits
          .filter(d => d.payment_method === 'USDT')
          .reduce((sum, deposit) => sum + Number(deposit.amount || 0), 0)
      };
      
      // Add product stats
      const productStats = {
        total: products?.length || 0,
        inStock: products?.filter(p => Number(p.stock_quantity) > 0).length || 0,
        lowStock: products?.filter(p => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) < 5).length || 0
      };
      
      // Calculate percent changes from previous period
      const getPreviousPeriodData = async () => {
        const previousFromDate = formatDate(
          new Date(dateRange.from.getTime() - (dateRange.to.getTime() - dateRange.from.getTime())), 
          'yyyy-MM-dd'
        );
        const previousToDate = formatDate(
          new Date(dateRange.from.getTime() - 1),
          'yyyy-MM-dd'
        );
        
        // Get orders from previous period
        const { data: prevOrders } = await supabase
          .from('orders')
          .select('total_amount, status')
          .gte('created_at', previousFromDate)
          .lte('created_at', previousToDate);
          
        // Get deposits from previous period
        const { data: prevDeposits } = await supabase
          .from('deposits')
          .select('amount, status')
          .gte('created_at', previousFromDate)
          .lte('created_at', previousToDate);
          
        // Get users from previous period
        const { data: prevUsers } = await supabase
          .from('profiles')
          .select('id')
          .gte('created_at', previousFromDate)
          .lte('created_at', previousToDate);
          
        // Get products from previous period
        const { data: prevProducts } = await supabase
          .from('products')
          .select('id')
          .gte('created_at', previousFromDate)
          .lte('created_at', previousToDate);
          
        return {
          orders: prevOrders || [],
          deposits: prevDeposits || [],
          users: prevUsers || [],
          products: prevProducts || []
        };
      };
      
      const prevPeriodData = await getPreviousPeriodData();
      
      const prevCompletedOrders = prevPeriodData.orders.filter(o => o.status === 'completed');
      const prevCompletedDeposits = prevPeriodData.deposits.filter(d => d.status === 'completed');
      
      const prevPeriodStats = {
        newUsers: prevPeriodData.users.length,
        orderCount: prevPeriodData.orders.length,
        orderRevenue: prevCompletedOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
        depositAmount: prevCompletedDeposits.reduce((sum, deposit) => sum + Number(deposit.amount || 0), 0),
        productCount: prevPeriodData.products.length
      };
      
      // Calculate percent changes
      const getPercentChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
      
      const percentChanges = {
        newUsers: getPercentChange(userStats.new, prevPeriodStats.newUsers),
        orderCount: getPercentChange(periodOrders?.length || 0, prevPeriodData.orders.length),
        revenue: getPercentChange(
          periodOrders?.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
          prevPeriodStats.orderRevenue
        ),
        depositAmount: getPercentChange(
          periodDeposits?.filter(d => d.status === 'completed').reduce((sum, d) => sum + Number(d.amount || 0), 0),
          prevPeriodStats.depositAmount
        ),
        // Add the missing properties
        userGrowth: getPercentChange(userStats.new, prevPeriodStats.newUsers),
        productGrowth: getPercentChange(products?.length || 0, prevPeriodStats.productCount)
      };
      
      return {
        userStats,
        orderStats,
        depositStats,
        salesData,
        ordersData,
        depositsData,
        recentOrders,
        percentChanges,
        timeRange,
        recentActivity,
        categoryData,
        productStats
      };
    }
  });

  // Helper function to generate time series data
  function generateTimeSeriesData({
    data, 
    dateFrom, 
    dateTo, 
    format,
    getValue
  }: {
    data: any[],
    dateFrom: Date,
    dateTo: Date,
    format: string,
    getValue: (item: any) => number
  }) {
    const result: {name: string, value: number}[] = [];
    const dataMap: Record<string, number> = {};
    
    // Initialize data points based on format
    if (format === 'day') {
      // Generate days between dateFrom and dateTo
      const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24));
      for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(dateFrom);
        date.setDate(dateFrom.getDate() + i);
        const dateKey = formatDate(date, 'yyyy-MM-dd');
        dataMap[dateKey] = 0;
      }
    } else if (format === 'month') {
      // Generate months between dateFrom and dateTo
      const monthsDiff = (dateTo.getFullYear() - dateFrom.getFullYear()) * 12 + 
                         (dateTo.getMonth() - dateFrom.getMonth());
      for (let i = 0; i <= monthsDiff; i++) {
        const date = new Date(dateFrom);
        date.setMonth(dateFrom.getMonth() + i);
        const dateKey = formatDate(date, 'yyyy-MM');
        dataMap[dateKey] = 0;
      }
    } else if (format === 'hour') {
      // Generate hours for today
      for (let i = 0; i < 24; i++) {
        const date = new Date(dateFrom);
        date.setHours(i);
        const dateKey = formatDate(date, 'HH:00');
        dataMap[dateKey] = 0;
      }
    }
    
    // Aggregate data
    data.forEach(item => {
      const date = new Date(item.created_at);
      let dateKey;
      
      if (format === 'day') {
        dateKey = formatDate(date, 'yyyy-MM-dd');
      } else if (format === 'month') {
        dateKey = formatDate(date, 'yyyy-MM');
      } else if (format === 'hour') {
        dateKey = formatDate(date, 'HH:00');
      } else {
        return; // Unsupported format
      }
      
      if (dataMap.hasOwnProperty(dateKey)) {
        dataMap[dateKey] += getValue(item);
      }
    });
    
    // Convert to array format for charts
    Object.entries(dataMap).forEach(([key, value]) => {
      let displayKey = key;
      
      if (format === 'day') {
        displayKey = formatDate(new Date(key), 'MM/dd');
      } else if (format === 'month') {
        displayKey = formatDate(new Date(`${key}-01`), 'MMM yyyy');
      }
      
      result.push({
        name: displayKey,
        value
      });
    });
    
    return result;
  }

  return {
    data,
    isLoading,
    error,
    timeRange,
    setTimeRange,
  };
};
