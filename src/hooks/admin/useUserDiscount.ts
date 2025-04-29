
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from './types/userManagement.types';

export type DiscountHistoryItem = {
  id: string;
  user_id: string;
  previous_percentage: number;
  new_percentage: number;
  changed_by: string;
  change_note: string;
  created_at: string;
  expiry_date?: string; // Added for temporary discount
  admin?: {
    username?: string;
    full_name?: string;
    email?: string;
  };
};

export interface SetDiscountParams {
  userId: string;
  discountPercentage: number;
  discountNote?: string;
  expiryDate?: Date | null; // Added for temporary discount
}

export const useUserDiscount = (userId?: string) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get user's current discount
  const {
    data: userDiscount,
    isLoading: isLoadingDiscount,
    error: discountError,
  } = useQuery({
    queryKey: ['user-discount', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('discount_percentage, discount_note, discount_updated_at, discount_updated_by, discount_expires_at')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Get user's discount history
  const {
    data: discountHistory,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: ['user-discount-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('discount_history')
        .select(`
          *,
          admin:changed_by(username, full_name, email)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as DiscountHistoryItem[];
    },
    enabled: !!userId,
  });

  // Set user discount mutation
  const setDiscountMutation = useMutation({
    mutationFn: async ({ userId, discountPercentage, discountNote, expiryDate }: SetDiscountParams) => {
      const { data, error } = await supabase.functions.invoke('set-user-discount', {
        body: {
          userId,
          discountPercentage,
          discountNote,
          expiresAt: expiryDate ? expiryDate.toISOString() : null,
        },
      });
      
      if (error || !data.success) {
        throw new Error(error?.message || data?.error || 'Failed to update discount');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-discount', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-discount-history', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['discount-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['discount-distribution'] });
      queryClient.invalidateQueries({ queryKey: ['discount-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['top-discounted-users'] });
      queryClient.invalidateQueries({ queryKey: ['discount-summary'] });

      toast.success('Discount updated successfully');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update discount', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });

  // Calculate discount amount
  const calculateDiscount = async (amount: number, userIdToUse?: string) => {
    const targetUserId = userIdToUse || userId;
    
    if (!targetUserId) {
      return { discountAmount: 0, discountPercentage: 0, finalAmount: amount };
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('calculate-user-discount', {
        body: {
          userId: targetUserId,
          amount,
        },
      });
      
      if (error || !data.success) {
        throw new Error(error?.message || data?.error || 'Failed to calculate discount');
      }
      
      return {
        discountAmount: data.discountAmount,
        discountPercentage: data.discountPercentage,
        finalAmount: data.finalAmount,
      };
    } catch (error) {
      console.error('Error calculating discount:', error);
      return { discountAmount: 0, discountPercentage: 0, finalAmount: amount };
    }
  };

  return {
    userDiscount,
    discountHistory,
    isLoadingDiscount,
    isLoadingHistory,
    discountError,
    historyError,
    setDiscountMutation,
    calculateDiscount,
    isDialogOpen,
    setIsDialogOpen,
  };
};
