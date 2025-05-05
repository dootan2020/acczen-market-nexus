
import { UserProfile } from './types/userManagement.types';
import { useUserMutations } from './useUserMutations';
import { useUserFilters } from './useUserFilters';
import { useUserDialogs } from './useUserDialogs';
import { useAdminPagination } from '@/hooks/useAdminPagination';

export type { UserProfile } from './types/userManagement.types';

export const useUserManagement = () => {
  // Use our custom hooks
  const { updateRoleMutation, adjustBalanceMutation } = useUserMutations();
  
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

  // Use the filter hook
  const {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    filteredUsers
  } = useUserFilters(users);

  // Use the dialog hook
  const {
    currentUser,
    setCurrentUser,
    isEditRoleDialogOpen,
    setIsEditRoleDialogOpen,
    isAdjustBalanceDialogOpen,
    setIsAdjustBalanceDialogOpen,
    handleEditRole,
    handleAdjustBalance
  } = useUserDialogs();

  // Handler functions that use the mutations
  const handleUpdateRole = (role: UserProfile['role']) => {
    if (currentUser) {
      updateRoleMutation.mutate({ id: currentUser.id, role }, {
        onSuccess: () => setIsEditRoleDialogOpen(false)
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
      }, {
        onSuccess: () => setIsAdjustBalanceDialogOpen(false)
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
