
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  balance: number;
  created_at: string;
  // Add the missing properties
  avatar_url?: string;
  updated_at?: string;
}
