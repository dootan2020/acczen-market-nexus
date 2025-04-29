
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, Gift, Star } from "lucide-react";
import { UserLoyaltyInfo } from '@/types/loyalty';

interface LoyaltyStatusCardProps {
  loyaltyInfo: UserLoyaltyInfo | null;
  isLoading?: boolean;
}

export const LoyaltyStatusCard: React.FC<LoyaltyStatusCardProps> = ({ 
  loyaltyInfo, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card className="w-full h-[180px] animate-pulse bg-muted/40">
        <CardContent className="flex justify-center items-center h-full">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (!loyaltyInfo) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Thành viên</CardTitle>
          <CardDescription>
            Đăng nhập để xem cấp độ thành viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Award className="h-12 w-12 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to get tier color
  const getTierColor = (tierName: string): string => {
    switch (tierName) {
      case 'Bronze':
        return 'bg-[#CD7F32] text-white';
      case 'Silver':
        return 'bg-[#C0C0C0] text-black';
      case 'Gold':
        return 'bg-[#FFD700] text-black';
      case 'Platinum':
        return 'bg-[#E5E4E2] text-black';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Thành viên</CardTitle>
            <CardDescription>
              Cấp độ hiện tại của bạn
            </CardDescription>
          </div>
          <Badge className={`${getTierColor(loyaltyInfo.current_tier_name)}`}>
            {loyaltyInfo.current_tier_name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-amber-400 mr-2" />
            <span className="text-sm font-medium">Điểm hiện tại:</span>
          </div>
          <span className="font-bold text-lg">{loyaltyInfo.loyalty_points}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Gift className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium">Giảm giá:</span>
          </div>
          <span className="font-bold text-lg">{loyaltyInfo.current_tier_discount}%</span>
        </div>

        {loyaltyInfo.next_tier_name && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Tiến trình lên hạng {loyaltyInfo.next_tier_name}</span>
              <span className="text-xs">{loyaltyInfo.points_to_next_tier} điểm nữa</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ 
                  width: `${Math.max(0, Math.min(100, ((loyaltyInfo.loyalty_points - (loyaltyInfo.next_tier_min_points! - loyaltyInfo.points_to_next_tier)) / loyaltyInfo.points_to_next_tier) * 100))}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>

      {loyaltyInfo.current_tier_perks && loyaltyInfo.current_tier_perks.length > 0 && (
        <CardFooter className="border-t pt-3 pb-1">
          <div className="w-full">
            <p className="text-xs text-muted-foreground mb-2">Đặc quyền hiện có:</p>
            <div className="flex flex-wrap gap-1">
              {loyaltyInfo.current_tier_perks.map((perk, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs">
                        {perk}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{perk}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
