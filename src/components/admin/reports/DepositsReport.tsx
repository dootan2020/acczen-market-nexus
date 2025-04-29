
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
import { DayData } from '@/hooks/reports/types';

interface DepositsReportProps {
  depositsChartData: DayData[];
  depositsData?: any[];
  isLoading: boolean;
}

export function DepositsReport({ depositsChartData, depositsData, isLoading }: DepositsReportProps) {
  // Ensure we have valid data before rendering
  const hasValidData = Array.isArray(depositsChartData) && depositsChartData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily deposit volume and amount
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : !hasValidData ? (
          <div className="h-80 w-full flex items-center justify-center text-muted-foreground">
            No deposit data available for the selected period
          </div>
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
              <YAxis 
                yAxisId="left"
                orientation="left"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
              />
              <Tooltip 
                formatter={(value: number, name) => {
                  if (name === 'amount') return [`$${value.toFixed(2)}`, 'Amount'];
                  return [value, 'Deposits'];
                }}
                labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#2ECC71" 
                name="Amount" 
                yAxisId="left"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3498DB" 
                name="Deposit Count"
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
