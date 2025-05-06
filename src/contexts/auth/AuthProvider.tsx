
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { AuthContextType } from './types';

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
    const fetchSession = async () => {
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

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Update admin status and profile data when auth state changes
      if (session?.user) {
        const isAdminUser = session.user.user_metadata?.admin_role === 'admin';
        setIsAdmin(isAdminUser);
        
        // Fetch profile data using a Promise.resolve wrapper to ensure catch works
        Promise.resolve(
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
        )
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      return Promise.resolve();
    } catch (error) {
      console.error('Error signing out:', error);
      return Promise.resolve();
    } finally {
      isLoading.set(false);
    }
  };

  // SignOut function (alias for logout with redirect flag)
  const signOut = async (redirect = true): Promise<void> => {
    try {
      isLoading.set(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      
      if (redirect && navigate) {
        navigate('/login');
      }
      return Promise.resolve(); // Explicitly return a resolved Promise
    } catch (error) {
      console.error('Error signing out:', error);
      return Promise.resolve(); // Always return a Promise that won't throw
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
