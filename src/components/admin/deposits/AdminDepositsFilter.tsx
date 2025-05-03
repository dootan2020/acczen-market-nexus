
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminDepositsFilterProps {
  statusFilter: string | null;
  methodFilter: string | null;
  dateFilter: [Date | null, Date | null];
  searchQuery: string;
  onStatusChange: (status: string | null) => void;
  onMethodChange: (method: string | null) => void;
  onDateChange: (dates: [Date | null, Date | null]) => void;
  onSearchChange: (query: string) => void;
}

export function AdminDepositsFilter({
  statusFilter,
  methodFilter,
  dateFilter,
  searchQuery,
  onStatusChange,
  onMethodChange,
  onDateChange,
  onSearchChange
}: AdminDepositsFilterProps) {
  const clearFilters = () => {
    onStatusChange(null);
    onMethodChange(null);
    onDateChange([null, null]);
    onSearchChange('');
  };
  
  const hasFilters = statusFilter !== null || methodFilter !== null || dateFilter[0] !== null || searchQuery !== '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, username, or transaction ID"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {hasFilters && (
          <Button variant="outline" onClick={clearFilters} className="shrink-0">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Select
          value={statusFilter || ""}
          onValueChange={(value) => onStatusChange(value || null)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={methodFilter || ""}
          onValueChange={(value) => onMethodChange(value || null)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Methods</SelectItem>
            <SelectItem value="PayPal">PayPal</SelectItem>
            <SelectItem value="USDT">USDT</SelectItem>
          </SelectContent>
        </Select>
        
        <DateRangePicker 
          value={{
            from: dateFilter[0],
            to: dateFilter[1]
          }}
          onChange={(range) => {
            onDateChange([range.from, range.to]);
          }}
          className="w-full sm:flex-1"
          align="start"
        />
      </div>
    </div>
  );
};
