
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, subDays, isAfter } from "date-fns";
import * as XLSX from 'xlsx';

// Type definitions
export interface Deposit {
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
  metadata?: Record<string, any>;
  profiles?: {
    email?: string;
    username?: string;
  } | null;
}

interface UseDepositsOptions {
  initialStatusFilter?: string;
  initialMethodFilter?: string;
  initialDateFilter?: string;
}

export function useDeposits(options: UseDepositsOptions = {}) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>(options.initialStatusFilter || "all");
  const [methodFilter, setMethodFilter] = useState<string>(options.initialMethodFilter || "all");
  const [dateFilter, setDateFilter] = useState<string>(options.initialDateFilter || "all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Fetch all deposits
  const { data: deposits, isLoading, error, refetch } = useQuery({
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
      
      return combinedData as Deposit[];
    }
  });

  // Filter deposits based on filters
  const filteredDeposits = useCallback(() => {
    if (!deposits) return [] as Deposit[];
    
    return deposits.filter((deposit: Deposit) => {
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
  }, [deposits, statusFilter, methodFilter, dateFilter, searchQuery]);

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

      // Update user balance
      const { error: balanceError } = await supabase.rpc(
        'update_user_balance',
        {
          user_id: deposit.user_id,
          amount: deposit.amount
        }
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

  const exportToCSV = useCallback(() => {
    const filtered = filteredDeposits();
    if (!filtered?.length) return;
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(filtered.map(deposit => ({
      ID: deposit.id,
      User: deposit.profiles?.email || 'Unknown user',
      Amount: deposit.amount,
      Status: deposit.status,
      Method: deposit.payment_method,
      Date: format(new Date(deposit.created_at), "yyyy-MM-dd HH:mm:ss"),
      TransactionHash: deposit.transaction_hash || 'N/A'
    })));
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deposits");
    
    // Create file and trigger download
    XLSX.writeFile(workbook, `deposits_export_${format(new Date(), "yyyyMMdd")}.xlsx`);
    
    toast({
      title: "Excel Export",
      description: `Exported ${filtered.length} deposit records`
    });
  }, [filteredDeposits]);

  return {
    deposits,
    filteredDeposits: filteredDeposits(),
    isLoading,
    error,
    refetch,
    filters: {
      statusFilter,
      methodFilter,
      dateFilter,
      searchQuery,
      setStatusFilter,
      setMethodFilter,
      setDateFilter,
      setSearchQuery
    },
    actions: {
      approve: approveMutation.mutate,
      reject: rejectMutation.mutate,
      exportToCSV
    },
    isMutating: approveMutation.isPending || rejectMutation.isPending
  };
}

// Helper function for getting status badge variant
export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'destructive';
    default: return 'secondary';
  }
};
