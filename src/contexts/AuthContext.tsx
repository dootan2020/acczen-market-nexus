import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: (force?: boolean) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  updateUserEmail: (email: string) => Promise<{ error?: string }>;
  refreshSession: () => Promise<void>;
  balance: number;
  userDisplayName: string;
  lastActive: Date | null;
  inactiveWarningShown: boolean;
  setInactiveWarningShown: (shown: boolean) => void;
};

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes before timeout
const MAX_LOGOUT_RETRIES = 3;
const LOGOUT_RETRY_DELAY = 1000; // 1 second

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [userDisplayName, setUserDisplayName] = useState<string>("");
  const [lastActive, setLastActive] = useState<Date | null>(null);
  const [inactiveWarningShown, setInactiveWarningShown] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateLastActive = () => {
      setLastActive(new Date());
      setInactiveWarningShown(false);
    };

    window.addEventListener('mousemove', updateLastActive);
    window.addEventListener('keypress', updateLastActive);
    window.addEventListener('click', updateLastActive);
    window.addEventListener('touchstart', updateLastActive);

    updateLastActive();

    return () => {
      window.removeEventListener('mousemove', updateLastActive);
      window.removeEventListener('keypress', updateLastActive);
      window.removeEventListener('click', updateLastActive);
      window.removeEventListener('touchstart', updateLastActive);
    };
  }, []);

  useEffect(() => {
    if (!session || !lastActive) return;

    const checkSessionTimeout = setInterval(() => {
      const now = new Date();
      const inactiveTime = now.getTime() - lastActive.getTime();

      if (inactiveTime > SESSION_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS && !inactiveWarningShown) {
        toast.warning("Phiên làm việc sắp hết hạn", {
          description: "Bạn sẽ bị đăng xuất trong 5 phút nếu không hoạt động",
          action: {
            label: "Tiếp tục",
            onClick: () => setLastActive(new Date()),
          },
          duration: 0,
        });
        setInactiveWarningShown(true);
      }

      if (inactiveTime > SESSION_TIMEOUT_MS) {
        toast.info("Phiên làm việc đã hết hạn", {
          description: "Bạn đã được đăng xuất tự động vì không hoạt động"
        });
        signOut(true);
      }
    }, 60000);

    return () => clearInterval(checkSessionTimeout);
  }, [session, lastActive, inactiveWarningShown]);

  useEffect(() => {
    const setupSessionListener = async () => {
      console.log("Khởi tạo listener phiên đăng nhập...");
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log("Auth state change:", event, currentSession?.user?.email || "No user");
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (!initialLoad) {
            if (event === 'SIGNED_IN') {
              toast.success("Đăng nhập thành công", {
                description: "Chào mừng bạn trở lại!"
              });
            } else if (event === 'SIGNED_OUT') {
              toast.success("Đăng xuất thành công", {
                description: "Hẹn gặp lại bạn sau!"
              });
            } else if (event === 'TOKEN_REFRESHED') {
              console.log("Token refreshed successfully");
            }
          }
          
          if (!currentSession?.user) {
            setIsAdmin(false);
            setBalance(0);
            setUserDisplayName("");
          }
        }
      );

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
        setTimeout(() => setInitialLoad(false), 1000);
      } catch (error) {
        console.error("Lỗi nghiêm trọng khi khởi tạo phiên đăng nhập:", error);
        setIsLoading(false);
        setInitialLoad(false);
      }

      return () => {
        console.log("Hủy đăng ký listener phiên đăng nhập");
        subscription.unsubscribe();
      };
    };

    setupSessionListener();
  }, [navigate]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          console.log("Kiểm tra thông tin người dùng:", user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('role, balance, full_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Lỗi khi kiểm tra thông tin người dùng:', error);
            throw error;
          }

          console.log("Thông tin profile:", data);
          setIsAdmin(data?.role === 'admin');
          setBalance(data?.balance || 0);
          
          const displayName = data?.full_name || 
            user.user_metadata?.full_name || 
            user.email?.split('@')[0] || 
            'Người dùng';
          setUserDisplayName(displayName);
          
        } catch (error) {
          console.error('Lỗi khi kiểm tra thông tin người dùng:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Lỗi khi làm mới phiên đăng nhập:", error);
        return;
      }
      console.log("Đã làm mới phiên đăng nhập thành công");
    } catch (error) {
      console.error("Lỗi nghiêm trọng khi làm mới phiên đăng nhập:", error);
    }
  };

  const signIn = async (email: string, password: string, remember: boolean = true) => {
    try {
      console.log("Bắt đầu quá trình đăng nhập cho:", email);
      
      const options = {
        auth: {
          persistSession: remember,
        }
      };
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Lỗi đăng nhập:', error);
        
        if (error.message.includes("Invalid login credentials")) {
          return { error: "Email hoặc mật khẩu không chính xác" };
        } else if (error.message.includes("Email not confirmed")) {
          return { error: "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn" };
        } else {
          return { error: error.message };
        }
      }
      
      console.log("Đăng nhập thành công:", data.user?.email);
      setLastActive(new Date());
      return {};
    } catch (error: any) {
      console.error('Lỗi nghiêm trọng khi đăng nhập:', error);
      return { error: error.message };
    }
  };

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
        
        if (error.message.includes("already registered")) {
          return { error: "Email này đã được đăng ký" };
        } else if (error.message.includes("password")) {
          return { error: "Mật khẩu không đủ mạnh. Vui lòng sử dụng ít nhất 8 ký tự bao gồm chữ cái, số và ký tự đặc biệt" };
        } else {
          return { error: error.message };
        }
      }
      
      console.log("Đăng ký thành công, trạng thái email:", data.user?.email_confirmed_at ? "Đã xác nhận" : "Chưa xác nhận");
      return {};
    } catch (error: any) {
      console.error('Lỗi nghiêm trọng khi đăng ký:', error);
      return { error: error.message };
    }
  };

  const signOut = async (force: boolean = false) => {
    if (!force) {
      const willLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
      if (!willLogout) return;
    }
    
    let toastId = null;
    if (!force) {
      toastId = toast.loading("Đang đăng xuất...");
    }
    
    let logoutSuccess = false;
    let retries = 0;
    
    while (!logoutSuccess && retries < MAX_LOGOUT_RETRIES) {
      try {
        console.log(`Đang đăng xuất... (lần thử ${retries + 1})`);
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          if (error.message.includes("Auth session missing")) {
            console.warn("Phiên đăng nhập không tồn tại, tiến hành xóa dữ liệu cục bộ");
            logoutSuccess = true;
          } else if (error.status === 403) {
            console.warn("Lỗi 403 từ API đăng xuất, có thể do phiên đã hết hạn");
            logoutSuccess = true;
          } else {
            console.error('Lỗi đăng xuất:', error);
            retries++;
            
            if (retries < MAX_LOGOUT_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, LOGOUT_RETRY_DELAY));
            }
          }
        } else {
          console.log("Đăng xuất thành công từ Supabase API");
          logoutSuccess = true;
        }
      } catch (error) {
        console.error('Lỗi nghiêm trọng khi đăng xuất:', error);
        retries++;
        
        if (retries < MAX_LOGOUT_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, LOGOUT_RETRY_DELAY));
        }
      }
    }
    
    try {
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setBalance(0);
      setUserDisplayName("");
      
      localStorage.removeItem('previousPath');
      
      if (toastId) {
        toast.success("Đăng xuất thành công", {
          id: toastId,
          description: "Hẹn gặp lại bạn sau!"
        });
      }
      
      navigate('/');
    } catch (cleanupError) {
      console.error('Lỗi khi xóa dữ liệu cục bộ:', cleanupError);
      
      if (toastId) {
        toast.error("Có lỗi xảy ra", {
          id: toastId,
          description: "Đã có lỗi khi đăng xuất, vui lòng làm mới trang"
        });
      }
      
      navigate('/');
    }
  };

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
    refreshSession,
    balance,
    userDisplayName,
    lastActive,
    inactiveWarningShown,
    setInactiveWarningShown,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
