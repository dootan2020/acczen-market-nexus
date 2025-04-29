import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/ui-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (args: any) => Promise<any>;
  logout: () => Promise<void>;
  register: (args: any) => Promise<any>;
  requestPasswordReset: (email: string) => Promise<any>;
  resetPassword: (accessToken: string, newPassword: string) => Promise<any>;
  balance: number;
  role: string;
  username: string;
  fullName: string;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Update the AuthProvider component to include a refreshUser function
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [role, setRole] = useState<string>('user');
  const [username, setUsername] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const navigate = useNavigate();

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
        loadSession();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setBalance(0);
        setRole('user');
        setUsername('');
        setFullName('');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const login = async (args: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(args);
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (args: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp(args);
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      navigate('/');
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

  const resetPassword = async (accessToken: string, newPassword: string) => {
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
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    balance,
    role,
    username,
    fullName,
    refreshUser, // Add the refreshUser function to the context value
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
