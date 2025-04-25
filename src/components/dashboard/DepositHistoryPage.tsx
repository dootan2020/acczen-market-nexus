
import React from 'react';
import { useDepositsHistory } from "@/hooks/useDepositsHistory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepositsFilter } from "./deposits/DepositsFilter";
import { DepositsTable } from "./deposits/DepositsTable";
import { PurchasesPagination } from "./purchases/PurchasesPagination";

const DepositHistoryPage = () => {
  const {
    deposits,
    page,
    setPage,
    search,
    setSearch,
    isLoading,
    error,
    totalPages
  } = useDepositsHistory();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>View your deposit and transaction history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <p>Loading your deposit history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>View your deposit and transaction history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-red-500">Error loading deposit history. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!deposits.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>View your deposit and transaction history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <p>You haven't made any deposits yet. Add funds to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>View your deposit and transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <DepositsFilter search={search} setSearch={setSearch} />
          <DepositsTable deposits={deposits} />
          <PurchasesPagination 
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositHistoryPage;
