
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { UserLoyaltyInfo, LoyaltyTier } from '@/types/loyalty';

interface LoyaltyTierProgressProps {
  loyaltyInfo: UserLoyaltyInfo | null;
  allTiers: LoyaltyTier[];
  isLoading?: boolean;
}

export const LoyaltyTierProgress: React.FC<LoyaltyTierProgressProps> = ({
  loyaltyInfo,
  allTiers,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="w-full space-y-2 animate-pulse">
        <div className="h-6 bg-muted rounded-md"></div>
        <div className="h-10 bg-muted rounded-md"></div>
      </div>
    );
  }

  if (!loyaltyInfo || allTiers.length === 0) {
    return null;
  }

  // Sort tiers by min_points
  const sortedTiers = [...allTiers].sort((a, b) => a.min_points - b.min_points);
  
  // Get current user tier and current points
  const currentPoints = loyaltyInfo.loyalty_points;
  const currentTierName = loyaltyInfo.current_tier_name;
  
  // Find the highest tier min_points for calculating progress percentage
  const highestTierPoints = sortedTiers[sortedTiers.length - 1].min_points;
  
  // Calculate progress as percentage of the highest tier
  const progressPercentage = Math.min(100, (currentPoints / highestTierPoints) * 100);

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

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Tiến trình thành viên:</span>
        <span className="text-sm">{currentPoints} điểm</span>
      </div>
      
      <div className="relative pt-4 pb-8">
        <Progress value={progressPercentage} className="h-2" />
        
        {/* Tier markers */}
        {sortedTiers.map((tier, index) => {
          // Calculate position as percentage
          const position = Math.min(100, (tier.min_points / highestTierPoints) * 100);
          const isCurrent = tier.name === currentTierName;
          const tierColor = getTierColor(tier.name);
          
          return (
            <div 
              key={tier.id}
              className="absolute top-3 transform -translate-x-1/2"
              style={{ 
                left: `${position}%`,
                zIndex: isCurrent ? 10 : 5
              }}
            >
              {/* Tier marker */}
              <div
                className={`
                  w-3 h-3 rounded-full ${isCurrent ? 'ring-2 ring-offset-2' : ''}
                `}
                style={{ 
                  backgroundColor: tierColor,
                  boxShadow: isCurrent ? '0 0 0 2px white' : 'none',
                  // Removed ringColor property as it's not valid
                }}
              ></div>
              
              {/* Tier name */}
              <span 
                className={`
                  absolute text-xs ${index === 0 ? 'left-0' : index === sortedTiers.length - 1 ? 'right-0 -translate-x-full' : '-translate-x-1/2'} 
                  mt-1 whitespace-nowrap ${isCurrent ? 'font-bold' : 'text-gray-500'}
                `}
              >
                {tier.name}{isCurrent && ' ✓'}
                {index !== sortedTiers.length - 1 && (
                  <span className="block text-[10px]">{tier.min_points}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
