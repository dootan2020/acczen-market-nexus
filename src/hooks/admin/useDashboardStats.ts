
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types/dashboard";
import { ChartData, RevenueData, PaymentMethodData } from "@/types/reports";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Lấy thông tin users
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("*");
      
      if (usersError) throw usersError;
      
      const totalUsers = users.length;
      // Check if last_login_at exists before using it
      const activeUsers = users.filter(user => {
        // @ts-ignore - Some profiles might have last_login_at and some might not
        return user.last_login_at != null;
      }).length;
      
      // Lấy thông tin deposits
      const { data: deposits, error: depositsError } = await supabase
        .from("deposits")
        .select("*");
      
      if (depositsError) throw depositsError;
      
      const totalDeposits = deposits.length;
      const totalDepositAmount = deposits.reduce((sum, deposit) => {
        // Use amount property if it exists, otherwise fallback to 0
        const depositAmount = typeof deposit.amount === 'number' ? deposit.amount : 0;
        return sum + depositAmount;
      }, 0);
      
      // Lấy thông tin orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*");
      
      if (ordersError) throw ordersError;
      
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 
        ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / totalOrders
        : 0;
      
      const conversionRate = totalUsers > 0 
        ? (totalOrders / totalUsers) * 100
        : 0;
      
      // Xử lý dữ liệu cho biểu đồ
      // Order count by day
      const ordersByDay = new Map<string, number>();
      orders.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        ordersByDay.set(date, (ordersByDay.get(date) || 0) + 1);
      });
      
      const orderCountByDay = Array.from(ordersByDay.entries()).map(([date, count]) => ({
        date,
        count
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      // Deposit amount by day
      const depositsByDay = new Map<string, number>();
      deposits.forEach(deposit => {
        const date = new Date(deposit.created_at).toISOString().split('T')[0];
        // Handle case where deposit.amount might be undefined
        const amount = typeof deposit.amount === 'number' ? deposit.amount : 0;
        depositsByDay.set(date, (depositsByDay.get(date) || 0) + amount);
      });
      
      const depositAmountByDay = Array.from(depositsByDay.entries()).map(([date, amount]) => ({
        date,
        amount
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      // Revenue by day (using total_amount from orders)
      const revenueMap = new Map<string, number>();
      orders.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        revenueMap.set(date, (revenueMap.get(date) || 0) + (order.total_amount || 0));
      });
      
      // Convert map to array for revenueByDay
      const revenueByDay: RevenueData[] = Array.from(revenueMap.entries()).map(([date, amount]) => ({
        date,
        amount
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      // Chart data transformations
      const revenueChartData: ChartData[] = revenueByDay.map(item => ({
        name: item.date.slice(5), // MM-DD format
        value: item.amount
      }));
      
      const orderChartData: ChartData[] = orderCountByDay.map(item => ({
        name: item.date.slice(5), // MM-DD format
        value: item.count
      }));
      
      // Payment Method data
      const paymentMethods = new Map<string, number>();
      deposits.forEach(deposit => {
        const method = deposit.payment_method || 'other';
        // Handle case where deposit.amount might be undefined
        const amount = typeof deposit.amount === 'number' ? deposit.amount : 0;
        paymentMethods.set(method, (paymentMethods.get(method) || 0) + amount);
      });
      
      const paymentMethodData: PaymentMethodData[] = Array.from(paymentMethods.entries()).map(([method, amount]) => ({
        method,
        amount
      }));
      
      // Product category data
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, stock_quantity, category:categories(id, name)");
      
      if (productsError) throw productsError;
      
      const categoryCounts = new Map<string, number>();
      products.forEach(product => {
        // @ts-ignore - Product category might be structured differently
        const categoryName = product.category?.name || 'Uncategorized';
        categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
      });
      
      const productCategoryData: ChartData[] = Array.from(categoryCounts.entries()).map(([name, value]) => ({
        name,
        value
      }));

      // Add statistics for payment methods required by StatsData
      const paypalDeposits = deposits.filter(d => d.payment_method === 'PayPal').length;
      const usdtDeposits = deposits.filter(d => d.payment_method === 'USDT').length;
      
      const paypalAmount = deposits
        .filter(d => d.payment_method === 'PayPal')
        .reduce((sum, d) => {
          const amount = typeof d.amount === 'number' ? d.amount : 0;
          return sum + amount;
        }, 0);
      
      const usdtAmount = deposits
        .filter(d => d.payment_method === 'USDT')
        .reduce((sum, d) => {
          const amount = typeof d.amount === 'number' ? d.amount : 0;
          return sum + amount;
        }, 0);
      
      return {
        totalUsers,
        activeUsers,
        conversionRate,
        totalOrders,
        totalDepositAmount,
        totalDeposits,
        averageOrderValue,
        orderCountByDay,
        depositAmountByDay,
        revenueByDay,
        paymentMethodData,
        revenueChartData,
        orderChartData,
        productCategoryData,
        // Add these properties to satisfy the StatsData interface
        paypalDeposits,
        usdtDeposits,
        paypalAmount,
        usdtAmount
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
