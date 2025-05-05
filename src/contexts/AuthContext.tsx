import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

// Define the AuthContext type
interface AuthContextType {
  user: any;
  isLoading: {
    get: () => boolean;
    set: (value: boolean) => void;
  };
  login: (email: string, password: string) => Promise<any>;
  logout: (redirectTo?: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<any>;
}

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useNavigate();

  // Create a state object with getter and setter
  const isLoading = {
    get: () => loading,
    set: (value: boolean) => setLoading(value),
  };

  useEffect(() => {
    const session = async () => {
      isLoading.set(true);
      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      isLoading.set(false);
    };

    session();

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, [isLoading]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      isLoading.set(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Login failed:', error);
        throw error;
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      isLoading.set(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      isLoading.set(true);
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Sign up failed:', error);
        throw error;
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      isLoading.set(false);
    }
  };

  // Logout function
  const logout = async (redirectTo = '/login') => {
    try {
      isLoading.set(true);
      await supabase.auth.signOut({redirectTo});
      router.navigate(redirectTo);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      isLoading.set(false);
    }
  };

  // Provide the context value
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
