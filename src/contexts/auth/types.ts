
import { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: any;
  isLoading: {
    get: () => boolean;
    set: (value: boolean) => void;
  };
  login: (email: string, password: string) => Promise<any>;
  logout: (redirectTo?: string) => Promise<void>;
  signOut: (redirect?: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  isAdmin: boolean;
  balance?: number;
  userDisplayName?: string;
  refreshUser: () => Promise<void>;
  updateUserEmail: (email: string) => Promise<{error: any}>;
  requestPasswordReset: (email: string) => Promise<any>;
}
