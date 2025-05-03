
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Define the Auth context type
interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;  
  login: (args: any) => Promise<any>;
  logout: () => Promise<void>;
  register: (args: any) => Promise<any>;
  requestPasswordReset: (email: string) => Promise<any>;
  resetPassword: (newPassword: string) => Promise<any>;
  balance: number;
  role: string;
  username: string;
  fullName: string;
  userDisplayName: string;
  refreshUser: () => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  signOut: (redirect?: boolean) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  updateUserEmail: (email: string) => Promise<{error: any | null}>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Props interface for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [role, setRole] = useState<string>('user');
  const [username, setUsername] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  // User display name getter
  const userDisplayName = user ? fullName || username || user.email?.split('@')[0] || 'User' : '';

  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Fetch the user profile data including balance
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (error) throw error;

            setUser(user);
            setIsAuthenticated(true);
            setBalance(profile?.balance || 0);
            setRole(profile?.role || 'user');
            setUsername(profile?.username || '');
            setFullName(profile?.full_name || '');
            // Set admin status based on role or metadata
            setIsAdmin(profile?.role === 'admin' || Boolean(user.user_metadata?.admin_type));
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // Use setTimeout to prevent potential deadlocks with onAuthStateChange
        setTimeout(() => {
          loadSession();
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setBalance(0);
        setRole('user');
        setUsername('');
        setFullName('');
        setIsAdmin(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // Legacy method - keep for backward compatibility
  const login = async (args: any) => {
    return signIn(args.email, args.password);
  };

  // New method with clearer naming
  const signIn = async (email: string, password: string, rememberMe = true) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Login failed:', error);
      return { error: error.message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy method - keep for backward compatibility
  const register = async (args: any) => {
    return signUp(args.email, args.password, args.fullName);
  };

  // New method with clearer naming
  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined
        }
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Registration failed:', error);
      return { error: error.message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy method - keep for backward compatibility
  const logout = async () => {
    return signOut();
  };

  // New method with clearer naming
  const signOut = async (redirect: boolean = false) => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      if (redirect) {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Request password reset failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Reset password failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      return { error };
    } catch (error: any) {
      console.error('Email update failed:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch the user profile data including balance
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // Update the state with the fresh user data
        setUser(user);
        setIsAuthenticated(true);
        setBalance(profile?.balance || 0);
        setRole(profile?.role || 'user');
        setUsername(profile?.username || '');
        setFullName(profile?.full_name || '');
        setIsAdmin(profile?.role === 'admin' || Boolean(user.user_metadata?.admin_type));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  // Create context value object
  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    balance,
    role,
    username,
    fullName,
    userDisplayName,
    refreshUser,
    signIn,
    signOut,
    signUp,
    updateUserEmail
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
