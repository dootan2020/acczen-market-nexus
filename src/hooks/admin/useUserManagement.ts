
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from './types/userManagement.types';
import { useUserMutations } from './useUserMutations';
import { useUserFilters } from './useUserFilters';

export const useUserManagement = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);

  // For backwards compatibility with the AdminUsers component
  const isEditRoleDialogOpen = isEditDialogOpen;
  const setIsEditRoleDialogOpen = setIsEditDialogOpen;
  const isAdjustBalanceDialogOpen = isBalanceDialogOpen;
  const setIsAdjustBalanceDialogOpen = setIsBalanceDialogOpen;

  // Fetch users with pagination
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', currentPage, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      const { data, count, error } = await query;
      
      if (error) throw error;
      
      return {
        users: data as UserProfile[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    }
  });

  // Get mutations
  const { updateRoleMutation, adjustBalanceMutation, updateDiscountMutation } = useUserMutations();

  // Use filters
  const { 
    searchQuery, 
    setSearchQuery, 
    roleFilter, 
    setRoleFilter, 
    filteredUsers 
  } = useUserFilters(usersData?.users);

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
  
  // Helper to determine if there are next/previous pages
  const hasNextPage = usersData ? currentPage < usersData.totalPages : false;
  const hasPrevPage = currentPage > 1;

  // Dialog handlers
  const handleEditRole = (user: UserProfile) => {
    setCurrentUser(user);
    setIsEditDialogOpen(true);
  };

  const handleAdjustBalance = (user: UserProfile) => {
    setCurrentUser(user);
    setIsBalanceDialogOpen(true);
  };

  const handleUpdateDiscount = ({
    userId,
    discount_percentage,
    discount_note,
    expiry_date
  }: {
    userId: string,
    discount_percentage: number,
    discount_note?: string,
    expiry_date?: string
  }) => {
    updateDiscountMutation.mutate({
      userId,
      discount_percentage,
      discount_note,
      expiry_date
    });
  };

  // For backwards compatibility with the AdminUsers component
  const handleUpdateRole = (role: 'admin' | 'user') => {
    if (currentUser) {
      updateRoleMutation.mutate({
        id: currentUser.id,
        role
      });
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
    users: usersData?.users || [],
    filteredUsers,
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
    // For backwards compatibility with AdminUsers component
    isEditRoleDialogOpen,
    setIsEditRoleDialogOpen,
    isAdjustBalanceDialogOpen,
    setIsAdjustBalanceDialogOpen,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    handleEditRole,
    handleAdjustBalance,
    handleUpdateDiscount,
    handleUpdateRole,
    handleAdjustBalanceConfirm,
    updateRoleMutation,
    adjustBalanceMutation,
    updateDiscountMutation
  };
};
