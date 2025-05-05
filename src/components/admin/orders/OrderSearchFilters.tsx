
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Search, Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { OrderStatus } from '@/types/orders';

interface OrderSearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  resetFilters: () => void;
}

export const OrderSearchFilters: React.FC<OrderSearchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  resetFilters
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Search & Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Order ID or Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        
        <DateRangePicker 
          date={dateRange}
          onDateChange={setDateRange}
          align="start"
          className="w-full"
        />
        
        <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
