
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DepositsReportProps {
  depositsChartData: any[];
  isLoading: boolean;
  depositsData: any[];
}

export function DepositsReport({ depositsChartData, isLoading, depositsData }: DepositsReportProps) {
  // Add fallback for empty data to prevent chart errors
  const hasData = depositsChartData && depositsChartData.length > 0;
  const hasDepositsData = depositsData && depositsData.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Deposit Trends</CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily deposit amounts over selected period
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : !hasData ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">
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
                  yAxisId="left"
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3498DB" 
                  name="Deposit Count"
                  strokeWidth={2}
                  yAxisId="right"
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
            <p className="text-sm text-muted-foreground">
              Transaction history and amounts
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-60 w-full" />
            ) : !hasData || !hasDepositsData ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground">
                No PayPal deposit data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={depositsChartData.map(d => ({
                    ...d,
                    paypalAmount: (depositsData || [])
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
            <p className="text-sm text-muted-foreground">
              Transaction history and amounts
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-60 w-full" />
            ) : !hasData || !hasDepositsData ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground">
                No USDT deposit data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={depositsChartData.map(d => ({
                    ...d,
                    usdtAmount: (depositsData || [])
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
    </>
  );
}
