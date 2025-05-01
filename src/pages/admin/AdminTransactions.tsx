
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionFilters } from "@/components/admin/transactions/TransactionFilters";
import { TransactionsTable } from "@/components/admin/transactions/TransactionsTable";
import { TransactionsSummary } from "@/components/admin/transactions/TransactionsSummary";
import { TransactionDetailsDialog } from "@/components/admin/transactions/TransactionDetailsDialog";
import { DateRange } from "react-day-picker";
import { useTransactions } from "@/hooks/admin/useTransactions";

const AdminTransactions = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { 
    transactions, 
    isLoading, 
    summary,
    approveTransaction,
    rejectTransaction,
    refundTransaction
  } = useTransactions({
    searchQuery,
    typeFilter,
    statusFilter,
    methodFilter,
    dateRange
  });

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = async (transactionId: string, action: 'approve' | 'reject' | 'refund') => {
    try {
      if (action === 'approve') {
        await approveTransaction(transactionId);
      } else if (action === 'reject') {
        await rejectTransaction(transactionId);
      } else if (action === 'refund') {
        await refundTransaction(transactionId);
      }
    } catch (error) {
      console.error(`Error ${action}ing transaction:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Transactions Management</h1>
        <Select
          value={typeFilter || "all"}
          onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="purchase">Purchases</SelectItem>
            <SelectItem value="refund">Refunds</SelectItem>
            <SelectItem value="adjustment">Balance Adjustments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TransactionsSummary summary={summary} isLoading={isLoading} />
      
      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        methodFilter={methodFilter}
        onMethodFilterChange={setMethodFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      
      <TransactionsTable 
        transactions={transactions} 
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onStatusChange={handleStatusChange}
      />
      
      {selectedTransaction && (
        <TransactionDetailsDialog
          transactionId={selectedTransaction}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default AdminTransactions;
