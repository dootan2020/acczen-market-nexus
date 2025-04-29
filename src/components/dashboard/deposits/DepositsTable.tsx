
import React from 'react';
import { 
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Deposit } from '@/types/deposits';

interface DepositsTableProps {
  deposits: Deposit[];
  isLoading: boolean;
}

export function DepositsTable({ deposits, isLoading }: DepositsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!deposits || deposits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No deposit history found.</p>
      </div>
    );
  }
  
  // Helper function to get the right badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deposits.map((deposit) => (
          <TableRow key={deposit.id}>
            <TableCell>{format(new Date(deposit.created_at), 'MMM d, yyyy')}</TableCell>
            <TableCell>${deposit.amount.toFixed(2)}</TableCell>
            <TableCell>{deposit.payment_method}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(deposit.status)}>
                {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
