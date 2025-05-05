
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { StatsData } from "@/types/reports";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { Card, CardContent } from "@/components/ui/card";

interface ReportsHeaderProps {
  dateRangeType: string;
  onDateRangeChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangePickerChange: (range: DateRange | undefined) => void;
  onRefresh: () => void;
  isLoading: boolean;
  formattedDateRange: string;
  statsData: StatsData;
  depositsChartData: any[];
}

// Helper function for dynamic class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function ReportsHeader({
  dateRangeType,
  onDateRangeChange,
  dateRange,
  onDateRangePickerChange,
  onRefresh,
  isLoading,
  formattedDateRange,
  statsData,
}: ReportsHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <TimeRangeSelector
            dateRangeType={dateRangeType}
            formattedDateRange={formattedDateRange}
            onDateRangeChange={onDateRangeChange}
            dateRange={dateRange}
            onDateRangePickerChange={onDateRangePickerChange}
          />
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>
      
      <Card>
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
    </div>
  );
}
