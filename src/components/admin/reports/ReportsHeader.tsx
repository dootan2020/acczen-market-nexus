
import { ReportFilters } from "./ReportFilters";
import { ExportButtons } from "./ExportButtons";
import { DateRange } from "react-day-picker";
import { StatsData } from "@/hooks/useReportsData";

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

export function ReportsHeader({
  dateRangeType,
  onDateRangeChange,
  dateRange,
  onDateRangePickerChange,
  onRefresh,
  isLoading,
  formattedDateRange,
  statsData,
  depositsChartData,
}: ReportsHeaderProps) {
  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Analyze user activity, deposits, and orders
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <ReportFilters 
            dateRangeType={dateRangeType}
            onDateRangeChange={onDateRangeChange}
            dateRange={dateRange}
            onDateRangePickerChange={onDateRangePickerChange}
            onRefresh={onRefresh}
            isLoading={isLoading}
          />
          
          <ExportButtons
            statsData={statsData}
            depositsChartData={depositsChartData}
            formattedDateRange={formattedDateRange}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      {formattedDateRange && (
        <div className="text-sm text-muted-foreground mb-4">
          Showing data for: <span className="font-medium">{formattedDateRange}</span>
        </div>
      )}
    </>
  );
}
