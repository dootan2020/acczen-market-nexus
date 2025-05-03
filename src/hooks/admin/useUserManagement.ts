
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user';
  balance: number;
  created_at: string;
  updated_at: string;
  discount_percentage?: number;
  discount_note?: string | null;
}

export const useUserManagement = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);

  // Fetch users with pagination
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', currentPage, pageSize, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }

      const { data, count, error } = await query;
      
      if (error) throw error;
      
      return {
        users: data as UserProfile[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    }
  });

  // Filter users by search query
  const filteredUsers = usersData?.users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query)
    );
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: UserProfile['role'] }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Adjust user balance mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: async ({ 
      id, 
      amount, 
      operation, 
      notes 
    }: { 
      id: string, 
      amount: number, 
      operation: 'add' | 'subtract',
      notes: string
    }) => {
      // First, get current balance
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentBalance = userData?.balance || 0;
      const newBalance = operation === 'add' 
        ? currentBalance + amount
        : Math.max(0, currentBalance - amount); // Prevent negative balance
      
      // Update balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: id,
          amount: operation === 'add' ? amount : -amount,
          type: operation === 'add' ? 'admin_deposit' : 'admin_withdrawal',
          description: notes || `Balance ${operation === 'add' ? 'increased' : 'decreased'} by admin`
        });
      
      if (transactionError) throw transactionError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User balance adjusted successfully');
      setIsBalanceDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to adjust balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update user discount mutation
  const updateDiscountMutation = useMutation({
    mutationFn: async ({ 
      id, 
      discountPercentage, 
      discountNote,
      expiresAt
    }: { 
      id: string, 
      discountPercentage: number, 
      discountNote: string,
      expiresAt?: Date
    }) => {
      // Call the admin_update_user_discount function
      const { error } = await supabase
        .rpc('admin_update_user_discount', { 
          p_user_id: id, 
          p_discount_percentage: discountPercentage, 
          p_discount_note: discountNote,
          p_expires_at: expiresAt ? expiresAt.toISOString() : null
        });
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User discount updated successfully');
      setIsDiscountDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update discount: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Navigation functions
  const nextPage = () => {
    if (usersData && currentPage < usersData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (usersData && page >= 1 && page <= usersData.totalPages) {
      setCurrentPage(page);
    }
  };

  // Dialog handlers
  const handleEditRole = (user: UserProfile) => {
    setCurrentUser(user);
    setIsEditDialogOpen(true);
  };

  const handleAdjustBalance = (user: UserProfile) => {
    setCurrentUser(user);
    setIsBalanceDialogOpen(true);
  };

  const handleUpdateDiscount = (user: UserProfile) => {
    setCurrentUser(user);
    setIsDiscountDialogOpen(true);
  };

  return {
    users: filteredUsers || [],
    totalUsers: usersData?.totalCount || 0,
    totalPages: usersData?.totalPages || 1,
    currentPage,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    currentUser,
    setCurrentUser,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isBalanceDialogOpen,
    setIsBalanceDialogOpen,
    isDiscountDialogOpen,
    setIsDiscountDialogOpen,
    nextPage,
    prevPage,
    goToPage,
    handleEditRole,
    handleAdjustBalance,
    handleUpdateDiscount,
    updateRoleMutation,
    adjustBalanceMutation,
    updateDiscountMutation
  };
};
