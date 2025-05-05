
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton, SkeletonChartPie, SkeletonStats } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { StatsData, ChartData } from "@/hooks/useReportsData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ReportOverviewProps {
  statsData: StatsData;
  paymentMethodData: ChartData[];
  isLoading: boolean;
}

const COLORS = ['#2ECC71', '#3498DB', '#F1C40F', '#E74C3C'];

export function ReportOverview({ statsData, paymentMethodData, isLoading }: ReportOverviewProps) {
  if (isLoading) {
    return (
      <>
        <SkeletonStats />
        
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <SkeletonChartPie />
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Payment Statistics</CardTitle>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-4 w-32 mt-1" />
                    <Skeleton className="h-2 w-full mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Key stats cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statsData.totalDepositAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {statsData.totalDeposits} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Avg. ${statsData.averageOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {statsData.activeUsers} active users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Users with orders or deposits
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Payment Methods Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution of deposits by payment method
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Payment Stats */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Payment Statistics</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detailed breakdown of payment methods
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">PayPal</span>
                  <span className="font-bold">${statsData.paypalAmount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {statsData.paypalDeposits} transactions
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${statsData.totalDepositAmount ? (statsData.paypalAmount / statsData.totalDepositAmount * 100) : 0}%` 
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">USDT</span>
                  <span className="font-bold">${statsData.usdtAmount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {statsData.usdtDeposits} transactions
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ 
                      width: `${statsData.totalDepositAmount ? (statsData.usdtAmount / statsData.totalDepositAmount * 100) : 0}%` 
                    }}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold">${statsData.totalDepositAmount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {statsData.totalDeposits} transactions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
