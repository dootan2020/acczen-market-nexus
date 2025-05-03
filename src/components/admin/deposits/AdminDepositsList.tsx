
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Deposit } from "@/types/deposits";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, ExternalLink, RefreshCw, Eye, Loader2, MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/purchases/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deposits.length) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No deposits found matching your search criteria.</p>
      </div>
    );
  }

  const handleViewDetails = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
  };

  const closeDialog = () => {
    setSelectedDeposit(null);
  };

  return (
    <>
      <div className="mt-6 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((deposit) => (
              <TableRow key={deposit.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={``} alt="" />
                      <AvatarFallback>
                        {(deposit.profiles?.email?.charAt(0) || deposit.profiles?.username?.charAt(0) || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {deposit.profiles?.email || deposit.profiles?.username || deposit.user_id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {deposit.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">${deposit.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{deposit.payment_method}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={deposit.status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{format(new Date(deposit.created_at), 'MMM d, yyyy')}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(deposit.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(deposit)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      {deposit.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => onApprove(deposit.id)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject(deposit.id)}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Deposit details dialog */}
      <Dialog open={!!selectedDeposit} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
            <DialogDescription>
              Transaction details for deposit #{selectedDeposit?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <Card className="p-4 bg-muted/40">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">ID:</div>
                    <div className="text-sm truncate font-mono">{selectedDeposit.id}</div>
                    
                    <div className="text-sm font-medium">User ID:</div>
                    <div className="text-sm truncate font-mono">{selectedDeposit.user_id}</div>
                    
                    <div className="text-sm font-medium">Amount:</div>
                    <div className="text-sm">${selectedDeposit.amount.toFixed(2)}</div>
                    
                    <div className="text-sm font-medium">Payment Method:</div>
                    <div className="text-sm">{selectedDeposit.payment_method}</div>
                    
                    <div className="text-sm font-medium">Status:</div>
                    <div className="text-sm">
                      <StatusBadge status={selectedDeposit.status} />
                    </div>
                    
                    <div className="text-sm font-medium">Created At:</div>
                    <div className="text-sm">{format(new Date(selectedDeposit.created_at), 'PPpp')}</div>
                    
                    <div className="text-sm font-medium">Updated At:</div>
                    <div className="text-sm">{format(new Date(selectedDeposit.updated_at), 'PPpp')}</div>
                    
                    {selectedDeposit.transaction_hash && (
                      <>
                        <div className="text-sm font-medium">Transaction Hash:</div>
                        <div className="text-sm truncate font-mono">{selectedDeposit.transaction_hash}</div>
                      </>
                    )}
                    
                    {selectedDeposit.paypal_order_id && (
                      <>
                        <div className="text-sm font-medium">PayPal Order ID:</div>
                        <div className="text-sm truncate font-mono">{selectedDeposit.paypal_order_id}</div>
                      </>
                    )}
                    
                    {selectedDeposit.paypal_payer_id && (
                      <>
                        <div className="text-sm font-medium">PayPal Payer ID:</div>
                        <div className="text-sm truncate font-mono">{selectedDeposit.paypal_payer_id}</div>
                      </>
                    )}
                    
                    {selectedDeposit.paypal_payer_email && (
                      <>
                        <div className="text-sm font-medium">PayPal Email:</div>
                        <div className="text-sm truncate">{selectedDeposit.paypal_payer_email}</div>
                      </>
                    )}
                  </div>
                </Card>
                
                {selectedDeposit.metadata && Object.keys(selectedDeposit.metadata).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Additional Data:</h4>
                    <pre className="bg-muted p-2 rounded text-xs font-mono overflow-auto">
                      {JSON.stringify(selectedDeposit.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="flex justify-between">
            {selectedDeposit?.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onReject(selectedDeposit.id);
                    closeDialog();
                  }}
                  disabled={isMutating}
                >
                  {isMutating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    onApprove(selectedDeposit.id);
                    closeDialog();
                  }}
                  disabled={isMutating}
                >
                  {isMutating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={closeDialog}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
