
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdminDepositsFilterProps {
  statusFilter: string;
  methodFilter: string;
  dateFilter: string;
  searchQuery: string;
  onStatusChange: (value: string) => void;
  onMethodChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
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
  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Search by email, transaction ID or payment info..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={statusFilter || "all"}
          onValueChange={onStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={methodFilter || "all"}
          onValueChange={onMethodChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="PayPal">PayPal</SelectItem>
            <SelectItem value="USDT">USDT</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={dateFilter || "all"}
          onValueChange={onDateChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
