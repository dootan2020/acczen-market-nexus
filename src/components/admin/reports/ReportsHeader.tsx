
import React from 'react';
import { CalendarRange } from 'lucide-react';
import { type DateRange, DateRangePicker } from '@/components/ui/date-range-picker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subDays, subMonths, startOfMonth, endOfMonth, startOfYear, format } from 'date-fns';

interface ReportsHeaderProps {
  dateRange: DateRange | undefined;
  setDateRange?: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onDateRangePickerChange?: (range: DateRange | undefined) => void;
  onRefresh?: () => void;
  isLoading: boolean;
  formattedDateRange?: string;
  statsData?: any;
}

export function ReportsHeader({ 
  dateRange, 
  setDateRange,
  onDateRangePickerChange,
  onRefresh,
  isLoading,
  formattedDateRange,
  statsData
}: ReportsHeaderProps) {
  const today = new Date();
  
  const handleRangeChange = (range: DateRange | undefined) => {
    if (setDateRange) {
      setDateRange(range);
    }
    if (onDateRangePickerChange) {
      onDateRangePickerChange(range);
    }
  };

  const presetRanges = [
    {
      name: 'Today',
      onClick: () => handleRangeChange({
        from: today,
        to: today
      })
    },
    {
      name: 'Yesterday',
      onClick: () => {
        const yesterday = subDays(today, 1);
        setDateRange({
          from: yesterday,
          to: yesterday
        });
      }
    },
    {
      name: 'Last 7 days',
      onClick: () => setDateRange({
        from: subDays(today, 6),
        to: today
      })
    },
    {
      name: 'Last 30 days',
      onClick: () => setDateRange({
        from: subDays(today, 29),
        to: today
      })
    },
    {
      name: 'This month',
      onClick: () => setDateRange({
        from: startOfMonth(today),
        to: today
      })
    },
    {
      name: 'Last month',
      onClick: () => {
        const lastMonth = subMonths(today, 1);
        setDateRange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        });
      }
    },
    {
      name: 'Year to date',
      onClick: () => setDateRange({
        from: startOfYear(today),
        to: today
      })
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRange size={16} />
            <span>
              {dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : 'Start date'} - {dateRange?.to ? format(dateRange.to, 'MMM d, yyyy') : 'End date'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="hidden sm:flex flex-wrap gap-1">
              {presetRanges.map((range) => (
                <Button 
                  key={range.name} 
                  variant="outline" 
                  size="sm" 
                  onClick={range.onClick} 
                  className="text-xs"
                >
                  {range.name}
                </Button>
              ))}
            </div>
            <DateRangePicker 
              value={{
                from: dateRange?.from as Date,
                to: dateRange?.to as Date || dateRange?.from as Date
              }} 
              onChange={handleRangeChange}
              className="h-9"
              align="end"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
