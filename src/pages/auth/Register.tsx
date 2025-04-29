
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Reset error message when inputs change
  useEffect(() => {
    if (errorMessage) setErrorMessage(null);
  }, [email, password, confirmPassword, fullName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!agreeTerms) {
      setErrorMessage("Bạn cần đồng ý với điều khoản dịch vụ để tiếp tục");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu không khớp. Vui lòng kiểm tra lại.");
      toast("Mật khẩu không khớp", {
        description: "Vui lòng kiểm tra lại mật khẩu của bạn.",
        style: { background: 'red', color: 'white' },
      });
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Đang thực hiện đăng ký với:", { email, fullName });
      const result = await signUp(email, password, fullName);
      
      if (result?.error) {
        console.error("Lỗi đăng ký:", result.error);
        
        // Xử lý các loại lỗi cụ thể
        const errorMsg = result.error instanceof Error ? result.error.message : String(result.error);
        if (errorMsg.indexOf("User already registered") !== -1) {
          setErrorMessage("Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.");
        } else {
          setErrorMessage(errorMsg);
        }
      } else {
        toast.success("Đăng ký thành công", {
          description: "Vui lòng kiểm tra email của bạn để xác nhận tài khoản."
        });
        navigate("/login");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Có lỗi xảy ra trong quá trình đăng ký";
      console.error("Lỗi đăng ký:", error);
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
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
            <CardTitle>Tạo tài khoản mới</CardTitle>
            <CardDescription>
              Nhập thông tin của bạn để tạo tài khoản AccZen.net
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
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
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
                <Label htmlFor="password">Mật khẩu</Label>
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
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm">
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    chính sách bảo mật
                  </Link>
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>
              <div className="text-center text-sm">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Đăng nhập
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
