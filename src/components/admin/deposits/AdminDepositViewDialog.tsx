
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Deposit, getStatusBadgeVariant } from "@/hooks/useDeposits";

interface AdminDepositViewDialogProps {
  deposit: Deposit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isMutating: boolean;
}

export function AdminDepositViewDialog({
  deposit,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isMutating
}: AdminDepositViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Deposit Details</DialogTitle>
          <DialogDescription>
            Complete information about this deposit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Deposit ID</p>
              <p className="font-mono text-sm break-all">{deposit.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm break-all">{deposit.user_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">${deposit.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p>{deposit.payment_method}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={getStatusBadgeVariant(deposit.status) as any}>
                {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p>{format(new Date(deposit.created_at), "PPP p")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated At</p>
              <p>{format(new Date(deposit.updated_at), "PPP p")}</p>
            </div>
            
            {deposit.transaction_hash && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Transaction Hash</p>
                <p className="font-mono text-sm break-all">{deposit.transaction_hash}</p>
              </div>
            )}
            
            {deposit.paypal_order_id && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">PayPal Order ID</p>
                <p className="font-mono text-sm">{deposit.paypal_order_id}</p>
              </div>
            )}
            
            {deposit.paypal_payer_id && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">PayPal Payer ID</p>
                <p className="font-mono text-sm">{deposit.paypal_payer_id}</p>
              </div>
            )}
            
            {deposit.paypal_payer_email && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">PayPal Payer Email</p>
                <p>{deposit.paypal_payer_email}</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            {deposit.status === 'pending' && (
              <div className="flex gap-2 w-full justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    onReject(deposit.id);
                    onOpenChange(false);
                  }}
                  disabled={isMutating}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    onApprove(deposit.id);
                    onOpenChange(false);
                  }}
                  disabled={isMutating}
                >
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
