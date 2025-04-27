
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { EditRoleDialog } from '@/components/admin/users/EditRoleDialog';
import { AdjustBalanceDialog } from '@/components/admin/users/AdjustBalanceDialog';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { UsersFilter } from '@/components/admin/users/UsersFilter';
import { useAdminPagination } from '@/hooks/useAdminPagination';

type UserRole = 'user' | 'admin';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  balance: number;
  created_at: string;
}

const AdminUsers = () => {
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

  // Filter users by search query and role
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <UsersTable 
                    users={filteredUsers || []}
                    onEditRole={handleEditRole}
                    onAdjustBalance={handleAdjustBalance}
                  />
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevPage}
              disabled={!hasPrevPage}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Dialogs */}
      <EditRoleDialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
        onConfirm={handleUpdateRole}
        isLoading={updateRoleMutation.isPending}
        currentUser={currentUser}
      />
      
      <AdjustBalanceDialog
        open={isAdjustBalanceDialogOpen}
        onOpenChange={setIsAdjustBalanceDialogOpen}
        onConfirm={handleAdjustBalanceConfirm}
        isLoading={adjustBalanceMutation.isPending}
        currentUser={currentUser}
      />
    </div>
  );
};

export default AdminUsers;
