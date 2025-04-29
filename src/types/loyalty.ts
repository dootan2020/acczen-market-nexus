
export interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  discount_percentage: number;
  special_perks: string[];
  icon_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserLoyaltyInfo {
  user_id: string;
  loyalty_points: number;
  current_tier_name: string;
  current_tier_discount: number;
  current_tier_perks: string[];
  current_tier_icon: string;
  next_tier_name: string | null;
  next_tier_min_points: number | null;
  points_to_next_tier: number;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface TierUpgrade {
  previousTier: string;
  newTier: string;
}

export interface LoyaltyDiscount {
  success: boolean;
  discount: number;
  loyaltyInfo: UserLoyaltyInfo | null;
  potentialPoints: number;
}

export interface LoyaltyPointsResponse {
  success: boolean;
  transactionId: string;
  loyaltyInfo: UserLoyaltyInfo | null;
  tierUpgrade: TierUpgrade | null;
}

export interface UserTierInfo {
  success: boolean;
  loyaltyInfo: UserLoyaltyInfo | null;
  recentTransactions: LoyaltyTransaction[];
  allTiers: LoyaltyTier[];
}
