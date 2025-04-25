
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Reset error message when inputs change
  useEffect(() => {
    if (errorMessage) setErrorMessage(null);
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Lỗi đăng nhập", {
        description: "Vui lòng nhập email và mật khẩu"
      });
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Đang thực hiện đăng nhập với:", { email });
      const result = await signIn(email, password);
      
      if (result?.error) {
        console.error("Login error details:", result.error);
        
        // Xử lý các loại lỗi cụ thể
        if (result.error.includes("Invalid login credentials")) {
          setErrorMessage("Email hoặc mật khẩu không chính xác");
        } else if (result.error.includes("Email not confirmed")) {
          setErrorMessage("Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn");
        } else {
          setErrorMessage(result.error);
        }
        
        toast.error("Lỗi đăng nhập", {
          description: result.error
        });
      } else {
        // Đăng nhập thành công
        console.log("Đăng nhập thành công, redirect đến trang chủ");
        toast.success("Đăng nhập thành công", {
          description: "Chào mừng bạn trở lại!"
        });
        navigate("/");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại";
      console.error("Login error:", error);
      setErrorMessage(errorMessage);
      toast.error("Lỗi đăng nhập", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setTestingConnection(true);
    try {
      console.log("Kiểm tra kết nối Supabase...");
      console.log("URL Supabase:", supabase.supabaseUrl);
      
      // Thử kết nối đơn giản để kiểm tra
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error("Lỗi kết nối:", error);
        toast.error("Không thể kết nối với Supabase", {
          description: error.message
        });
      } else {
        console.log("Kết nối thành công:", data);
        toast.success("Kết nối Supabase thành công", {
          description: "API kết nối đang hoạt động bình thường"
        });
      }
    } catch (error) {
      console.error("Lỗi kiểm tra kết nối:", error);
      toast.error("Lỗi kết nối", {
        description: error instanceof Error ? error.message : "Không thể kết nối với server"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl">
            <Package className="h-8 w-8 text-primary" />
            <span>AccZen<span className="text-secondary">.net</span></span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập tài khoản</CardTitle>
            <CardDescription>
              Nhập email và mật khẩu để truy cập vào tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link to="/reset-password" className="text-xs text-primary hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={testSupabaseConnection}
                disabled={testingConnection}
              >
                {testingConnection ? "Đang kiểm tra..." : "Kiểm tra kết nối Supabase"}
              </Button>
              
              <div className="text-center text-sm">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Đăng ký
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
