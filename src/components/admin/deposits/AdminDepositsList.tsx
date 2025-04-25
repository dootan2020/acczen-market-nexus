
import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Eye, Loader } from "lucide-react";
import { format } from "date-fns";
import { Deposit, getStatusBadgeVariant } from "@/hooks/useDeposits";
import { AdminDepositViewDialog } from "./AdminDepositViewDialog";

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
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);

  const handleViewDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setViewDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : deposits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No deposits found matching the current filters
                </TableCell>
              </TableRow>
            ) : (
              deposits.map((deposit: Deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell className="font-mono text-xs">
                    {deposit.id.split('-')[0]}...
                  </TableCell>
                  <TableCell>
                    {deposit.profiles?.email || deposit.user_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${deposit.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{deposit.payment_method}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(deposit.status) as any}>
                      {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(deposit.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDeposit(deposit)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {deposit.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            disabled={isMutating}
                            onClick={() => onApprove(deposit.id)}
                          >
                            {isMutating ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            disabled={isMutating}
                            onClick={() => onReject(deposit.id)}
                          >
                            {isMutating ? <Loader className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedDeposit && (
        <AdminDepositViewDialog
          deposit={selectedDeposit}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          onApprove={onApprove}
          onReject={onReject}
          isMutating={isMutating}
        />
      )}
    </>
  );
}
