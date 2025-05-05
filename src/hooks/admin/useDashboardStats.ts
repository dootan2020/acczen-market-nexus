
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
      const activeUsers = users.filter(user => user.last_login_at).length;
      
      // Lấy thông tin deposits
      const { data: deposits, error: depositsError } = await supabase
        .from("deposits")
        .select("*");
      
      if (depositsError) throw depositsError;
      
      const totalDeposits = deposits.length;
      const totalDepositAmount = deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
      
      // Lấy thông tin orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*");
      
      if (ordersError) throw ordersError;
      
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 
        ? orders.reduce((sum, order) => sum + (order.amount || 0), 0) / totalOrders
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
        depositsByDay.set(date, (depositsByDay.get(date) || 0) + (deposit.amount || 0));
      });
      
      const depositAmountByDay = Array.from(depositsByDay.entries()).map(([date, amount]) => ({
        date,
        amount
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      // Revenue by day
      const revenueByDay = Array.from(ordersByDay.entries()).map(([date, _]) => {
        const ordersForDay = orders.filter(order => 
          new Date(order.created_at).toISOString().split('T')[0] === date
        );
        const amount = ordersForDay.reduce((sum, order) => sum + (order.amount || 0), 0);
        return {
          date,
          amount
        } as RevenueData;
      }).sort((a, b) => a.date.localeCompare(b.date));
      
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
      const paymentMethods = deposits.reduce((acc, deposit) => {
        const method = deposit.payment_method || 'other';
        acc.set(method, (acc.get(method) || 0) + (deposit.amount || 0));
        return acc;
      }, new Map<string, number>());
      
      const paymentMethodData: PaymentMethodData[] = Array.from(paymentMethods.entries()).map(([method, amount]) => ({
        method,
        amount
      }));
      
      // Product category data
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, stock_quantity, category:categories(id, name)");
      
      if (productsError) throw productsError;
      
      const categoryCounts = products.reduce((acc, product) => {
        const categoryName = product.category?.name || 'Uncategorized';
        acc.set(categoryName, (acc.get(categoryName) || 0) + 1);
        return acc;
      }, new Map<string, number>());
      
      const productCategoryData: ChartData[] = Array.from(categoryCounts.entries()).map(([name, value]) => ({
        name,
        value
      }));
      
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
        productCategoryData
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
