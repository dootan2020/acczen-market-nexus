
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, AlertCircle, Loader, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define the form validation schema with Zod
const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Email không hợp lệ" })
    .min(5, { message: "Email quá ngắn" }),
  password: z
    .string()
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  rememberMe: z.boolean().default(true),
});

// Define type for form data
type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

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
    const subscription = form.watch(() => {
      if (errorMessage) setErrorMessage(null);
    });
    return () => subscription.unsubscribe();
  }, [form, errorMessage]);

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

  const handleSubmit = async (formData: LoginFormValues) => {
    if (loginAttempts >= 5) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Đang thực hiện đăng nhập với:", { email: formData.email });
      const result = await signIn(formData.email, formData.password, formData.rememberMe);
      
      if (result?.error) {
        console.error("Login error details:", result.error);
        setLoginAttempts(prev => prev + 1);
        
        // Handle specific error types
        setErrorMessage(result.error);
        
        toast.error("Lỗi đăng nhập", {
          description: result.error
        });
      } else {
        // Success is handled by AuthContext
        // Navigate to the previous page or home
        navigate(getPreviousPath());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại";
      console.error("Login error:", error);
      setErrorMessage(errorMessage);
      setLoginAttempts(prev => prev + 1);
      
      toast.error("Lỗi đăng nhập", {
        description: errorMessage
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                          disabled={isLoading || loginAttempts >= 5}
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Mật khẩu</FormLabel>
                        <Link to="/reset-password" className="text-xs text-primary hover:underline">
                          Quên mật khẩu?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading || loginAttempts >= 5}
                            className="focus-visible:ring-primary"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3"
                            onClick={togglePasswordVisibility}
                            tabIndex={-1}
                            disabled={isLoading || loginAttempts >= 5}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      {getHelperText() && (
                        <p className="text-xs text-muted-foreground mt-1">{getHelperText()}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          disabled={isLoading || loginAttempts >= 5}
                          id="rememberMe"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel 
                          htmlFor="rememberMe" 
                          className="text-sm font-medium leading-none"
                        >
                          Ghi nhớ đăng nhập
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full group" 
                  disabled={isLoading || loginAttempts >= 5 || !form.formState.isValid}
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
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
