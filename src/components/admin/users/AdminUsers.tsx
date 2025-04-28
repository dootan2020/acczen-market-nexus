
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { EditRoleDialog } from '@/components/admin/users/EditRoleDialog';
import { AdjustBalanceDialog } from '@/components/admin/users/AdjustBalanceDialog';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { UsersFilter } from '@/components/admin/users/UsersFilter';
import { useUserManagement } from '@/hooks/admin/useUserManagement';
import { UsersPagination } from '@/components/admin/users/UsersPagination';

const AdminUsers = () => {
  const { 
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
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage,
    handleEditRole,
    handleAdjustBalance,
    handleUpdateRole,
    handleAdjustBalanceConfirm
  } = useUserManagement();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>
      
      <UsersFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <UsersTable 
                users={filteredUsers || []}
                onEditRole={handleEditRole}
                onAdjustBalance={handleAdjustBalance}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <UsersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
      
      <EditRoleDialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
        onConfirm={handleUpdateRole}
        isLoading={false} // This will be handled by the mutation in the hook
        currentUser={currentUser}
      />
      
      <AdjustBalanceDialog
        open={isAdjustBalanceDialogOpen}
        onOpenChange={setIsAdjustBalanceDialogOpen}
        onConfirm={handleAdjustBalanceConfirm}
        isLoading={false} // This will be handled by the mutation in the hook
        currentUser={currentUser}
      />
    </div>
  );
};

export default AdminUsers;
