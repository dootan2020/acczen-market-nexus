
import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Search, X } from "lucide-react";

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string | null;
  onTypeFilterChange: (value: string | null) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  methodFilter: string | null;
  onMethodFilterChange: (value: string | null) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const TransactionFilters = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  methodFilter,
  onMethodFilterChange,
  dateRange,
  onDateRangeChange
}: TransactionFiltersProps) => {
  const handleReset = () => {
    onSearchChange('');
    onTypeFilterChange(null);
    onStatusFilterChange(null);
    onMethodFilterChange(null);
    onDateRangeChange(undefined);
  };
  
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
    <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4">Advanced Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Search by Transaction ID or User email"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <DateRangePicker 
          value={dateRange}
          onChange={onDateRangeChange}
          className="w-full"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPresetRange('today')}
          className="text-chatgpt-primary border-chatgpt-primary/30 hover:bg-chatgpt-primary/10"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPresetRange('week')}
          className="text-chatgpt-primary border-chatgpt-primary/30 hover:bg-chatgpt-primary/10"
        >
          Last 7 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPresetRange('month')}
          className="text-chatgpt-primary border-chatgpt-primary/30 hover:bg-chatgpt-primary/10"
        >
          Last 30 Days
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          value={typeFilter || "all"}
          onValueChange={(value) => onTypeFilterChange(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
            <SelectItem value="adjustment">Balance Adjustment</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => onStatusFilterChange(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={methodFilter || "all"}
          onValueChange={(value) => onMethodFilterChange(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="crypto">Cryptocurrency</SelectItem>
            <SelectItem value="manual">Manual Adjustment</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleReset} 
          size="sm"
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" /> Clear Filters
        </Button>
      </div>
    </div>
  );
};
