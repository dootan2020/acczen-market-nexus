
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTransactionDetails } from "@/hooks/admin/useTransactionDetails";
import {
  Check,
  X,
  RefreshCw,
  Loader2,
  Clock,
  User,
  CreditCard,
  Calendar,
  FileText,
  AlertCircle
} from "lucide-react";

interface TransactionDetailsDialogProps {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, action: 'approve' | 'reject' | 'refund') => void;
}

export const TransactionDetailsDialog = ({
  transactionId,
  open,
  onOpenChange,
  onStatusChange
}: TransactionDetailsDialogProps) => {
  const { transaction, isLoading, error } = useTransactionDetails(transactionId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-chatgpt-primary mb-4" />
            <p className="text-muted-foreground">Loading transaction details...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <p className="text-muted-foreground">Error loading transaction details.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        ) : transaction ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                Transaction Details
                <Badge className={getStatusColor(transaction.status)} variant="outline">
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                View and manage transaction details.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Transaction Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-chatgpt-primary" /> Transaction Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">Transaction ID:</div>
                  <div className="text-sm font-mono">{transaction.id}</div>
                  
                  <div className="text-sm">Type:</div>
                  <div className="text-sm font-medium capitalize">{transaction.type}</div>
                  
                  <div className="text-sm">Amount:</div>
                  <div className={`text-sm font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(transaction.amount)}
                  </div>
                  
                  <div className="text-sm">Date:</div>
                  <div className="text-sm">
                    {new Date(transaction.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* User Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-chatgpt-primary" /> User Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">User:</div>
                  <div className="text-sm font-medium">{transaction.userName}</div>
                  
                  <div className="text-sm">Email:</div>
                  <div className="text-sm">{transaction.userEmail}</div>
                </div>
              </div>
              
              <Separator />
              
              {/* Payment Method */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-chatgpt-primary" /> Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">Method:</div>
                  <div className="text-sm capitalize">{transaction.method}</div>
                  
                  {transaction.method === 'paypal' && transaction.paymentDetails && (
                    <>
                      <div className="text-sm">PayPal Email:</div>
                      <div className="text-sm">{transaction.paymentDetails.email}</div>
                      
                      <div className="text-sm">PayPal ID:</div>
                      <div className="text-sm font-mono">{transaction.paymentDetails.id}</div>
                    </>
                  )}
                  
                  {transaction.method === 'crypto' && transaction.paymentDetails && (
                    <>
                      <div className="text-sm">Transaction Hash:</div>
                      <div className="text-sm font-mono break-all">{transaction.paymentDetails.hash}</div>
                      
                      <div className="text-sm">Wallet Address:</div>
                      <div className="text-sm font-mono break-all">{transaction.paymentDetails.address}</div>
                    </>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Status History */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-chatgpt-primary" /> Status History
                </h3>
                <div className="space-y-2">
                  {transaction.statusHistory && transaction.statusHistory.map((status, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className={getStatusColor(status.status)}>
                        {status.status}
                      </Badge>
                      <span className="text-muted-foreground">
                        {new Date(status.timestamp).toLocaleString()}
                      </span>
                      {status.by && <span>by {status.by}</span>}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Additional Details */}
              {transaction.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Notes</h3>
                    <p className="text-sm whitespace-pre-wrap">{transaction.notes}</p>
                  </div>
                </>
              )}
              
              {/* Attachments */}
              {transaction.attachments && transaction.attachments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Attachments</h3>
                    <div className="flex flex-wrap gap-2">
                      {transaction.attachments.map((attachment, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          asChild
                        >
                          <a href={attachment.url} target="_blank" rel="noreferrer">
                            {attachment.name}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              {transaction.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onStatusChange(transaction.id, 'reject')}
                    className="bg-transparent border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => onStatusChange(transaction.id, 'approve')}
                    className="bg-chatgpt-primary hover:bg-chatgpt-primary/90"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}
              
              {transaction.status === 'completed' && transaction.type !== 'refund' && (
                <Button
                  variant="outline"
                  onClick={() => onStatusChange(transaction.id, 'refund')}
                  className="bg-transparent border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Process Refund
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <p className="text-muted-foreground">Transaction not found.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
