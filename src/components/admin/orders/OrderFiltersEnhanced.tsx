
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface OrderFiltersEnhancedProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const OrderFiltersEnhanced = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange
}: OrderFiltersEnhancedProps) => {
  // Function to set predefined date ranges
  const setPresetRange = (preset: string) => {
    const today = new Date();
    const from = new Date();
    
    switch (preset) {
      case 'today':
        // Just today
        onDateRangeChange({ from: today, to: today });
        break;
      case 'week':
        // Last 7 days
        from.setDate(today.getDate() - 7);
        onDateRangeChange({ from, to: today });
        break;
      case 'month':
        // Last 30 days
        from.setDate(today.getDate() - 30);
        onDateRangeChange({ from, to: today });
        break;
      case 'clear':
        // Clear the date range
        onDateRangeChange(undefined);
        break;
    }
  };
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Search orders by ID, email or username..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter || 'all'}
          onValueChange={(value) => onStatusFilterChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <DateRangePicker 
            value={dateRange || { from: null, to: null }}
            onChange={onDateRangeChange}
            align="start"
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPresetRange('today')}
            className="whitespace-nowrap"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPresetRange('week')}
            className="whitespace-nowrap"
          >
            This Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPresetRange('month')}
            className="whitespace-nowrap"
          >
            This Month
          </Button>
          {dateRange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPresetRange('clear')}
              className="whitespace-nowrap"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
