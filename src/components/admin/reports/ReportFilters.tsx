
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DATE_RANGES } from "@/hooks/useReportsData";
import { DateRangeType } from '@/types/reports';

interface ReportFiltersProps {
  dateRangeType: string;
  onDateRangeChange: (value: DateRangeType) => void;
  dateRange: DateRange | undefined;
  onDateRangePickerChange: (range: DateRange | undefined) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ReportFilters({
  dateRangeType,
  onDateRangeChange,
  dateRange,
  onDateRangePickerChange,
  onRefresh,
  isLoading
}: ReportFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
      <Select
        value={dateRangeType}
        onValueChange={(value: string) => onDateRangeChange(value as DateRangeType)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DATE_RANGES.TODAY}>Today</SelectItem>
          <SelectItem value={DATE_RANGES.LAST_7_DAYS}>Last 7 days</SelectItem>
          <SelectItem value={DATE_RANGES.LAST_30_DAYS}>Last 30 days</SelectItem>
          <SelectItem value={DATE_RANGES.THIS_MONTH}>This month</SelectItem>
          <SelectItem value={DATE_RANGES.CUSTOM}>Custom range</SelectItem>
        </SelectContent>
      </Select>
      
      {dateRangeType === DATE_RANGES.CUSTOM && (
        <DateRangePicker
          date={dateRange}
          onDateChange={onDateRangePickerChange}
        />
      )}
      
      <Button
        variant="outline"
        className="h-10"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
}
