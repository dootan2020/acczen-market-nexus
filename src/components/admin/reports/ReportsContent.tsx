
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportOverview } from "./ReportOverview";
import { DepositsReport } from "./DepositsReport";
import { OrdersReport } from "./OrdersReport";
import { BestSellingProducts } from "./BestSellingProducts";
import { DateRange } from "react-day-picker";
import { StatsData, ChartData } from "@/hooks/useReportsData";
import { DashboardOverview } from "@/components/admin/dashboard/DashboardOverview";

interface ReportsContentProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  statsData: StatsData;
  paymentMethodData: ChartData[];
  depositsChartData: any[];
  ordersChartData: any[];
  dateRange: DateRange | undefined;
  isLoading: boolean;
  depositsData: any[];
}

export function ReportsContent({
  activeTab,
  setActiveTab,
  statsData,
  paymentMethodData,
  depositsChartData,
  ordersChartData,
  dateRange,
  isLoading,
  depositsData,
}: ReportsContentProps) {
  return (
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
          depositsData={depositsData}
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
  );
}
