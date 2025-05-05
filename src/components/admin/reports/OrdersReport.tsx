
import React from 'react';
import { StatsData } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { BestSellingProducts } from './BestSellingProducts';
import { SkeletonChartLine, SkeletonTable } from '@/components/ui/skeleton';

interface OrdersReportProps {
  ordersChartData: any[];
  statsData?: StatsData;
  isLoading: boolean;
}

export const OrdersReport: React.FC<OrdersReportProps> = ({
  ordersChartData,
  statsData,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonChartLine />
          </CardContent>
        </Card>
        
        <div className="mt-6">
          <SkeletonTable rows={5} columns={4} />
        </div>
      </div>
    );
  }
  
  const totalOrders = statsData?.totalOrders || 0;
  const averageOrderValue = statsData?.averageOrderValue || 0;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <CardTitle>Orders Trend</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Total orders: {totalOrders} | Average value: {formatCurrency(averageOrderValue)}
              </div>
            </div>
            <Tabs defaultValue="line" className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="area">Area</TabsTrigger>
              </TabsList>
              <TabsContent value="line">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ordersChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'amount') return formatCurrency(Number(value));
                        return value;
                      }} />
                      <Legend />
                      <Line yAxisId="right" type="monotone" dataKey="amount" name="Order Amount" stroke="#19C37D" activeDot={{ r: 8 }} />
                      <Line yAxisId="left" type="monotone" dataKey="count" name="Order Count" stroke="#3498DB" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="area">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ordersChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'amount') return formatCurrency(Number(value));
                        return value;
                      }} />
                      <Legend />
                      <Area yAxisId="right" type="monotone" dataKey="amount" name="Order Amount" stroke="#19C37D" fill="#19C37D" fillOpacity={0.3} />
                      <Area yAxisId="left" type="monotone" dataKey="count" name="Order Count" stroke="#3498DB" fill="#3498DB" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Performance</h4>
              <p className="text-sm text-muted-foreground">
                {ordersChartData.length > 0 
                  ? `Orders are ${ordersChartData[ordersChartData.length - 1].count > ordersChartData[0].count ? 'increasing' : 'decreasing'} 
                     compared to the beginning of the period.`
                  : 'No data available for the selected period.'
                }
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Revenue Insights</h4>
              <p className="text-sm text-muted-foreground">
                {ordersChartData.length > 0 
                  ? `Revenue is ${ordersChartData[ordersChartData.length - 1].amount > ordersChartData[0].amount ? 'increasing' : 'decreasing'} 
                     compared to the beginning of the period.`
                  : 'No data available for the selected period.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <BestSellingProducts isLoading={false} />
    </div>
  );
};
