
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DateRangeType } from '@/types/reports';

interface TimeRangeSelectorProps {
  dateRangeType: string;
  formattedDateRange: string;
  onDateRangeChange: (value: DateRangeType) => void;
  dateRange?: DateRange;
  onDateRangePickerChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function TimeRangeSelector({
  dateRangeType,
  formattedDateRange,
  onDateRangeChange,
  dateRange,
  onDateRangePickerChange,
  className
}: TimeRangeSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={dateRangeType} onValueChange={(value: string) => onDateRangeChange(value as DateRangeType)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Time Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="7days">Last 7 Days</SelectItem>
          <SelectItem value="30days">Last 30 Days</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {dateRangeType === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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
      )}
      
      {dateRangeType !== 'custom' && (
        <div className="text-sm text-muted-foreground">
          {formattedDateRange}
        </div>
      )}
    </div>
  );
}
