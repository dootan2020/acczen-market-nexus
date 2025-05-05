
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile, DatabaseRoleType } from './types/userManagement.types';

// Use the UserProfile['role'] type to ensure consistency
type UserRoleType = UserProfile['role'];

export const useUserMutations = () => {
  const queryClient = useQueryClient();

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: UserRoleType }) => {
      // Safe casting between frontend and database role types
      // First check if the role is compatible with the database
      if (role !== 'admin' && role !== 'user') {
        throw new Error(`Role "${role}" is not supported in the database. Only "admin" and "user" roles are allowed.`);
      }
      
      // Now we can safely cast to the database type
      const dbRole: DatabaseRoleType = role;
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: dbRole })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
          amount: operation === 'add' ? amount : -amount,
          description: notes || `Manual balance ${operation === 'add' ? 'increase' : 'decrease'} by admin`
        });
      
      if (transactionError) throw transactionError;
      
      return { success: true, newBalance };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(`User balance has been ${variables.operation === 'add' ? 'increased' : 'decreased'} successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to adjust user balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update user discount mutation
  const updateDiscountMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      discount_percentage, 
      discount_note,
      expiry_date
    }: { 
      userId: string, 
      discount_percentage: number, 
      discount_note?: string,
      expiry_date?: string | null
    }) => {
      // Call the admin_update_user_discount function
      const { error } = await supabase
        .rpc('admin_update_user_discount', { 
          p_user_id: userId, 
          p_discount_percentage: discount_percentage, 
          p_discount_note: discount_note || null,
          p_expires_at: expiry_date || null
        });
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User discount updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update discount: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    updateRoleMutation,
    adjustBalanceMutation,
    updateDiscountMutation
  };
};
