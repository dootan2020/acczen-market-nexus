
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Skeleton, 
  SkeletonChartLine, 
  SkeletonChartBar,
  SkeletonTable 
} from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

interface DepositsReportProps {
  depositsChartData: any[];
  isLoading: boolean;
  depositsData: any[];
}

export function DepositsReport({ depositsChartData, isLoading, depositsData }: DepositsReportProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Add fallback for empty data to prevent chart errors
  const hasData = depositsChartData && depositsChartData.length > 0;
  const hasDepositsData = depositsData && depositsData.length > 0;

  // Calculate total pages
  const totalPages = Math.ceil(depositsData.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedDeposits = depositsData.slice(startIndex, startIndex + pageSize);
  
  // Handlers for pagination
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Deposit Trends</CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily deposit amounts over selected period
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonChartLine />
          ) : !hasData ? (
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
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2ECC71" 
                  name="Deposit Amount" 
                  strokeWidth={2}
                  yAxisId="left"
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3498DB" 
                  name="Deposit Count"
                  strokeWidth={2}
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>PayPal Deposits</CardTitle>
            <p className="text-sm text-muted-foreground">
              Transaction history and amounts
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonChartBar />
            ) : !hasData || !hasDepositsData ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground">
                No PayPal deposit data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={depositsChartData.map(d => ({
                    ...d,
                    paypalAmount: (depositsData || [])
                      .filter(deposit => 
                        deposit.payment_method === 'PayPal' && 
                        deposit.status === 'completed' &&
                        format(new Date(deposit.created_at), 'yyyy-MM-dd') === d.date
                      )
                      .reduce((sum, d) => sum + (d.amount || 0), 0)
                  }))}
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
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                  />
                  <Legend />
                  <Bar 
                    dataKey="paypalAmount" 
                    fill="#2ECC71" 
                    name="PayPal Deposits"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>USDT Deposits</CardTitle>
            <p className="text-sm text-muted-foreground">
              Transaction history and amounts
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonChartBar />
            ) : !hasData || !hasDepositsData ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground">
                No USDT deposit data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={depositsChartData.map(d => ({
                    ...d,
                    usdtAmount: (depositsData || [])
                      .filter(deposit => 
                        deposit.payment_method === 'USDT' && 
                        deposit.status === 'completed' &&
                        format(new Date(deposit.created_at), 'yyyy-MM-dd') === d.date
                      )
                      .reduce((sum, d) => sum + (d.amount || 0), 0)
                  }))}
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
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                  />
                  <Legend />
                  <Bar 
                    dataKey="usdtAmount" 
                    fill="#3498DB" 
                    name="USDT Deposits"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Deposits Table with Pagination */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={5} columns={4} />
          ) : !hasDepositsData ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No deposit data available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      {format(new Date(deposit.created_at), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell>${deposit.amount?.toFixed(2)}</TableCell>
                    <TableCell>{deposit.payment_method}</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deposit.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : deposit.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {deposit.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {depositsData.length > pageSize && (
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + pageSize, depositsData.length)} of {depositsData.length} deposits
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrevPage} 
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNextPage} 
                disabled={page >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
