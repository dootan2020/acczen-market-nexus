import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserProfile } from './types/userManagement.types';

// Use the UserProfile['role'] type to ensure consistency
type UserRoleType = UserProfile['role'];

export const useUserMutations = () => {
  const queryClient = useQueryClient();

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: UserRoleType }) => {
      // We need to cast the role to string to match the Supabase enum type
      // This ensures compatibility with both our TypeScript types and the database
      const { error } = await supabase
        .from('profiles')
        .update({ role: role as string })
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
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to adjust user balance',
      });
    },
  });

  return {
    updateRoleMutation,
    adjustBalanceMutation
  };
};
