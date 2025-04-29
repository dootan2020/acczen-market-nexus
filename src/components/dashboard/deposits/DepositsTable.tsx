
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
import { getStatusBadgeVariant } from '@/hooks/useDeposits';

// Define types for deposits
interface Deposit {
  id: string;
  amount: number;
  created_at: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'rejected';
  updated_at: string;
}

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
              <Badge variant={getStatusBadgeVariant(deposit.status) as "default" | "destructive" | "outline" | "secondary" | "success"}>
                {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
