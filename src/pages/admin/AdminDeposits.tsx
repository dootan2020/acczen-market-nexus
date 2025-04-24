
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, subDays, isAfter } from "date-fns";
import { 
  Check, 
  X, 
  Filter, 
  Download, 
  RefreshCw, 
  Search, 
  Eye,
  Loader
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  transaction_hash?: string;
  paypal_order_id?: string;
  paypal_payer_id?: string;
  paypal_payer_email?: string;
  profiles?: {
    email?: string;
    username?: string;
  } | null;
}

interface User {
  id: string;
  email: string;
  username: string;
}

const AdminDeposits = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);

  // Fetch all deposits
  const { data: deposits, isLoading, error } = useQuery({
    queryKey: ['admin-deposits'],
    queryFn: async () => {
      // First, let's get all deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;
      
      // Then fetch profiles data separately
      const userIds = [...new Set(depositsData.map((d: any) => d.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, username')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Create a map of profiles by id for quick lookup
      const profilesMap = profilesData?.reduce((acc: any, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
      
      // Combine the data
      const combinedData = depositsData.map((deposit: any) => ({
        ...deposit,
        profiles: profilesMap[deposit.user_id] || null
      }));
      
      return combinedData;
    }
  });

  // Mutation for approving deposits
  const approveMutation = useMutation({
    mutationFn: async (depositId: string) => {
      const { data: deposit, error: depositError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .single();

      if (depositError) throw depositError;

      // Update deposit status
      const { data, error } = await supabase
        .from('deposits')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', depositId)
        .select()
        .single();

      if (error) throw error;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: deposit.user_id,
          amount: deposit.amount,
          type: 'deposit',
          reference_id: depositId,
          description: `${deposit.payment_method} deposit (Admin approved)`
        });

      if (transactionError) throw transactionError;

      // Update user balance using a direct database function call
      // Since 'update_user_balance' is not in types, use a raw RPC call
      const { error: balanceError } = await supabase.rpc(
        'update_user_balance',
        { user_id: deposit.user_id, amount: deposit.amount }
      );

      if (balanceError) throw balanceError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
      toast({
        title: 'Deposit Approved',
        description: 'The deposit has been approved and user balance updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Approving Deposit',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  // Mutation for rejecting deposits
  const rejectMutation = useMutation({
    mutationFn: async (depositId: string) => {
      const { data, error } = await supabase
        .from('deposits')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', depositId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
      toast({
        title: 'Deposit Rejected',
        description: 'The deposit has been rejected',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Rejecting Deposit',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  // Filter deposits based on filters
  const filteredDeposits = deposits?.filter((deposit: Deposit) => {
    // Status filter
    if (statusFilter !== "all" && deposit.status !== statusFilter) {
      return false;
    }
    
    // Payment method filter
    if (methodFilter !== "all" && deposit.payment_method !== methodFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter !== "all") {
      const depositDate = new Date(deposit.created_at);
      let comparisonDate;
      
      switch (dateFilter) {
        case "today":
          comparisonDate = new Date();
          comparisonDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          comparisonDate = subDays(new Date(), 7);
          break;
        case "month":
          comparisonDate = subDays(new Date(), 30);
          break;
        default:
          comparisonDate = new Date(0); // beginning of time
      }
      
      if (!isAfter(depositDate, comparisonDate)) {
        return false;
      }
    }
    
    // Search filter - search in transaction ID, user email, or payment ID
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const userEmail = deposit.profiles?.email?.toLowerCase() || '';
      const username = deposit.profiles?.username?.toLowerCase() || '';
      
      return (
        deposit.id.toLowerCase().includes(searchLower) ||
        userEmail.includes(searchLower) ||
        username.includes(searchLower) ||
        (deposit.transaction_hash || '').toLowerCase().includes(searchLower) ||
        (deposit.paypal_order_id || '').toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleExportCSV = () => {
    if (!filteredDeposits?.length) return;
    
    // Create CSV content
    const headers = "ID,User,Amount,Payment Method,Status,Date,Transaction Hash\n";
    
    const csvContent = filteredDeposits.reduce((acc: string, deposit: Deposit) => {
      const user = deposit.profiles?.email || deposit.user_id;
      const row = [
        deposit.id,
        user,
        deposit.amount,
        deposit.payment_method,
        deposit.status,
        format(new Date(deposit.created_at), "yyyy-MM-dd HH:mm:ss"),
        deposit.transaction_hash || deposit.paypal_order_id || ""
      ].map(value => `"${value}"`).join(",");
      
      return acc + row + "\n";
    }, headers);
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `deposits_export_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "CSV Export",
      description: `Exported ${filteredDeposits.length} deposit records`
    });
  };

  const handleViewDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setViewDialogOpen(true);
  };

  // Status badge color mapping
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Deposits</h2>
            <p className="text-muted-foreground">{(error as Error).message}</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-deposits'] })}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Manage Deposits</CardTitle>
              <CardDescription>Process and manage user deposit transactions</CardDescription>
            </div>
            <Button onClick={handleExportCSV} variant="outline" disabled={!filteredDeposits?.length}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, email, or transaction..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                ) : filteredDeposits?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No deposits found matching the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeposits?.map((deposit: Deposit) => (
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
                                disabled={approveMutation.isPending}
                                onClick={() => approveMutation.mutate(deposit.id)}
                              >
                                {approveMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                disabled={rejectMutation.isPending}
                                onClick={() => rejectMutation.mutate(deposit.id)}
                              >
                                {rejectMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
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
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
            <DialogDescription>
              Complete information about this deposit
            </DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Deposit ID</p>
                  <p className="font-mono text-sm break-all">{selectedDeposit.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm break-all">{selectedDeposit.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">${selectedDeposit.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p>{selectedDeposit.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedDeposit.status) as any}>
                    {selectedDeposit.status.charAt(0).toUpperCase() + selectedDeposit.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p>{format(new Date(selectedDeposit.created_at), "PPP p")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p>{format(new Date(selectedDeposit.updated_at), "PPP p")}</p>
                </div>
                
                {selectedDeposit.transaction_hash && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Transaction Hash</p>
                    <p className="font-mono text-sm break-all">{selectedDeposit.transaction_hash}</p>
                  </div>
                )}
                
                {selectedDeposit.paypal_order_id && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">PayPal Order ID</p>
                    <p className="font-mono text-sm">{selectedDeposit.paypal_order_id}</p>
                  </div>
                )}
                
                {selectedDeposit.paypal_payer_id && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">PayPal Payer ID</p>
                    <p className="font-mono text-sm">{selectedDeposit.paypal_payer_id}</p>
                  </div>
                )}
                
                {selectedDeposit.paypal_payer_email && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">PayPal Payer Email</p>
                    <p>{selectedDeposit.paypal_payer_email}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-6">
                {selectedDeposit.status === 'pending' && (
                  <div className="flex gap-2 w-full justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        rejectMutation.mutate(selectedDeposit.id);
                        setViewDialogOpen(false);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        approveMutation.mutate(selectedDeposit.id);
                        setViewDialogOpen(false);
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDeposits;
