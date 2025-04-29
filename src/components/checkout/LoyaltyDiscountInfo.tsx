
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, BadgeCheck, Star, Gift } from 'lucide-react';
import { UserLoyaltyInfo } from '@/types/loyalty';
import { useCurrencyContext } from '@/contexts/CurrencyContext';

interface LoyaltyDiscountInfoProps {
  loyaltyDiscount: number;
  loyaltyInfo: UserLoyaltyInfo | null;
  potentialPoints: number;
  isLoading?: boolean;
}

export const LoyaltyDiscountInfo: React.FC<LoyaltyDiscountInfoProps> = ({
  loyaltyDiscount,
  loyaltyInfo,
  potentialPoints,
  isLoading = false
}) => {
  const { formatUSD } = useCurrencyContext();
  
  // Get tier color
  const getTierColor = (tierName: string): string => {
    switch (tierName) {
      case 'Bronze':
        return '#CD7F32';
      case 'Silver':
        return '#C0C0C0';
      case 'Gold':
        return '#FFD700';
      case 'Platinum':
        return '#E5E4E2';
      default:
        return '#3498DB'; // Default blue
    }
  };
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-14 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!loyaltyInfo || loyaltyDiscount <= 0) {
    return null;
  }
  
  return (
    <Card className="overflow-hidden">
      <div 
        className="py-1.5 px-3 text-sm font-medium text-center"
        style={{ 
          backgroundColor: getTierColor(loyaltyInfo.current_tier_name),
          color: ['Bronze', 'Gold'].includes(loyaltyInfo.current_tier_name) ? '#000' : '#fff'
        }}
      >
        Thành viên {loyaltyInfo.current_tier_name}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-4 w-4 text-primary mr-2" />
            <span className="font-medium text-sm">Giảm giá thành viên</span>
          </div>
          <Badge variant="outline">{loyaltyInfo.current_tier_discount}%</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BadgeCheck className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700">Đã áp dụng</span>
          </div>
          <span className="text-sm font-medium">-{formatUSD(loyaltyDiscount)}</span>
        </div>
        
        {potentialPoints > 0 && (
          <div className="pt-2 border-t flex items-center justify-between">
            <div className="flex items-center">
              <Gift className="h-4 w-4 text-amber-500 mr-2" />
              <span className="text-sm">Điểm sẽ nhận được</span>
            </div>
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 text-amber-500 mr-1 fill-amber-500" />
              <span className="font-medium">{potentialPoints}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
