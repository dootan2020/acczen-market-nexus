
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";

interface TransactionSummary {
  totalVolume: number;
  totalDeposits: number;
  totalPurchases: number;
  totalRefunds: number;
}

interface TransactionsSummaryProps {
  summary: TransactionSummary;
  isLoading: boolean;
}

export const TransactionsSummary = ({ summary, isLoading }: TransactionsSummaryProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-sm border-chatgpt-primary/10 transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Transaction Volume
          </CardTitle>
          <CircleDollarSign className="h-4 w-4 text-chatgpt-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              `$${summary.totalVolume.toFixed(2)}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            All time transaction value
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-chatgpt-primary/10 transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Deposits
          </CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              `$${summary.totalDeposits.toFixed(2)}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            All time deposit value
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-chatgpt-primary/10 transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Purchases
          </CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              `$${summary.totalPurchases.toFixed(2)}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            All time purchase value
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-chatgpt-primary/10 transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Refunds
          </CardTitle>
          <RefreshCw className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              `$${summary.totalRefunds.toFixed(2)}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            All time refund value
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
