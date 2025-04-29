
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

interface OrdersReportProps {
  ordersChartData: any[];
  isLoading: boolean;
}

export function OrdersReport({ ordersChartData, isLoading }: OrdersReportProps) {
  // Add fallback for empty data to prevent chart errors
  const hasData = ordersChartData && ordersChartData.length > 0;
  
  return (
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
  );
}
