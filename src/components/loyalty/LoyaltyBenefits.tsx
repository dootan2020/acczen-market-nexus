
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { LoyaltyTier } from '@/types/loyalty';

interface LoyaltyBenefitsProps {
  allTiers: LoyaltyTier[];
  currentTierName: string | null;
  isLoading?: boolean;
}

export const LoyaltyBenefits: React.FC<LoyaltyBenefitsProps> = ({ 
  allTiers, 
  currentTierName,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted/60 rounded w-full"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (allTiers.length === 0) {
    return null;
  }

  // Sort tiers by min_points
  const sortedTiers = [...allTiers].sort((a, b) => a.min_points - b.min_points);
  
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

  // Collect all unique benefits across tiers
  const allBenefits = new Set<string>();
  sortedTiers.forEach(tier => {
    tier.special_perks.forEach(perk => {
      allBenefits.add(perk);
    });
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Lợi ích thành viên</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-medium pb-2 pr-4">Lợi ích</th>
                {sortedTiers.map(tier => (
                  <th 
                    key={tier.id} 
                    className="text-center pb-2 px-4 whitespace-nowrap"
                    style={{ 
                      color: tier.name === currentTierName ? getTierColor(tier.name) : ''
                    }}
                  >
                    {tier.name}
                    {tier.name === currentTierName && (
                      <span className="ml-1">✓</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Discount row */}
              <tr className="border-t">
                <td className="py-2 pr-4 font-medium">Giảm giá</td>
                {sortedTiers.map(tier => (
                  <td 
                    key={tier.id} 
                    className={`text-center py-2 px-4 ${tier.name === currentTierName ? 'font-bold' : ''}`}
                  >
                    {tier.discount_percentage}%
                  </td>
                ))}
              </tr>
              
              {/* Special perks rows */}
              {Array.from(allBenefits).map((benefit, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 pr-4 font-medium">{benefit}</td>
                  {sortedTiers.map(tier => (
                    <td key={tier.id} className="text-center py-2 px-4">
                      {tier.special_perks.includes(benefit) ? (
                        <CheckCircle 
                          className={`h-4 w-4 mx-auto ${tier.name === currentTierName ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Min points row */}
              <tr className="border-t">
                <td className="py-2 pr-4 font-medium">Điểm tối thiểu</td>
                {sortedTiers.map(tier => (
                  <td 
                    key={tier.id} 
                    className={`text-center py-2 px-4 ${tier.name === currentTierName ? 'font-bold' : ''}`}
                  >
                    {tier.min_points}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
