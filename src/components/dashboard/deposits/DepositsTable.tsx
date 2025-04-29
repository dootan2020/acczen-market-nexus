
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EyeIcon, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface Deposit {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  transaction_hash?: string;
  paypal_payer_email?: string;
}

interface DepositsTableProps {
  deposits: Deposit[];
}

export function DepositsTable({ deposits }: DepositsTableProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  if (!deposits.length) {
    return <div className="text-center py-8 text-muted-foreground">No deposit records found</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'failed':
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {deposits.map((deposit) => (
          <Card key={deposit.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">${deposit.amount.toFixed(2)}</div>
              {getStatusBadge(deposit.status)}
            </div>
            <div className="text-sm text-muted-foreground mb-1">
              {format(new Date(deposit.created_at), 'MMM d, yyyy h:mm a')}
            </div>
            <div className="text-sm font-medium">
              {deposit.payment_method}
              {deposit.paypal_payer_email && (
                <span className="text-muted-foreground ml-2 text-xs">
                  ({deposit.paypal_payer_email})
                </span>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/dashboard/deposits/${deposit.id}`)}
              >
                <EyeIcon className="h-4 w-4 mr-1" /> Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deposits.map((deposit) => (
          <TableRow key={deposit.id}>
            <TableCell>
              {format(new Date(deposit.created_at), 'MMM d, yyyy')}
              <div className="text-xs text-muted-foreground">
                {format(new Date(deposit.created_at), 'h:mm a')}
              </div>
            </TableCell>
            <TableCell>
              {deposit.payment_method}
              {deposit.paypal_payer_email && (
                <div className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                  {deposit.paypal_payer_email}
                </div>
              )}
            </TableCell>
            <TableCell className="text-right font-medium">
              ${deposit.amount.toFixed(2)}
            </TableCell>
            <TableCell>{getStatusBadge(deposit.status)}</TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground inline-block max-w-[120px] truncate">
                      {deposit.transaction_hash || deposit.id.substring(0, 8)}...
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs break-all">
                    <p>{deposit.transaction_hash || deposit.id}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell className="text-right">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/dashboard/deposits/${deposit.id}`)}
              >
                <EyeIcon className="h-4 w-4 mr-1" /> Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
