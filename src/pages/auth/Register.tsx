
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";

// Define the form validation schema with Zod
const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s\u00C0-\u1EF9]+$/, { message: "Name can only contain letters and spaces" }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(5, { message: "Email is too short" })
    .max(100, { message: "Email cannot exceed 100 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least 1 lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least 1 special character" }),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms of service",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Define type for form data
type RegisterFormValues = z.infer<typeof registerSchema>;

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

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Initialize react-hook-form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
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

  const handleSubmit = async (formData: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Attempting to register with:", { email: formData.email, fullName: formData.fullName });
      const result = await signUp(formData.email, formData.password, formData.fullName);
      
      if (result?.error) {
        console.error("Registration error:", result.error);
        
        // Handle specific error types
        if (result.error.includes("User already registered")) {
          setErrorMessage("This email is already registered. Please use a different email or sign in.");
        } else {
          setErrorMessage(result.error);
        }
      } else {
        toast.success("Registration successful", {
          description: "Please check your email to verify your account."
        });
        navigate("/login");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred during registration";
      console.error("Registration error:", error);
      setErrorMessage(errorMsg);
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
            <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to create your AccZen account
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
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          disabled={isLoading}
                          aria-invalid={!!form.formState.errors.fullName}
                          className={`transition-all duration-200 ${form.formState.errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          disabled={isLoading}
                          aria-invalid={!!form.formState.errors.email}
                          className={`transition-all duration-200 ${form.formState.errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                            aria-invalid={!!form.formState.errors.password}
                            className={`transition-all duration-200 ${form.formState.errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            autoComplete="new-password"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={togglePasswordVisibility}
                            tabIndex={-1}
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
                            indicatorClassName={`${getPasswordStrengthColor(passwordStrength)}`} 
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                            aria-invalid={!!form.formState.errors.confirmPassword}
                            className={`transition-all duration-200 ${form.formState.errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            autoComplete="new-password"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={toggleConfirmPasswordVisibility}
                            tabIndex={-1}
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

                <FormField
                  control={form.control}
                  name="agreeTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          aria-invalid={!!form.formState.errors.agreeTerms}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to the{" "}
                          <Link to="/terms" className="text-primary hover:underline transition-colors">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link to="/privacy" className="text-primary hover:underline transition-colors">
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-300 bg-[#19C37D] hover:bg-[#15a76b]"
                  disabled={isLoading || !form.formState.isValid || Object.keys(form.formState.errors).length > 0}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
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

export default Register;
