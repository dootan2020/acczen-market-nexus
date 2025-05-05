
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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ErrorAlert from "@/components/ui/ErrorAlert";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const PurchasesPageContent = () => {
  const {
    orders,
    page,
    setPage,
    search,
    setSearch,
    isLoading,
    error,
    totalPages,
    refetch
  } = usePurchases();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p>Loading your purchase history...</p>
          </div>
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
        <CardContent>
          <ErrorAlert 
            title="Error Loading Purchases" 
            message="We encountered a problem loading your purchase history."
            details={error instanceof Error ? error.message : String(error)}
            action={
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="mb-4">You haven't made any purchases yet.</p>
            <Button asChild>
              <a href="/products">Browse Products</a>
            </Button>
          </div>
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

const PurchasesPage = () => {
  return (
    <ErrorBoundary>
      <PurchasesPageContent />
    </ErrorBoundary>
  );
};

export default PurchasesPage;
