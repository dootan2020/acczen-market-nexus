
export interface UserProfile {
  id: string;
  email: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  balance?: number;
  role: 'admin' | 'user' | 'support' | 'content_manager';
}
