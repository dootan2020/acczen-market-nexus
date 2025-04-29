import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

// Define the Deposit type with required properties
export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  payment_method: string;
  created_at: string;
  updated_at: string;
  transaction_hash?: string;
  paypal_order_id?: string;
  paypal_payer_id?: string;
  paypal_payer_email?: string;
  metadata?: Record<string, any>; // Add metadata field
  profiles?: {
    id: string;
    email?: string;
    username?: string;
    full_name?: string;
  };
}

// Helper function to get variant for status badges
export function getStatusBadgeVariant(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'outline';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function useDeposits() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const { data: deposits, isLoading, error, refetch } = useQuery<Deposit[], Error>(
    ['deposits', statusFilter, methodFilter, dateFilter, searchQuery],
    async () => {
      let query = supabase
        .from('deposits')
        .select(`
          *,
          profiles (
            id,
            email,
            username,
            full_name
          )
        `);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (methodFilter !== 'all') {
        query = query.eq('payment_method', methodFilter);
      }

      if (searchQuery) {
        query = query.or(
          `id.ilike.%${searchQuery}%,profiles.email.ilike.%${searchQuery}%,transaction_hash.ilike.%${searchQuery}%`
        );
      }

      switch (dateFilter) {
        case 'today':
          query = query.gte('created_at', format(new Date(), 'yyyy-MM-dd') + ' 00:00:00');
          break;
        case 'week':
          const startOfWeek = format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
          query = query.gte('created_at', startOfWeek + ' 00:00:00');
          break;
        case 'month':
          const startOfMonth = format(new Date().setDate(1), 'yyyy-MM-dd');
          query = query.gte('created_at', startOfMonth + ' 00:00:00');
          break;
        default:
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching deposits:", error);
        throw error;
      }

      return data || [];
    }
  );

  const approveDeposit = useCallback(async (depositId: string) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('deposits')
        .update({ status: 'completed' })
        .eq('id', depositId);

      if (error) {
        console.error("Error approving deposit:", error);
        toast.error("Failed to approve deposit");
      } else {
        toast.success("Deposit approved successfully!");
        refetch();
      }
    } finally {
      setIsMutating(false);
    }
  }, [refetch]);

  const rejectDeposit = useCallback(async (depositId: string) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('deposits')
        .update({ status: 'rejected' })
        .eq('id', depositId);

      if (error) {
        console.error("Error rejecting deposit:", error);
        toast.error("Failed to reject deposit");
      } else {
        toast.success("Deposit rejected successfully!");
        refetch();
      }
    } finally {
      setIsMutating(false);
    }
  }, [refetch]);

  const exportToCSV = useCallback(() => {
    if (!deposits || deposits.length === 0) {
      toast.error("No deposits to export.");
      return;
    }

    const csvData = deposits.map(deposit => ({
      ID: deposit.id,
      User: deposit.profiles?.email || 'N/A',
      Amount: deposit.amount,
      Status: deposit.status,
      Method: deposit.payment_method,
      Created: deposit.created_at,
      Updated: deposit.updated_at,
      TransactionHash: deposit.transaction_hash || 'N/A',
      PayPalOrderID: deposit.paypal_order_id || 'N/A',
      PayPalPayerID: deposit.paypal_payer_id || 'N/A',
      PayPalPayerEmail: deposit.paypal_payer_email || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Deposits');
    XLSX.writeFile(wb, `deposits-${new Date().toISOString()}.csv`);
  }, [deposits]);

  const filteredDeposits = deposits;

  return {
    filteredDeposits,
    isLoading,
    error,
    refetch,
    filters: {
      statusFilter,
      methodFilter,
      dateFilter,
      searchQuery,
      setStatusFilter: setStatusFilter,
      setMethodFilter: setMethodFilter,
      setDateFilter: setDateFilter,
      setSearchQuery: setSearchQuery
    },
    actions: {
      approve: approveDeposit,
      reject: rejectDeposit,
      exportToCSV: exportToCSV
    },
    isMutating
  };
}
