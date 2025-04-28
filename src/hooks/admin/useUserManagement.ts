
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminPagination } from '@/hooks/useAdminPagination';

type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  balance: number;
  created_at: string;
}

export const useUserManagement = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isAdjustBalanceDialogOpen, setIsAdjustBalanceDialogOpen] = useState(false);

  // Fetch users with pagination
  const { 
    data: users, 
    isLoading,
    currentPage,
    totalPages,
    goToPage,
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage
  } = useAdminPagination<UserProfile>(
    'profiles',
    ['admin-users'],
    { pageSize: 10 },
    {}
  );

  // Filter users by search query and role
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'User role updated',
        description: 'The user role has been updated successfully.',
      });
      setIsEditRoleDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user role',
      });
    },
  });

  // Adjust balance mutation
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
      // Get current balance
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentBalance = userData?.balance || 0;
      const newBalance = operation === 'add' 
        ? currentBalance + amount 
        : Math.max(0, currentBalance - amount);
      
      // Update balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Record the transaction
      // Using the proper transaction type based on database enum
      const transactionType = operation === 'add' ? 'deposit' : 'refund';
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: id,
          type: transactionType,
          amount: amount,
          description: notes || `Manual balance ${operation === 'add' ? 'increase' : 'decrease'} by admin`
        });
      
      if (transactionError) throw transactionError;
      
      return { success: true, newBalance };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Balance adjusted',
        description: `User balance has been ${variables.operation === 'add' ? 'increased' : 'decreased'} successfully.`,
      });
      setIsAdjustBalanceDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to adjust user balance',
      });
    },
  });

  // Handler functions
  const handleEditRole = (user: UserProfile) => {
    setCurrentUser(user);
    setIsEditRoleDialogOpen(true);
  };

  const handleAdjustBalance = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAdjustBalanceDialogOpen(true);
  };

  const handleUpdateRole = (role: UserRole) => {
    if (currentUser) {
      updateRoleMutation.mutate({ id: currentUser.id, role });
    }
  };

  const handleAdjustBalanceConfirm = (amount: number, operation: 'add' | 'subtract', notes: string) => {
    if (currentUser) {
      adjustBalanceMutation.mutate({ 
        id: currentUser.id, 
        amount, 
        operation, 
        notes 
      });
    }
  };

  return {
    users,
    filteredUsers,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    currentUser,
    setCurrentUser,
    isEditRoleDialogOpen,
    setIsEditRoleDialogOpen,
    isAdjustBalanceDialogOpen,
    setIsAdjustBalanceDialogOpen,
    isLoading,
    currentPage,
    totalPages,
    goToPage,
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage,
    handleEditRole,
    handleAdjustBalance,
    handleUpdateRole,
    handleAdjustBalanceConfirm,
    updateRoleMutation,
    adjustBalanceMutation
  };
};
