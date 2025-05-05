
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
    .email({ message: "Invalid email address" })
    .min(5, { message: "Email is too short" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
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
      setErrorMessage("Too many failed login attempts. Please try again in 15 minutes.");
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
      console.log("Attempting to sign in with:", { email: formData.email });
      // Update the signIn call to use the correct number of arguments
      const result = await signIn(formData.email, formData.password);
      
      if (result?.error) {
        console.error("Login error details:", result.error);
        setLoginAttempts(prev => prev + 1);
        
        // Handle specific error types
        setErrorMessage(result.error);
        
        toast.error("Login failed", {
          description: result.error
        });
      } else {
        // Success is handled by AuthContext
        // Navigate to the previous page or home
        navigate(getPreviousPath());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred, please try again";
      console.error("Login error:", error);
      setErrorMessage(errorMessage);
      setLoginAttempts(prev => prev + 1);
      
      toast.error("Login failed", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get helper text based on login attempts
  const getHelperText = () => {
    if (loginAttempts === 0) return null;
    if (loginAttempts >= 5) return "Too many attempts. Please try again later.";
    return `${5 - loginAttempts} attempts remaining before temporary lockout`;
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-foreground">AccZen</span>
          </Link>
        </div>
        <Card className="border-primary/10 shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In to Your Account</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
              <CardContent className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive" className="animate-fade-in">
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
                          className={`focus-visible:ring-primary transition-all duration-200 ${form.formState.errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          aria-invalid={!!form.formState.errors.email}
                          autoComplete="email"
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
                        <FormLabel>Password</FormLabel>
                        <Link to="/reset-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading || loginAttempts >= 5}
                            className={`focus-visible:ring-primary transition-all duration-200 ${form.formState.errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            aria-invalid={!!form.formState.errors.password}
                            autoComplete="current-password"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={togglePasswordVisibility}
                            tabIndex={-1}
                            disabled={isLoading || loginAttempts >= 5}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
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
                          Remember me
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-300 bg-[#19C37D] hover:bg-[#15a76b]" 
                  disabled={isLoading || loginAttempts >= 5 || !form.formState.isValid || Object.keys(form.formState.errors).length > 0}
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary hover:underline transition-colors">
                    Sign up
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
