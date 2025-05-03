
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deposit } from '@/types/deposits';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const useDeposits = () => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<[Date | null, Date | null]>([null, null]);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch all deposits
  const { data: deposits = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-deposits'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('deposits')
          .select('*, profiles:profiles(email, username)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Deposit[];
      } catch (error) {
        console.error('Error fetching deposits:', error);
        throw error;
      }
    }
  });

  // Filter deposits based on current filters
  const filteredDeposits = deposits.filter(deposit => {
    // Status filter
    if (statusFilter && deposit.status !== statusFilter) {
      return false;
    }

    // Method filter
    if (methodFilter && deposit.payment_method !== methodFilter) {
      return false;
    }

    // Date range filter
    if (dateFilter[0] && dateFilter[1]) {
      const depositDate = new Date(deposit.created_at);
      const startDate = dateFilter[0];
      const endDate = dateFilter[1];
      
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      if (depositDate < startDate || depositDate > endDate) {
        return false;
      }
    }

    // Search query
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      const emailMatch = deposit.profiles?.email?.toLowerCase().includes(lowerSearch);
      const usernameMatch = deposit.profiles?.username?.toLowerCase().includes(lowerSearch);
      const idMatch = deposit.id.toLowerCase().includes(lowerSearch);
      const transactionMatch = deposit.transaction_hash?.toLowerCase().includes(lowerSearch) || false;
      
      if (!emailMatch && !usernameMatch && !idMatch && !transactionMatch) {
        return false;
      }
    }

    return true;
  });

  // Export to CSV/Excel
  const exportToCSV = () => {
    try {
      // Prepare data for export
      const exportData = filteredDeposits.map(d => ({
        ID: d.id,
        User: d.profiles?.email || d.profiles?.username || d.user_id,
        Amount: d.amount,
        Method: d.payment_method,
        Status: d.status,
        'Transaction Hash': d.transaction_hash || '',
        'PayPal Order ID': d.paypal_order_id || '',
        'Created At': new Date(d.created_at).toLocaleString(),
        'Updated At': new Date(d.updated_at).toLocaleString(),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Deposits');
      
      // Generate buffer
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save file
      saveAs(data, `deposits-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Export successful');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // Approve/reject deposit mutations
  const approveMutation = useMutation({
    mutationFn: async (depositId: string) => {
      const { data, error } = await supabase
        .from('deposits')
        .update({ status: 'completed' })
        .eq('id', depositId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
      toast.success('Deposit approved successfully');
    },
    onError: (error) => {
      console.error('Error approving deposit:', error);
      toast.error('Failed to approve deposit');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (depositId: string) => {
      const { data, error } = await supabase
        .from('deposits')
        .update({ status: 'rejected' })
        .eq('id', depositId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
      toast.success('Deposit rejected');
    },
    onError: (error) => {
      console.error('Error rejecting deposit:', error);
      toast.error('Failed to reject deposit');
    }
  });

  return {
    filteredDeposits,
    isLoading,
    error,
    refetch,
    filters: {
      statusFilter,
      setStatusFilter,
      methodFilter,
      setMethodFilter,
      dateFilter,
      setDateFilter,
      searchQuery,
      setSearchQuery
    },
    actions: {
      approve: (id: string) => approveMutation.mutate(id),
      reject: (id: string) => rejectMutation.mutate(id),
      exportToCSV
    },
    isMutating: approveMutation.isPending || rejectMutation.isPending
  };
};
