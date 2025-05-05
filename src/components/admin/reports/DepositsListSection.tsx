
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Deposit } from '@/types/deposits';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { Loader } from 'lucide-react';

interface DepositsListSectionProps {
  deposits: Deposit[];
  isLoading: boolean;
}

export const DepositsListSection: React.FC<DepositsListSectionProps> = ({ deposits, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!deposits.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No deposits found for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deposits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deposits.map((deposit) => (
            <div key={deposit.id} className="flex items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <p className="font-medium">
                  {deposit.payment_method} - {formatCurrency(deposit.amount)}
                </p>
                <div className="flex space-x-2 text-sm text-muted-foreground">
                  <span>{format(new Date(deposit.created_at), 'PPP')}</span>
                  <span>•</span>
                  <span>ID: {deposit.id.slice(0, 8)}</span>
                </div>
              </div>
              <Badge 
                variant={
                  deposit.status === 'completed' ? 'success' : 
                  deposit.status === 'pending' ? 'warning' : 'destructive'
                }
              >
                {deposit.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
