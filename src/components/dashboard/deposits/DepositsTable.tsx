
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Deposit {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  paypal_payer_email?: string;
  transaction_hash?: string;
}

interface DepositsTableProps {
  deposits: Deposit[];
}

export const DepositsTable = ({ deposits }: DepositsTableProps) => {
  const [openDepositId, setOpenDepositId] = useState<string | null>(null);

  const handleDepositClick = (depositId: string) => {
    setOpenDepositId(depositId === openDepositId ? null : depositId);
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatPaymentMethod = (method: string) => {
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deposits.map((deposit) => (
            <React.Fragment key={deposit.id}>
              <TableRow 
                className="cursor-pointer hover:bg-muted/60"
                onClick={() => handleDepositClick(deposit.id)}
              >
                <TableCell>
                  {new Date(deposit.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>${deposit.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {formatPaymentMethod(deposit.payment_method)}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    deposit.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    deposit.status === 'failed' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatStatus(deposit.status)}
                  </span>
                </TableCell>
              </TableRow>
              {openDepositId === deposit.id && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="p-4">
                    <div className="text-sm">
                      <p className="font-medium mb-2">Deposit Details</p>
                      <div className="grid gap-2">
                        <div className="flex justify-between border-b py-1">
                          <span className="font-medium">ID:</span>
                          <span className="text-gray-700">{deposit.id}</span>
                        </div>
                        <div className="flex justify-between border-b py-1">
                          <span className="font-medium">Date:</span>
                          <span className="text-gray-700">
                            {new Date(deposit.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between border-b py-1">
                          <span className="font-medium">Amount:</span>
                          <span className="text-gray-700">${deposit.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b py-1">
                          <span className="font-medium">Payment Method:</span>
                          <span className="text-gray-700">{formatPaymentMethod(deposit.payment_method)}</span>
                        </div>
                        {deposit.paypal_payer_email && (
                          <div className="flex justify-between border-b py-1">
                            <span className="font-medium">PayPal Email:</span>
                            <span className="text-gray-700">{deposit.paypal_payer_email}</span>
                          </div>
                        )}
                        {deposit.transaction_hash && (
                          <div className="flex justify-between border-b py-1">
                            <span className="font-medium">Transaction Hash:</span>
                            <span className="text-gray-700 break-all">{deposit.transaction_hash}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1">
                          <span className="font-medium">Status:</span>
                          <span className={`
                            ${deposit.status === 'completed' ? 'text-green-600' : 
                              deposit.status === 'pending' ? 'text-yellow-600' : 
                              deposit.status === 'failed' ? 'text-red-600' : 
                              'text-gray-600'}
                          `}>
                            {formatStatus(deposit.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
