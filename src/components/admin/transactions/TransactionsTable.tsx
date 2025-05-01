
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Check, 
  X, 
  RefreshCw,
  CreditCard,
  DollarSign,
  Wallet,
  Loader2
} from "lucide-react";

interface Transaction {
  id: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'deposit' | 'purchase' | 'refund' | 'adjustment';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onViewDetails: (id: string) => void;
  onStatusChange: (id: string, action: 'approve' | 'reject' | 'refund') => void;
}

export const TransactionsTable = ({ 
  transactions, 
  isLoading,
  onViewDetails,
  onStatusChange
}: TransactionsTableProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'purchase':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'refund':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'adjustment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'paypal':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'crypto':
        return <Wallet className="h-4 w-4 text-orange-500" />;
      case 'manual':
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-chatgpt-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Transaction ID</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id} className="group hover:bg-muted/50">
                <TableCell className="font-mono text-xs">
                  {transaction.id.substring(0, 8)}...
                </TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{transaction.userName}</span>
                    <span className="text-xs text-muted-foreground">{transaction.userEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(transaction.type)} variant="outline">
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(transaction.method)}
                    <span className="capitalize">{transaction.method}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)} variant="outline">
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(transaction.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                    
                    {transaction.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusChange(transaction.id, 'approve')}
                          className="h-8 w-8 p-0 text-green-500 hover:text-green-700 border-green-200"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Approve</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusChange(transaction.id, 'reject')}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 border-red-200"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                      </>
                    )}
                    
                    {transaction.status === 'completed' && transaction.type !== 'refund' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange(transaction.id, 'refund')}
                        className="h-8 w-8 p-0 text-orange-500 hover:text-orange-700 border-orange-200"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="sr-only">Refund</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
