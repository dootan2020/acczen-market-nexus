
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Deposit, getStatusBadgeVariant } from '@/hooks/useDeposits';
import { Separator } from '@/components/ui/separator';

interface AdminDepositViewDialogProps {
  deposit: Deposit;
  open: boolean;
  onClose: () => void;
}

export function AdminDepositViewDialog({ deposit, open, onClose }: AdminDepositViewDialogProps) {
  if (!deposit) return null;
  
  const formattedDate = format(new Date(deposit.created_at), 'PPpp');
  const updatedDate = format(new Date(deposit.updated_at), 'PPpp');
  
  // Determine what additional info to show based on payment method
  let additionalInfo = null;
  
  if (deposit.payment_method === 'PayPal') {
    additionalInfo = (
      <div className="space-y-2 mt-4">
        <h4 className="text-sm font-medium">PayPal Information</h4>
        {deposit.paypal_order_id && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Order ID:</span>
            <span className="text-sm font-medium">{deposit.paypal_order_id}</span>
          </div>
        )}
        {deposit.paypal_payer_id && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Payer ID:</span>
            <span className="text-sm font-medium">{deposit.paypal_payer_id}</span>
          </div>
        )}
        {deposit.paypal_payer_email && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Payer Email:</span>
            <span className="text-sm font-medium">{deposit.paypal_payer_email}</span>
          </div>
        )}
      </div>
    );
  } else if (deposit.payment_method === 'USDT') {
    additionalInfo = (
      <div className="space-y-2 mt-4">
        <h4 className="text-sm font-medium">USDT Transaction Information</h4>
        {deposit.transaction_hash && (
          <div>
            <span className="text-sm text-muted-foreground block">Transaction Hash:</span>
            <span className="text-sm font-medium break-all block">{deposit.transaction_hash}</span>
          </div>
        )}
      </div>
    );
  }
  
  // Parse metadata if available
  let metadataDisplay = null;
  if (deposit.metadata && Object.keys(deposit.metadata).length > 0) {
    metadataDisplay = (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Additional Data</h4>
        <div className="bg-muted/40 rounded-md p-3 text-xs max-h-[200px] overflow-auto">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(deposit.metadata, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Deposit Details
            <Badge variant={getStatusBadgeVariant(deposit.status) as any}>
              {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete information about this deposit transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Amount:</span>
            <span className="text-lg font-bold">${deposit.amount}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Payment Method:</span>
            <span>{deposit.payment_method}</span>
          </div>
          
          <div>
            <span className="font-medium block">User:</span>
            <span className="text-sm">{deposit.profiles?.email || 'Unknown User'}</span>
            {deposit.profiles?.username && (
              <span className="text-sm text-muted-foreground block">
                @{deposit.profiles.username}
              </span>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created:</span>
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Updated:</span>
              <span className="text-sm">{updatedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Deposit ID:</span>
              <span className="text-sm font-mono">{deposit.id}</span>
            </div>
          </div>
          
          {additionalInfo}
          {metadataDisplay}
        </div>
        
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
