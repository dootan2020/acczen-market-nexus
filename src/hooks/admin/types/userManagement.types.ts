
export type DatabaseRoleType = 'admin' | 'user';
export type UserRoleType = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRoleType;
  balance: number;
  created_at: string;
  updated_at: string;
  discount_percentage: number;
  discount_note?: string;
  discount_updated_at?: string;
  discount_updated_by?: string;
  discount_expires_at?: string; // Added field for temporary discount expiration
  phone?: string;
}

export interface UserDiscountHistory {
  id: string;
  user_id: string;
  previous_percentage: number;
  new_percentage: number;
  changed_by: string;
  change_note?: string;
  created_at: string;
  expiry_date?: string; // Added field for expiry date
  admin?: {
    username?: string;
    full_name?: string;
    email?: string;
  };
}
