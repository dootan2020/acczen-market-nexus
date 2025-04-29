
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { LoyaltyTransaction } from '@/types/loyalty';

interface LoyaltyTransactionHistoryProps {
  transactions: LoyaltyTransaction[];
  isLoading?: boolean;
}

export const LoyaltyTransactionHistory: React.FC<LoyaltyTransactionHistoryProps> = ({
  transactions,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-3 border-b last:border-0 flex justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-40"></div>
                <div className="h-3 bg-muted/60 rounded w-24"></div>
              </div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">Chưa có giao dịch nào</p>
        </CardContent>
      </Card>
    );
  }

  // Format transaction type to Vietnamese
  const formatTransactionType = (type: string): string => {
    switch (type) {
      case 'earned':
        return 'Tích lũy';
      case 'redeemed':
        return 'Sử dụng';
      case 'expired':
        return 'Hết hạn';
      case 'adjusted':
        return 'Điều chỉnh';
      default:
        return type;
    }
  };

  // Get transaction color
  const getTransactionColor = (type: string, points: number): string => {
    if (points > 0) return 'text-green-600';
    if (points < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Lịch sử giao dịch</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y">
          {sortedTransactions.map((transaction) => (
            <div key={transaction.id} className="py-3 px-6 flex justify-between">
              <div>
                <p className="font-medium text-sm">
                  {transaction.description || formatTransactionType(transaction.transaction_type)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
              </div>
              <div className={`font-medium ${getTransactionColor(transaction.transaction_type, transaction.points)}`}>
                {transaction.points > 0 ? '+' : ''}{transaction.points} điểm
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
