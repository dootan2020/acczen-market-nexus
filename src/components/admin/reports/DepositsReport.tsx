
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataPagination } from "./DataPagination";

interface DepositsReportProps {
  depositsChartData: any[];
  isLoading: boolean;
  depositsData: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalItems: number;
}

export function DepositsReport({ 
  depositsChartData, 
  isLoading,
  depositsData,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalItems
}: DepositsReportProps) {
  // Add fallback for empty data to prevent chart errors
  const hasChartData = depositsChartData && depositsChartData.length > 0;

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deposits Trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily deposit volume and amounts
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : !hasChartData ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">
              No deposit data available for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={depositsChartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  label={{ value: 'Count', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={(value: number, name) => {
                    if (name === 'amount') return [`$${value.toFixed(2)}`, 'Amount'];
                    return [value, 'Count'];
                  }}
                  labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2ECC71" 
                  name="Amount" 
                  yAxisId="left"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3498DB" 
                  name="Deposit Count"
                  yAxisId="right"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deposits List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <div className="border rounded-md overflow-hidden">
                <Table className="whitespace-nowrap">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depositsData && depositsData.length > 0 ? (
                      depositsData.map((deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell>{format(new Date(deposit.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{deposit.user_id}</TableCell>
                          <TableCell>{deposit.payment_method}</TableCell>
                          <TableCell className="max-w-[120px] truncate">
                            {deposit.transaction_hash || deposit.paypal_order_id || deposit.payment_id || 'N/A'}
                          </TableCell>
                          <TableCell>${deposit.amount.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">No deposit data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <DataPagination 
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalItems={totalItems}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
