
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define types for our context
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  updateUserEmail: (email: string) => Promise<{ error?: string }>;
  balance: number;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    // Set up the session listener
    const setupSessionListener = async () => {
      console.log("Khởi tạo listener phiên đăng nhập...");
      
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          console.log("Auth state change:", event, currentSession?.user?.email || "No user");
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // If user is logged out, reset admin status
          if (!currentSession?.user) {
            setIsAdmin(false);
            setBalance(0);
          }
        }
      );

      // THEN check for existing session
      try {
        console.log("Kiểm tra phiên đăng nhập hiện tại...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Lỗi khi lấy phiên đăng nhập:", error);
          toast.error("Lỗi xác thực", {
            description: "Không thể lấy thông tin phiên đăng nhập, vui lòng làm mới trang"
          });
        } else {
          console.log("Kết quả phiên đăng nhập:", currentSession ? "Đã đăng nhập" : "Chưa đăng nhập");
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi nghiêm trọng khi khởi tạo phiên đăng nhập:", error);
        setIsLoading(false);
      }

      // Cleanup function
      return () => {
        console.log("Hủy đăng ký listener phiên đăng nhập");
        subscription.unsubscribe();
      };
    };

    setupSessionListener();
  }, []);

  // Check if the user is an admin when the user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          console.log("Kiểm tra thông tin người dùng:", user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('role, balance')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Lỗi khi kiểm tra trạng thái admin:', error);
            throw error;
          }

          console.log("Thông tin profile:", data);
          setIsAdmin(data?.role === 'admin');
          setBalance(data?.balance || 0);
        } catch (error) {
          console.error('Lỗi khi kiểm tra trạng thái admin:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Bắt đầu quá trình đăng nhập cho:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Lỗi đăng nhập:', error);
        return { error: error.message };
      }
      
      console.log("Đăng nhập thành công:", data.user?.email);
      return {};
    } catch (error: any) {
      console.error('Lỗi nghiêm trọng khi đăng nhập:', error);
      return { error: error.message };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log("Bắt đầu quá trình đăng ký cho:", email);
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
        console.error('Lỗi đăng ký:', error);
        return { error: error.message };
      }
      
      console.log("Đăng ký thành công, trạng thái email:", data.user?.email_confirmed_at ? "Đã xác nhận" : "Chưa xác nhận");
      return {};
    } catch (error: any) {
      console.error('Lỗi nghiêm trọng khi đăng ký:', error);
      return { error: error.message };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log("Đang đăng xuất...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Lỗi đăng xuất:', error);
        toast.error("Lỗi đăng xuất", {
          description: error.message
        });
      } else {
        console.log("Đăng xuất thành công");
        toast.success("Đăng xuất thành công");
      }
    } catch (error) {
      console.error('Lỗi nghiêm trọng khi đăng xuất:', error);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      console.log("Đặt lại mật khẩu cho:", email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Lỗi đặt lại mật khẩu:', error);
        return { error: error.message };
      }

      console.log("Email đặt lại mật khẩu đã được gửi");
      return {};
    } catch (error: any) {
      console.error('Lỗi nghiêm trọng khi đặt lại mật khẩu:', error);
      return { error: error.message };
    }
  };

  // Update password function
  const updatePassword = async (password: string) => {
    try {
      console.log("Đang cập nhật mật khẩu...");
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error('Lỗi cập nhật mật khẩu:', error);
        return { error: error.message };
      }

      console.log("Cập nhật mật khẩu thành công");
      return {};
    } catch (error: any) {
      console.error('Lỗi nghiêm trọng khi cập nhật mật khẩu:', error);
      return { error: error.message };
    }
  };

  // Update email function
  const updateUserEmail = async (email: string) => {
    try {
      console.log("Đang cập nhật email thành:", email);
      const { error } = await supabase.auth.updateUser({
        email,
      });

      if (error) {
        console.error('Lỗi cập nhật email:', error);
        return { error: error.message };
      }

      console.log("Yêu cầu cập nhật email thành công, cần xác nhận qua email");
      return {};
    } catch (error: any) {
      console.error('Lỗi nghiêm trọng khi cập nhật email:', error);
      return { error: error.message };
    }
  };

  const value = {
    session,
    user,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateUserEmail,
    balance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
