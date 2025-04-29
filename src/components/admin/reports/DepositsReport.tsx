
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
  // Ensure we have valid arrays to work with
  const safeDepositsChartData = Array.isArray(depositsChartData) ? depositsChartData : [];
  const safeDepositsData = Array.isArray(depositsData) ? depositsData : [];

  // Safely process data for the PayPal chart
  const processedPayPalData = !isLoading ? safeDepositsChartData.map(d => {
    // Ensure 'd' is a valid object and has a date property
    if (!d || typeof d !== 'object' || !d.date) {
      return { ...d, paypalAmount: 0 };
    }

    // Safely process PayPal deposits
    try {
      const paypalAmount = safeDepositsData
        .filter(deposit => 
          deposit && 
          typeof deposit === 'object' && 
          deposit.payment_method === 'PayPal' && 
          deposit.status === 'completed' &&
          deposit.created_at && // Ensure created_at exists
          format(new Date(deposit.created_at), 'yyyy-MM-dd') === d.date
        )
        .reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
      
      return { ...d, paypalAmount };
    } catch (error) {
      console.error('Error processing PayPal data:', error);
      return { ...d, paypalAmount: 0 };
    }
  }) : [];

  // Safely process data for the USDT chart
  const processedUsdtData = !isLoading ? safeDepositsChartData.map(d => {
    // Ensure 'd' is a valid object and has a date property
    if (!d || typeof d !== 'object' || !d.date) {
      return { ...d, usdtAmount: 0 };
    }

    // Safely process USDT deposits
    try {
      const usdtAmount = safeDepositsData
        .filter(deposit => 
          deposit && 
          typeof deposit === 'object' && 
          deposit.payment_method === 'USDT' && 
          deposit.status === 'completed' &&
          deposit.created_at && // Ensure created_at exists
          format(new Date(deposit.created_at), 'yyyy-MM-dd') === d.date
        )
        .reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
      
      return { ...d, usdtAmount };
    } catch (error) {
      console.error('Error processing USDT data:', error);
      return { ...d, usdtAmount: 0 };
    }
  }) : [];

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
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={safeDepositsChartData}
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
                  tickFormatter={(date) => {
                    try {
                      return date ? format(new Date(date), 'MMM dd') : '';
                    } catch (e) {
                      console.error('Date formatting error:', e);
                      return '';
                    }
                  }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  labelFormatter={(date) => {
                    try {
                      return date ? format(new Date(date), 'MMMM d, yyyy') : '';
                    } catch (e) {
                      console.error('Date formatting error:', e);
                      return '';
                    }
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2ECC71" 
                  name="Deposit Amount" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3498DB" 
                  name="Deposit Count"
                  yAxisId={1}
                  strokeWidth={2}
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
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={processedPayPalData}
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
                    tickFormatter={(date) => {
                      try {
                        return date ? format(new Date(date), 'MMM dd') : '';
                      } catch (e) {
                        return '';
                      }
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    labelFormatter={(date) => {
                      try {
                        return date ? format(new Date(date), 'MMMM d, yyyy') : '';
                      } catch (e) {
                        return '';
                      }
                    }}
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
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={processedUsdtData}
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
                    tickFormatter={(date) => {
                      try {
                        return date ? format(new Date(date), 'MMM dd') : '';
                      } catch (e) {
                        return '';
                      }
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    labelFormatter={(date) => {
                      try {
                        return date ? format(new Date(date), 'MMMM d, yyyy') : '';
                      } catch (e) {
                        return '';
                      }
                    }}
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
