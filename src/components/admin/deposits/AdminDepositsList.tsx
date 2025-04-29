
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, Loader2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Deposit } from '@/types/deposits';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminDepositViewDialog } from './AdminDepositViewDialog';

// Helper function for getting status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'default';
    case 'rejected': return 'destructive';
    default: return 'secondary';
  }
};

interface AdminDepositsListProps {
  deposits: Deposit[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isMutating: boolean;
}

export function AdminDepositsList({
  deposits,
  isLoading,
  onApprove,
  onReject,
  isMutating
}: AdminDepositsListProps) {
  const isMobile = useIsMobile();
  const [selectedDeposit, setSelectedDeposit] = React.useState<Deposit | null>(null);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  if (!deposits?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No deposits found matching your criteria</p>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    const variant = getStatusBadgeVariant(status);
    
    let icon;
    switch (status) {
      case 'completed':
        icon = <CheckCircle2 className="h-3 w-3" />;
        break;
      case 'pending':
        icon = <Clock className="h-3 w-3" />;
        break;
      case 'rejected':
        icon = <AlertTriangle className="h-3 w-3" />;
        break;
      default:
        icon = null;
    }
    
    return (
      <Badge variant={variant as any} className="flex items-center gap-1">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          {deposits.map(deposit => (
            <Card key={deposit.id}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">${deposit.amount}</div>
                  {getStatusBadge(deposit.status)}
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  {format(new Date(deposit.created_at), 'MMM d, yyyy h:mm a')}
                </div>
                
                <div className="text-sm mb-2">
                  <span className="font-medium">User: </span>
                  <span>{deposit.profiles?.email || deposit.user_id.substring(0, 8)}</span>
                </div>
                
                <div className="text-sm mb-3">
                  <span className="font-medium">Method: </span>
                  <span>{deposit.payment_method}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedDeposit(deposit)}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  
                  {deposit.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="default" 
                        onClick={() => onApprove(deposit.id)}
                        disabled={isMutating}>
                        {isMutating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                        Approve
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onReject(deposit.id)}
                        disabled={isMutating}>
                        {isMutating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {selectedDeposit && (
          <AdminDepositViewDialog
            deposit={selectedDeposit}
            open={!!selectedDeposit}
            onClose={() => setSelectedDeposit(null)}
          />
        )}
      </>
    );
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deposits.map(deposit => (
            <TableRow key={deposit.id}>
              <TableCell>
                {format(new Date(deposit.created_at), 'MMM d, yyyy')}
                <div className="text-xs text-muted-foreground">
                  {format(new Date(deposit.created_at), 'h:mm a')}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {deposit.profiles?.email || 'Unknown User'}
                </div>
                {deposit.profiles?.username && (
                  <div className="text-xs text-muted-foreground">
                    @{deposit.profiles.username}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {deposit.payment_method}
                {deposit.payment_method === 'PayPal' && deposit.paypal_payer_email && (
                  <div className="text-xs text-muted-foreground">
                    {deposit.paypal_payer_email}
                  </div>
                )}
                {deposit.payment_method === 'USDT' && deposit.transaction_hash && (
                  <div className="text-xs text-muted-foreground max-w-[120px] truncate">
                    {deposit.transaction_hash.substring(0, 16)}...
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                ${deposit.amount}
              </TableCell>
              <TableCell>
                {getStatusBadge(deposit.status)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedDeposit(deposit)}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  
                  {deposit.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="default" 
                        onClick={() => onApprove(deposit.id)}
                        disabled={isMutating}>
                        {isMutating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                        Approve
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onReject(deposit.id)}
                        disabled={isMutating}>
                        {isMutating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedDeposit && (
        <AdminDepositViewDialog
          deposit={selectedDeposit}
          open={!!selectedDeposit}
          onClose={() => setSelectedDeposit(null)}
        />
      )}
    </>
  );
}
