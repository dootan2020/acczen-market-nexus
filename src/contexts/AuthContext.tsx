
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

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const [userDisplayName, setUserDisplayName] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  // Create a state object with getter and setter
  const isLoading = {
    get: () => loading,
    set: (value: boolean) => setLoading(value),
  };

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      isLoading.set(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Check if user is admin
        const isAdminUser = session.user.user_metadata?.admin_role === 'admin';
        setIsAdmin(isAdminUser);
        
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          setBalance(profileData.balance || 0);
          setUserDisplayName(profileData.full_name || session.user.email);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setBalance(undefined);
        setUserDisplayName(undefined);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      isLoading.set(false);
    }
  };

  useEffect(() => {
    const session = async () => {
      isLoading.set(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        
        // Check if user is admin
        const isAdminUser = session.user.user_metadata?.admin_role === 'admin';
        setIsAdmin(isAdminUser);
        
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          setBalance(profileData.balance || 0);
          setUserDisplayName(profileData.full_name || session.user.email);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      isLoading.set(false);
    };

    session();

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Update admin status and profile data when auth state changes
      if (session?.user) {
        const isAdminUser = session.user.user_metadata?.admin_role === 'admin';
        setIsAdmin(isAdminUser);
        
        // Fetch profile data
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setBalance(data.balance || 0);
              setUserDisplayName(data.full_name || session.user.email);
            }
          })
          .catch(err => {
            console.error('Error fetching profile:', err);
          });
      } else {
        setIsAdmin(false);
        setBalance(undefined);
        setUserDisplayName(undefined);
      }
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

  // Sign in function (alias for login)
  const signIn = login;

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
      await supabase.auth.signOut();
      if (navigate) {
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      isLoading.set(false);
    }
  };

  // SignOut function (alias for logout with redirect flag)
  const signOut = async (redirect = true) => {
    try {
      isLoading.set(true);
      await supabase.auth.signOut();
      if (redirect && navigate) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      isLoading.set(false);
    }
  };

  // Update user email
  const updateUserEmail = async (email: string) => {
    try {
      isLoading.set(true);
      const { error } = await supabase.auth.updateUser({ email });
      return { error };
    } catch (error) {
      console.error('Error updating email:', error);
      return { error };
    } finally {
      isLoading.set(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    try {
      isLoading.set(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
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
    signOut,
    signIn,
    signUp,
    isAdmin,
    balance,
    userDisplayName,
    refreshUser,
    updateUserEmail,
    requestPasswordReset
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
