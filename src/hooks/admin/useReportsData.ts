
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, formatISO } from 'date-fns';

export type DateRangeType = 'today' | '7days' | '30days' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ReportsData {
  revenueStats: {
    total: number;
    average: number;
    percentChange: number;
  };
  ordersStats: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
  };
  usersStats: {
    total: number;
    new: number;
  };
  revenueByDay: Array<{
    date: string;
    revenue: number;
  }>;
  ordersByDay: Array<{
    date: string;
    count: number;
  }>;
  productsByCategory: Array<{
    name: string;
    count: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export const useReportsData = () => {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('7days');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date()
  });

  // Generate date range based on type
  const getDateRange = (): DateRange => {
    const today = new Date();
    
    switch (dateRangeType) {
      case 'today':
        return {
          from: startOfDay(today),
          to: endOfDay(today)
        };
      case '7days':
        return {
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today)
        };
      case '30days':
        return {
          from: startOfDay(subDays(today, 29)),
          to: endOfDay(today)
        };
      case 'custom':
        return dateRange;
      default:
        return {
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today)
        };
    }
  };

  const currentRange = getDateRange();
  const fromDate = formatISO(currentRange.from);
  const toDate = formatISO(currentRange.to);

  // Fetch reports data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reports', fromDate, toDate],
    queryFn: async () => {
      // Fetch orders for the date range
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      if (ordersError) throw ordersError;

      // Fetch previous period orders for comparison
      const previousFromDate = formatISO(subDays(currentRange.from, (currentRange.to.getTime() - currentRange.from.getTime()) / (1000 * 60 * 60 * 24)));
      const previousToDate = formatISO(subDays(currentRange.from, 1));
      
      const { data: previousOrders, error: previousOrdersError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', previousFromDate)
        .lte('created_at', previousToDate);

      if (previousOrdersError) throw previousOrdersError;

      // Fetch users stats
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (usersError) throw usersError;

      const newUsers = users?.filter(user => {
        const createdAt = new Date(user.created_at);
        return createdAt >= currentRange.from && createdAt <= currentRange.to;
      });

      // Fetch order items for product stats
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          id, 
          quantity, 
          price, 
          total, 
          product_id, 
          order_id,
          products:product_id (
            id,
            name,
            category_id
          ),
          orders:order_id (
            created_at
          )
        `)
        .gte('orders.created_at', fromDate)
        .lte('orders.created_at', toDate);

      if (orderItemsError) throw orderItemsError;

      // Calculate revenue stats
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const previousRevenue = previousOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const percentChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      // Calculate orders by status
      const completedOrders = orders?.filter(order => order.status === 'completed').length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
      const failedOrders = orders?.filter(order => order.status === 'failed').length || 0;

      // Calculate revenue by day
      const revenueByDay: { [key: string]: number } = {};
      orders?.forEach(order => {
        const dateStr = format(new Date(order.created_at), 'yyyy-MM-dd');
        revenueByDay[dateStr] = (revenueByDay[dateStr] || 0) + Number(order.total_amount);
      });

      // Calculate orders by day
      const ordersByDay: { [key: string]: number } = {};
      orders?.forEach(order => {
        const dateStr = format(new Date(order.created_at), 'yyyy-MM-dd');
        ordersByDay[dateStr] = (ordersByDay[dateStr] || 0) + 1;
      });

      // Product stats by category
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) throw categoriesError;

      // Get product sales by category
      const productsByCategory = categories?.map(category => {
        const count = orderItems?.filter(item => 
          item.products?.category_id === category.id
        ).length || 0;
        
        return {
          name: category.name,
          count
        };
      }).filter(cat => cat.count > 0) || [];

      // Top products
      const productSales: { [key: string]: { count: number, revenue: number, name: string } } = {};
      orderItems?.forEach(item => {
        const productId = item.product_id;
        if (!productSales[productId]) {
          productSales[productId] = {
            count: 0,
            revenue: 0,
            name: item.products?.name || 'Unknown Product'
          };
        }
        productSales[productId].count += item.quantity;
        productSales[productId].revenue += Number(item.total);
      });

      const topProducts = Object.entries(productSales).map(([id, { count, revenue, name }]) => ({
        id,
        name,
        sales: count,
        revenue
      })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      return {
        revenueStats: {
          total: totalRevenue,
          average: orders?.length ? totalRevenue / orders.length : 0,
          percentChange
        },
        ordersStats: {
          total: orders?.length || 0,
          completed: completedOrders,
          pending: pendingOrders,
          failed: failedOrders
        },
        usersStats: {
          total: users?.length || 0,
          new: newUsers?.length || 0
        },
        revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
          date,
          revenue
        })).sort((a, b) => a.date.localeCompare(b.date)),
        ordersByDay: Object.entries(ordersByDay).map(([date, count]) => ({
          date,
          count
        })).sort((a, b) => a.date.localeCompare(b.date)),
        productsByCategory,
        topProducts
      } as ReportsData;
    }
  });

  const handleDateRangeTypeChange = (type: DateRangeType) => {
    setDateRangeType(type);
  };

  const handleCustomDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setDateRangeType('custom');
  };

  return {
    data,
    isLoading,
    dateRangeType,
    dateRange: currentRange,
    handleDateRangeTypeChange,
    handleCustomDateRangeChange,
    refetch
  };
};
