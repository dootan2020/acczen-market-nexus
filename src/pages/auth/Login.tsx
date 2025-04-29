
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the previous path from localStorage or default to home
  const getPreviousPath = () => {
    const previousPath = localStorage.getItem('previousPath');
    localStorage.removeItem('previousPath'); // Clear it after use
    return previousPath || '/';
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(getPreviousPath());
    }
  }, [user, navigate]);

  // Reset error message when inputs change
  useEffect(() => {
    if (errorMessage) setErrorMessage(null);
  }, [email, password]);

  // Check if maximum login attempts reached
  useEffect(() => {
    if (loginAttempts >= 5) {
      setErrorMessage("Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.");
      const timeout = setTimeout(() => {
        setLoginAttempts(0);
        setErrorMessage(null);
      }, 15 * 60 * 1000); // 15 minutes
      
      return () => clearTimeout(timeout);
    }
  }, [loginAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginAttempts >= 5) {
      return;
    }
    
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
        setLoginAttempts(prev => prev + 1);
        
        // Handle specific error types
        setErrorMessage(result.error.message || "Đăng nhập thất bại");
        
        toast.error("Lỗi đăng nhập", {
          description: result.error.message || "Đăng nhập thất bại"
        });
      } else {
        // Success is handled by AuthContext
        // Navigate to the previous page or home
        navigate(getPreviousPath());
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại";
      console.error("Login error:", error);
      setErrorMessage(errorMsg);
      setLoginAttempts(prev => prev + 1);
      
      toast.error("Lỗi đăng nhập", {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get helper text based on login attempts
  const getHelperText = () => {
    if (loginAttempts === 0) return null;
    if (loginAttempts >= 5) return "Quá nhiều lần thử. Vui lòng thử lại sau.";
    return `Còn ${5 - loginAttempts} lần thử trước khi tạm khóa`;
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
        <Card className="border-primary/10 shadow-lg">
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
                  disabled={isLoading || loginAttempts >= 5}
                  className="focus-visible:ring-primary"
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
                  disabled={isLoading || loginAttempts >= 5}
                  className="focus-visible:ring-primary"
                />
                {getHelperText() && (
                  <p className="text-xs text-muted-foreground mt-1">{getHelperText()}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading || loginAttempts >= 5}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full group" 
                disabled={isLoading || loginAttempts >= 5}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
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
