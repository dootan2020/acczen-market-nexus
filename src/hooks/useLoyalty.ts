
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  UserLoyaltyInfo, 
  LoyaltyTransaction, 
  LoyaltyTier,
  LoyaltyDiscount,
  LoyaltyPointsResponse,
  UserTierInfo
} from '@/types/loyalty';

export const useLoyalty = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoadingDiscount, setIsLoadingDiscount] = useState<boolean>(false);
  const [isProcessingPoints, setIsProcessingPoints] = useState<boolean>(false);

  // Fetch user's loyalty info
  const { data: userLoyaltyInfo, isLoading: isLoadingLoyaltyInfo, error: loyaltyError } = useQuery({
    queryKey: ['loyalty-info', user?.id],
    queryFn: async (): Promise<UserTierInfo> => {
      const response = await supabase.functions.invoke('check-user-tier');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể tải thông tin thành viên');
      }
      return response.data;
    },
    enabled: !!user,
  });

  // Calculate discount based on loyalty tier
  const calculateDiscount = async (orderAmount: number): Promise<LoyaltyDiscount> => {
    if (!user) {
      throw new Error('Người dùng chưa đăng nhập');
    }
    
    setIsLoadingDiscount(true);
    
    try {
      const response = await supabase.functions.invoke('calculate-loyalty-discount', {
        body: { orderAmount },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể tính toán giảm giá');
      }
      
      return response.data;
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tính toán giảm giá',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoadingDiscount(false);
    }
  };

  // Award loyalty points to user
  const awardPoints = async ({
    points,
    transactionType = 'earned',
    referenceId = null,
    description = null,
    userId = user?.id
  }: {
    points: number;
    transactionType?: 'earned' | 'redeemed' | 'expired' | 'adjusted';
    referenceId?: string | null;
    description?: string | null;
    userId?: string | null;
  }): Promise<LoyaltyPointsResponse> => {
    if (!user) {
      throw new Error('Người dùng chưa đăng nhập');
    }
    
    if (!userId) {
      throw new Error('Không xác định được ID người dùng');
    }
    
    setIsProcessingPoints(true);
    
    try {
      const response = await supabase.functions.invoke('award-loyalty-points', {
        body: {
          userId,
          points,
          transactionType,
          referenceId,
          description
        },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể cập nhật điểm thành viên');
      }
      
      // Refresh loyalty info
      queryClient.invalidateQueries({ queryKey: ['loyalty-info', userId] });
      
      // Show toast for tier upgrade if applicable
      if (response.data.tierUpgrade) {
        toast({
          title: 'Chúc mừng!',
          description: `Bạn đã nâng cấp từ ${response.data.tierUpgrade.previousTier} lên ${response.data.tierUpgrade.newTier}!`,
          variant: 'default',
        });
      }
      
      return response.data;
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật điểm thành viên',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsProcessingPoints(false);
    }
  };

  return {
    userLoyaltyInfo,
    isLoadingLoyaltyInfo,
    loyaltyError,
    calculateDiscount,
    isLoadingDiscount,
    awardPoints,
    isProcessingPoints,
    loyaltyDetails: userLoyaltyInfo?.loyaltyInfo || null,
    transactions: userLoyaltyInfo?.recentTransactions || [],
    allTiers: userLoyaltyInfo?.allTiers || []
  };
};
