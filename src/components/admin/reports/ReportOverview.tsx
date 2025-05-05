
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { StatsData, ChartData } from '@/types/reports';
import { formatCurrency } from '@/utils/formatters';
import { PaymentMethodsChart } from './PaymentMethodsChart';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportOverviewProps {
  statsData?: StatsData;
  paymentMethodData?: ChartData[];
  isLoading: boolean;
}

export const ReportOverview: React.FC<ReportOverviewProps> = ({
  statsData,
  paymentMethodData,
  isLoading
}) => {
  // Format payment method data for the chart
  const chartData = paymentMethodData || [];
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-40 w-40">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!statsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No statistics available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }
  
  const {
    totalOrders,
    totalDepositAmount,
    totalDeposits,
    totalUsers,
    activeUsers,
    conversionRate,
    averageOrderValue
  } = statsData;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Orders Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average value: {formatCurrency(averageOrderValue)}
            </p>
          </CardContent>
        </Card>
        
        {/* Deposits Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDepositAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Count: {totalDeposits} deposits
            </p>
          </CardContent>
        </Card>
        
        {/* Users Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active: {activeUsers} users
            </p>
          </CardContent>
        </Card>
        
        {/* Conversion Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <div className="flex items-center mt-1">
              {conversionRate > 5 ? (
                <span className="flex items-center text-xs text-green-500">
                  <ArrowUp className="w-3 h-3 mr-1" /> Good
                </span>
              ) : (
                <span className="flex items-center text-xs text-amber-500">
                  <ArrowDown className="w-3 h-3 mr-1" /> Needs improvement
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Average Order Value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per completed order
            </p>
          </CardContent>
        </Card>
        
        {/* Active Users Percentage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}% of total users
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment Methods Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentMethodsChart data={chartData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
