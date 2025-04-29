
import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OrdersReportProps {
  ordersChartData: any[];
  isLoading: boolean;
}

export function OrdersReport({ ordersChartData, isLoading }: OrdersReportProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Add fallback for empty data to prevent chart errors
  const hasData = ordersChartData && ordersChartData.length > 0;
  
  // Fetch most recent orders
  const { data: recentOrders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          user:profiles(username, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Fetch a larger number for client-side pagination
        
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Calculate pagination
  const totalOrders = recentOrders?.length || 0;
  const totalPages = Math.ceil(totalOrders / pageSize);
  const startIndex = (page - 1) * pageSize;
  
  // Get current page orders
  const paginatedOrders = useMemo(() => {
    return recentOrders ? recentOrders.slice(startIndex, startIndex + pageSize) : [];
  }, [recentOrders, startIndex, pageSize]);
  
  // Handlers for pagination
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Trends</CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily order volume and revenue
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : !hasData ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">
              No order data available for the selected period
            </div>
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
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  label={{ value: 'Orders', angle: 90, position: 'insideRight' }}
                />
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
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || isOrdersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !recentOrders || recentOrders.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Order ID</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Customer</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-2">{order.id.substring(0, 8)}</td>
                      <td className="py-2">{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}</td>
                      <td className="py-2">{order.user?.username || 'Unknown'}</td>
                      <td className="py-2 text-right">
                        ${order.total_amount?.toFixed(2)}
                      </td>
                      <td className="py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {recentOrders && recentOrders.length > pageSize && (
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + pageSize, totalOrders)} of {totalOrders} orders
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrevPage} 
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNextPage} 
                disabled={page >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
