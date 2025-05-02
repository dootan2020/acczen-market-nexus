
import React from 'react';
import { usePurchases } from "@/hooks/usePurchases";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PurchasesFilter } from "./purchases/PurchasesFilter";
import { PurchasesTable } from "./purchases/PurchasesTable";
import { PurchasesPagination } from "./purchases/PurchasesPagination";

const PurchasesPage = () => {
  const {
    orders,
    page,
    setPage,
    search,
    setSearch,
    isLoading,
    error,
    totalPages
  } = usePurchases();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <p>Loading your purchase history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-red-500">Error loading purchases. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!orders.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <p>You haven't made any purchases yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-[1200px] mx-auto">
            <PurchasesFilter search={search} setSearch={setSearch} />
            <PurchasesTable orders={orders} />
            <PurchasesPagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasesPage;
