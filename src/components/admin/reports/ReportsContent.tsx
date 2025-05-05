
import React, { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsSection } from './StatsSection';
import { StatsData, ChartData, DepositsChartData, OrdersChartData } from '@/types/reports';
import { RevenueChart } from './RevenueChart';
import { OrdersChart } from './OrdersChart';
import { PaymentMethodsChart } from './PaymentMethodsChart';
import { DepositsListSection } from './DepositsListSection';
import { Deposit } from '@/types/deposits';
import { DateRange } from 'react-day-picker';
import { Loader } from 'lucide-react';

interface ReportsContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  statsData: StatsData;
  paymentMethodData: ChartData[];
  depositsChartData: DepositsChartData[];
  ordersChartData: OrdersChartData[];
  dateRange: DateRange | undefined;
  isLoading: boolean;
  depositsData: Deposit[];
}

// Use React.memo to prevent unnecessary re-renders
export const ReportsContent = React.memo(({
  activeTab,
  setActiveTab,
  statsData,
  paymentMethodData,
  depositsChartData,
  ordersChartData,
  dateRange,
  isLoading,
  depositsData
}: ReportsContentProps) => {
  // Memoize empty state to avoid recreating it on each render
  const emptyState = useMemo(() => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-muted-foreground mb-4">No data available for the selected date range.</p>
    </div>
  ), []);

  // Determine if various sections have data to display
  const hasRevenueData = useMemo(() => depositsChartData && depositsChartData.length > 0, [depositsChartData]);
  const hasOrdersData = useMemo(() => ordersChartData && ordersChartData.length > 0, [ordersChartData]);
  const hasPaymentData = useMemo(() => paymentMethodData && paymentMethodData.length > 0, [paymentMethodData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="deposits">Deposits</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {hasRevenueData ? (
                <RevenueChart data={depositsChartData} />
              ) : emptyState}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Orders Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {hasOrdersData ? (
                <OrdersChart data={ordersChartData} />
              ) : emptyState}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              {hasPaymentData ? (
                <PaymentMethodsChart data={paymentMethodData} />
              ) : emptyState}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Stats Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsSection statsData={statsData} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="revenue">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {hasRevenueData ? (
              <RevenueChart data={depositsChartData} height={400} />
            ) : emptyState}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle>Orders Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {hasOrdersData ? (
              <OrdersChart data={ordersChartData} height={400} />
            ) : emptyState}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="deposits">
        <DepositsListSection deposits={depositsData} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
});

ReportsContent.displayName = 'ReportsContent';
