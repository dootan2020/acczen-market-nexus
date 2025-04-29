
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeposits } from "@/hooks/useDeposits";
import { Download, RefreshCw } from "lucide-react";
import { AdminDepositsFilter } from "@/components/admin/deposits/AdminDepositsFilter";
import { AdminDepositsList } from "@/components/admin/deposits/AdminDepositsList";

const AdminDeposits = () => {
  const { 
    filteredDeposits, 
    isLoading, 
    error, 
    refetch, 
    filters, 
    actions,
    isMutating 
  } = useDeposits();

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Deposits</h2>
            <p className="text-muted-foreground">{(error as Error).message}</p>
            <Button 
              onClick={() => refetch()}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Manage Deposits</CardTitle>
              <CardDescription>Process and manage user deposit transactions</CardDescription>
            </div>
            <Button 
              onClick={actions.exportToCSV} 
              variant="outline" 
              disabled={!filteredDeposits?.length}
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AdminDepositsFilter
            statusFilter={filters.statusFilter}
            methodFilter={filters.methodFilter}
            dateFilter={filters.dateFilter}
            searchQuery={filters.searchQuery}
            onStatusChange={filters.setStatusFilter}
            onMethodChange={filters.setMethodFilter}
            onDateChange={filters.setDateFilter}
            onSearchChange={filters.setSearchQuery}
          />

          <AdminDepositsList
            deposits={filteredDeposits || []}
            isLoading={isLoading}
            onApprove={actions.approve}
            onReject={actions.reject}
            isMutating={isMutating}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDeposits;
