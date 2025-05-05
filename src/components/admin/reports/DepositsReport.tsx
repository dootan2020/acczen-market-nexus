
import React from 'react';
import { DepositsChartData, StatsData } from '@/types/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, BarChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { DepositsListSection } from './DepositsListSection';
import { Deposit } from '@/types/deposits';
import { Skeleton } from '@/components/ui/skeleton';

interface DepositsReportProps {
  depositsChartData: DepositsChartData[];
  statsData?: StatsData;
  isLoading: boolean;
  depositsData: Deposit[];
}

export const DepositsReport: React.FC<DepositsReportProps> = ({
  depositsChartData,
  statsData,
  isLoading,
  depositsData
}) => {
  const [viewType, setViewType] = React.useState<'chart' | 'list'>('chart');
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const totalDepositAmount = statsData?.totalDepositAmount || 0;
  const totalDeposits = statsData?.totalDeposits || 0;
  const paypalAmount = statsData?.paypalAmount || 0;
  const usdtAmount = statsData?.usdtAmount || 0;
  const paypalPercentage = totalDepositAmount > 0 ? (paypalAmount / totalDepositAmount) * 100 : 0;
  const usdtPercentage = totalDepositAmount > 0 ? (usdtAmount / totalDepositAmount) * 100 : 0;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Deposits Overview</CardTitle>
              <CardDescription>
                Total deposits: {totalDeposits} | Amount: {formatCurrency(totalDepositAmount)}
              </CardDescription>
            </div>
            <Tabs defaultValue="bar" className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bar">Bar</TabsTrigger>
                <TabsTrigger value="area">Area</TabsTrigger>
              </TabsList>
              <TabsContent value="bar">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={depositsChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="amount" name="Deposit Amount" fill="#3498DB" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="area">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={depositsChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Area type="monotone" dataKey="amount" name="Deposit Amount" stroke="#3498DB" fill="#3498DB" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">PayPal Deposits</h4>
              <div className="flex items-center gap-2">
                <div className="text-xl font-semibold">{formatCurrency(paypalAmount)}</div>
                <div className="text-sm text-muted-foreground">({paypalPercentage.toFixed(1)}%)</div>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${paypalPercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">USDT Deposits</h4>
              <div className="flex items-center gap-2">
                <div className="text-xl font-semibold">{formatCurrency(usdtAmount)}</div>
                <div className="text-sm text-muted-foreground">({usdtPercentage.toFixed(1)}%)</div>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${usdtPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DepositsListSection deposits={depositsData} isLoading={isLoading} />
    </div>
  );
};
