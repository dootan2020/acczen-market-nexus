
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportOverview } from "./ReportOverview";
import { DepositsReport } from "./DepositsReport";
import { OrdersReport } from "./OrdersReport";
import BestSellingProducts from "./BestSellingProducts";
import { DateRange } from "@/components/ui/date-range-picker";
import { StatsData, ChartData } from "@/hooks/useReportsData";
import { DashboardOverview } from "@/components/admin/dashboard/DashboardOverview";
import { ReportsHeader } from "./ReportsHeader";

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
  ordersData: any[];
  productsData: any[];
  dateRangeType: string;
  onDateRangeChange: (value: string) => void;
  onDateRangePickerChange: (range: DateRange | undefined) => void;
  onRefresh: () => void;
  formattedDateRange: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalDeposits: number;
  totalOrders: number;
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
  ordersData,
  productsData,
  dateRangeType,
  onDateRangeChange,
  onDateRangePickerChange,
  onRefresh,
  formattedDateRange,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalDeposits,
  totalOrders
}: ReportsContentProps) {
  // Get the paginated data for the current tab
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    switch (activeTab) {
      case 'deposits':
        return depositsData?.slice(startIndex, endIndex) || [];
      case 'orders':
        return ordersData?.slice(startIndex, endIndex) || [];
      default:
        return [];
    }
  };

  const paginatedData = getPaginatedData();
  const totalCount = activeTab === 'deposits' ? totalDeposits : 
                     activeTab === 'orders' ? totalOrders : 0;
  
  return (
    <div className="space-y-6">
      <ReportsHeader
        dateRange={dateRange}
        onDateRangePickerChange={onDateRangePickerChange}
        onRefresh={onRefresh}
        isLoading={isLoading}
        formattedDateRange={formattedDateRange}
        statsData={statsData}
      />
    
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
            depositsData={paginatedData}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={totalDeposits}
          />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersReport
            ordersChartData={ordersChartData}
            isLoading={isLoading}
            ordersData={paginatedData}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={totalOrders}
          />
        </TabsContent>
        
        <TabsContent value="products">
          {dateRange && (
            <BestSellingProducts 
              dateRange={dateRange}
              productsData={productsData}
            />
          )}
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
}
