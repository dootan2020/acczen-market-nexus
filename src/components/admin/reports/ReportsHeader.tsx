
// Assuming this is the file that contains the issue with value property
import React from 'react';
import { DateRangeType, StatsData, DepositsChartData } from '@/types/reports';
import { DateRange } from 'react-day-picker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { TimeRangeSelector } from './TimeRangeSelector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { StatsSection } from './StatsSection';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportsHeaderProps {
  dateRangeType: DateRangeType;
  onDateRangeChange: (type: DateRangeType) => void;
  dateRange: DateRange;
  onDateRangePickerChange: (range: DateRange) => void;
  onRefresh: () => void;
  isLoading: boolean;
  formattedDateRange: string;
  statsData?: StatsData;
  depositsChartData?: DepositsChartData[];
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  dateRangeType,
  onDateRangeChange,
  dateRange,
  onDateRangePickerChange,
  onRefresh,
  isLoading,
  formattedDateRange,
  statsData,
  depositsChartData
}) => {
  // Calculate general stats from the data
  const calculateTrends = () => {
    if (!depositsChartData || depositsChartData.length < 2) return { deposits: 0, depositsPercentage: 0 };
    
    // Get the first and last items in the chart data
    const firstPeriod = depositsChartData[0];
    const lastPeriod = depositsChartData[depositsChartData.length - 1];
    
    // Safely extract values, defaulting to 0 if undefined
    const firstValue = firstPeriod && typeof firstPeriod.value !== 'undefined' ? firstPeriod.value : 0;
    const lastValue = lastPeriod && typeof lastPeriod.value !== 'undefined' ? lastPeriod.value : 0;
    
    // Calculate percentage change
    const depositsPercentage = firstValue !== 0 
      ? ((lastValue - firstValue) / firstValue) * 100 
      : lastValue > 0 ? 100 : 0;
    
    return {
      deposits: lastValue,
      depositsPercentage: depositsPercentage
    };
  };
  
  const trends = calculateTrends();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-auto justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formattedDateRange}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangePickerChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
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
      
      <TimeRangeSelector
        dateRangeType={dateRangeType}
        onDateRangeChange={onDateRangeChange}
      />
      
      {/* Stats Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <StatsSection
          data={statsData}
          depositTrend={trends.depositsPercentage}
        />
      )}
    </div>
  );
};
