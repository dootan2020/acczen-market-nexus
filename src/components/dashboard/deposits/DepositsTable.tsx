
import React from 'react';
import { Deposit } from '@/types/deposits';
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { format } from 'date-fns';
import { StatusBadge } from "../purchases/StatusBadge";
import { RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DepositsTableProps {
  deposits: Deposit[];
  isLoading: boolean;
}

export const DepositsTable: React.FC<DepositsTableProps> = ({ deposits, isLoading }) => {
  const { formatUSD } = useCurrencyContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deposits.length) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No deposit history found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deposits.map((deposit) => (
            <TableRow key={deposit.id}>
              <TableCell>
                {format(new Date(deposit.created_at), 'MMM d, yyyy - h:mm a')}
              </TableCell>
              <TableCell className="font-medium">{formatUSD(deposit.amount)}</TableCell>
              <TableCell>{deposit.payment_method}</TableCell>
              <TableCell className="text-right">
                <StatusBadge status={deposit.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
