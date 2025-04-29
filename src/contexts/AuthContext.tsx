
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from "sonner";
import { sendRegistrationEmail } from '@/utils/email/sendEmailNotification';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUserProfile: (data: any) => Promise<any>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => ({}),
  resetPassword: async () => ({}),
  updateUserProfile: async () => ({}),
  checkSession: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        // Fetch profile data when user changes
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Exception fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) {
        let errorMessage = error.message;
        
        // Translate common error messages
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email chưa xác nhận. Vui lòng kiểm tra hộp thư email của bạn.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
        }
        
        return { error: errorMessage };
      }

      toast.success("Đăng nhập thành công", {
        description: "Chào mừng bạn quay trở lại"
      });
      
      // Trigger profile fetch
      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return data;
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      return { error: error.message };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // Send registration confirmation email if sign-up successful
      if (data.user) {
        try {
          await sendRegistrationEmail(data.user.id);
        } catch (emailError) {
          console.error('Failed to send registration email:', emailError);
          // We don't want to fail the signup if email sending fails
        }
      }

      return data;
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Reset state
      setProfile(null);
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      return { error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        return { error: error.message };
      }
      
      toast.success("Yêu cầu khôi phục mật khẩu đã được gửi", {
        description: "Vui lòng kiểm tra email của bạn."
      });

      return data;
    } catch (error: any) {
      console.error('Reset password error:', error.message);
      return { error: error.message };
    }
  };

  const updateUserProfile = async (data: any) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update profile in the database
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      
      // Refresh profile data
      await fetchProfile(user.id);
      
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error.message);
      return { error: error.message };
    }
  };
  
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Check session error:', error);
      return false;
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
