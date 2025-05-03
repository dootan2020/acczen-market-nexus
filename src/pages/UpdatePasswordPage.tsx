
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle, ArrowRight, Loader, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

// Define the form validation schema with Zod
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least 1 lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least 1 special character" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Define type for form data
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Function to calculate password strength
const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  // Length check
  if (password.length >= 8) strength += 20;
  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 20;
  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 20;
  // Contains number
  if (/[0-9]/.test(password)) strength += 20;
  // Contains special char
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
  
  return strength;
};

// Function to get password strength color
const getPasswordStrengthColor = (strength: number): string => {
  if (strength <= 20) return "bg-red-500";
  if (strength <= 40) return "bg-orange-500";
  if (strength <= 60) return "bg-yellow-500";
  if (strength <= 80) return "bg-blue-500";
  return "bg-green-500";
};

// Function to get password strength text
const getPasswordStrengthText = (strength: number): string => {
  if (strength <= 20) return "Very Weak";
  if (strength <= 40) return "Weak";
  if (strength <= 60) return "Medium";
  if (strength <= 80) return "Strong";
  return "Very Strong";
};

const UpdatePasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize react-hook-form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  // Reset error message when inputs change
  useEffect(() => {
    const subscription = form.watch(() => {
      if (errorMessage) setErrorMessage(null);
    });
    return () => subscription.unsubscribe();
  }, [form, errorMessage]);

  // Update password strength
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.password) {
        setPasswordStrength(calculatePasswordStrength(value.password));
      } else {
        setPasswordStrength(0);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // If user is accessing this page without a token, redirect them
  useEffect(() => {
    // Check if there's a token in the URL
    // Supabase typically adds access_token to the URL when the user clicks the reset link
    if (!searchParams.get('access_token')) {
      toast.error("Invalid password reset link", {
        description: "Please request a new password reset link.",
      });
      navigate('/reset-password');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (formData: ResetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      await resetPassword(formData.password);
      
      setIsSuccess(true);
      toast.success("Password updated successfully", {
        description: "You can now log in with your new password."
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error("Password update error:", error);
      setErrorMessage(error.message || "An error occurred while updating your password.");
      
      toast.error("Password update failed", {
        description: error.message || "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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
            <CardTitle className="text-2xl text-center">Update Your Password</CardTitle>
            <CardDescription className="text-center">
              Create a new secure password for your account
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
                
                {isSuccess && (
                  <Alert variant="default" className="bg-green-50 text-green-800 border-green-200 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600">
                        <path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2598 6.62407 10.2482C6.77197 10.2367 6.90686 10.1612 6.99226 10.0427L10.1589 5.53774Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                      <AlertDescription>
                        Password updated successfully! Redirecting to login...
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading || isSuccess}
                            aria-invalid={!!form.formState.errors.password}
                            className={`transition-all duration-200 ${form.formState.errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            autoComplete="new-password"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={togglePasswordVisibility}
                            tabIndex={-1}
                            disabled={isLoading || isSuccess}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      {field.value && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Password strength</span>
                            <span className={`font-medium ${passwordStrength > 60 ? 'text-green-500' : passwordStrength > 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {getPasswordStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <Progress 
                            value={passwordStrength} 
                            className="h-1.5 w-full" 
                            indicatorClassName={getPasswordStrengthColor(passwordStrength)} 
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading || isSuccess}
                            aria-invalid={!!form.formState.errors.confirmPassword}
                            className={`transition-all duration-200 ${form.formState.errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            autoComplete="new-password"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={toggleConfirmPasswordVisibility}
                            tabIndex={-1}
                            disabled={isLoading || isSuccess}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-300 bg-[#19C37D] hover:bg-[#15a76b] group"
                  disabled={isLoading || !form.formState.isValid || Object.keys(form.formState.errors).length > 0 || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
                <div className="text-center text-sm">
                  Remember your password?{" "}
                  <Link to="/login" className="text-primary hover:underline transition-colors">
                    Sign in
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

export default UpdatePasswordPage;
