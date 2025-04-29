
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { sendRegistrationEmail, sendPasswordResetEmail } from '@/utils/email/sendEmailNotification';

export interface AuthContextType {
  signUp: (email: string, password: string, metadata?: any) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ session: Session | null; error: Error | null }>;
  signOut: () => Promise<void>;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  balance: number;
  userDisplayName: string;
  updateUserEmail: (email: string) => Promise<{ user: User | null; error: Error | null }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType>({
  signUp: async () => ({ user: null, error: null }),
  signIn: async () => ({ session: null, error: null }),
  signOut: async () => {},
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  balance: 0,
  userDisplayName: '',
  updateUserEmail: async () => ({ user: null, error: null }),
  resetPassword: async () => ({ success: false, error: null }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userDisplayName, setUserDisplayName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const setData = async (session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setIsAdmin(profileData.role === 'admin');
          setBalance(profileData.balance || 0);
          setUserDisplayName(profileData.full_name || profileData.username || session.user.email || '');
        }
      } else {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setBalance(0);
        setUserDisplayName('');
      }
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setData(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setData(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Send welcome email
      if (data.user) {
        // Note: The registration email will be sent after the user is created in the database
        // via the handle_new_user trigger, so we can send it here directly
        await sendRegistrationEmail(data.user.id);
      }
      
      return { user: data.user, error: null };
    } catch (error: any) {
      toast.error(`Sign up failed: ${error.message}`);
      return { user: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const previousPath = localStorage.getItem('previousPath');
      if (previousPath) {
        localStorage.removeItem('previousPath');
        navigate(previousPath);
      }

      return { session: data.session, error: null };
    } catch (error: any) {
      toast.error(`Sign in failed: ${error.message}`);
      return { session: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      toast.error(`Sign out failed: ${error.message}`);
    }
  };

  const updateUserEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;
      
      toast.success('Email updated successfully! Please check your inbox to confirm the change.');
      
      return { user: data.user, error: null };
    } catch (error: any) {
      toast.error(`Email update failed: ${error.message}`);
      return { user: null, error };
    }
  };

  // Function to handle password reset
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) throw error;
      
      // We don't need to call sendPasswordResetEmail here since Supabase
      // already sends a reset email. Our function would be used for custom templates.
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    session,
    isLoading,
    isAdmin,
    balance,
    userDisplayName,
    updateUserEmail,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
