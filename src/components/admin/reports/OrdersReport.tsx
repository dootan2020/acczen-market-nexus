
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataPagination } from "./DataPagination";

interface OrdersReportProps {
  ordersChartData: any[];
  isLoading: boolean;
  ordersData?: any[]; 
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalItems: number;
}

export function OrdersReport({ 
  ordersChartData, 
  isLoading,
  ordersData = [],
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalItems
}: OrdersReportProps) {
  // Add fallback for empty data to prevent chart errors
  const hasData = ordersChartData && ordersChartData.length > 0;

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'failed':
      case 'cancelled':
        return <Badge className="bg-red-500">{status}</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <div className="border rounded-md overflow-hidden">
                <Table className="whitespace-nowrap">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData && ordersData.length > 0 ? (
                      ordersData.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{order.id}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{order.user_id}</TableCell>
                          <TableCell>${order.total_amount?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">No order data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <DataPagination 
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalItems={totalItems}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
