
import React, { useState } from 'react';
import { useReportsData } from "@/hooks/useReportsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TimeRangeSelector } from '@/components/admin/reports/TimeRangeSelector';
import { DashboardOverview } from '@/components/admin/dashboard/DashboardOverview';
import { 
  ReportOverview 
} from "@/components/admin/reports/ReportOverview";
import { 
  DepositsReport 
} from "@/components/admin/reports/DepositsReport";
import { 
  OrdersReport 
} from "@/components/admin/reports/OrdersReport";
import { 
  BestSellingProducts 
} from "@/components/admin/reports/BestSellingProducts";
import { RefreshCw } from "lucide-react";

const AdminReports = () => {
  const {
    dateRange,
    dateRangeType,
    handleDateRangeChange,
    handleDateRangePickerChange,
    formattedDateRange,
    statsData,
    depositsChartData,
    ordersChartData,
    paymentMethodData,
    isLoading,
    refetch
  } = useReportsData();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <TimeRangeSelector
            dateRangeType={dateRangeType}
            formattedDateRange={formattedDateRange}
            onDateRangeChange={handleDateRangeChange}
            dateRange={dateRange}
            onDateRangePickerChange={handleDateRangePickerChange}
          />
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
              <div className="text-2xl font-bold mt-1">${statsData.totalDepositAmount.toFixed(2)}</div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm font-medium text-muted-foreground">Orders</div>
              <div className="text-2xl font-bold mt-1">{statsData.totalOrders}</div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm font-medium text-muted-foreground">PayPal Deposits</div>
              <div className="text-2xl font-bold mt-1">${statsData.paypalAmount.toFixed(2)}</div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm font-medium text-muted-foreground">USDT Deposits</div>
              <div className="text-2xl font-bold mt-1">${statsData.usdtAmount.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <DashboardOverview
            statsData={statsData}
            revenueChartData={depositsChartData}
            ordersChartData={ordersChartData}
            paymentMethodData={paymentMethodData}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="deposits">
          <DepositsReport 
            depositsChartData={depositsChartData} 
            isLoading={isLoading}
            depositsData={depositsChartData}
          />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersReport
            ordersChartData={ordersChartData}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="products">
          <BestSellingProducts dateRange={dateRange} />
        </TabsContent>
        
        {isLoading && (
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-muted-foreground">Loading data, please wait...</p>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
};

// Helper function for dynamic class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default AdminReports;
