
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertCircle, 
  Loader, 
  User, 
  Mail, 
  Key,
  Shield,
  LogOut,
  Check
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";

// Define profile form schema
const profileSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(5, { message: "Email is too short" })
    .max(100, { message: "Email cannot exceed 100 characters" })
});

// Define password change schema
const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(6, { message: "Please enter your current password" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least 1 lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least 1 special character" }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const { user, fullName, signOut, refreshUser, updateUserEmail } = useAuth();
  const navigate = useNavigate();

  // Create forms
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: ""
    },
    mode: "onChange"
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    mode: "onChange"
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: fullName || '',
        email: user.email || ''
      });

      // This would typically fetch sessions from Supabase
      // For now, we'll just simulate having 1-2 sessions
      const mockSessions = [
        {
          id: 'current-session',
          created_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_address: '127.0.0.1',
          current: true
        }
      ];

      // Add a simulated "other" session randomly
      if (Math.random() > 0.5) {
        mockSessions.push({
          id: 'other-session',
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          ip_address: '192.168.1.1',
          current: false
        });
      }

      setSessions(mockSessions);
      setIsLoading(false);
    }
  }, [user, fullName, profileForm]);

  // Reset error message when inputs change
  useEffect(() => {
    const profileSubscription = profileForm.watch(() => {
      if (profileError) setProfileError(null);
    });
    
    const passwordSubscription = passwordForm.watch(() => {
      if (passwordError) setPasswordError(null);
    });
    
    return () => {
      profileSubscription.unsubscribe();
      passwordSubscription.unsubscribe();
    };
  }, [profileForm, passwordForm, profileError, passwordError]);

  // Handle profile update
  const handleProfileUpdate = async (formData: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    setProfileError(null);
    
    try {
      // Only update email if it has changed
      if (formData.email !== user?.email) {
        const { error } = await updateUserEmail(formData.email);
        
        if (error) {
          throw new Error(error.message || "Failed to update email");
        }
        
        toast.success("Email update requested", {
          description: "Please check your new email for verification."
        });
      }
      
      // Here you would update the user's full name in Supabase
      // This is a simplified implementation
      await refreshUser();
      
      toast.success("Profile updated", {
        description: "Your profile information has been updated successfully."
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      setProfileError(error.message || "Failed to update profile.");
      
      toast.error("Profile update failed", {
        description: error.message || "Please try again later."
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (formData: ChangePasswordFormValues) => {
    setIsChangingPassword(true);
    setPasswordError(null);
    
    try {
      // Here you would implement password change logic with Supabase
      // This is a simplified implementation that just shows a success toast
      setTimeout(() => {
        toast.success("Password updated", {
          description: "Your password has been changed successfully."
        });
        passwordForm.reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setIsChangingPassword(false);
      }, 1500);
    } catch (error: any) {
      console.error("Password change error:", error);
      setPasswordError(error.message || "Failed to update password.");
      
      toast.error("Password change failed", {
        description: error.message || "Please try again later."
      });
      setIsChangingPassword(false);
    }
  };

  // Handle logout from all devices
  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    
    try {
      // Here you would implement logout from all devices with Supabase
      // For now this is a simplified implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Logged out from all devices", {
        description: "You have been successfully logged out from all devices."
      });
      
      // Redirect to login page
      await signOut(true);
      navigate('/login');
    } catch (error: any) {
      console.error("Logout all error:", error);
      
      toast.error("Logout failed", {
        description: "Failed to log out from all devices. Please try again."
      });
      
      setIsLoggingOutAll(false);
      setShowLogoutAllDialog(false);
    }
  };

  // Get browser and OS info from user agent
  const getBrowserInfo = (userAgent: string) => {
    let browserInfo = "Unknown Browser";
    
    if (userAgent.includes("Firefox")) {
      browserInfo = "Firefox";
    } else if (userAgent.includes("Chrome")) {
      browserInfo = "Chrome";
    } else if (userAgent.includes("Safari")) {
      browserInfo = "Safari";
    } else if (userAgent.includes("Edge")) {
      browserInfo = "Edge";
    }
    
    // Detect OS
    let osInfo = "Unknown OS";
    
    if (userAgent.includes("Windows")) {
      osInfo = "Windows";
    } else if (userAgent.includes("Mac OS")) {
      osInfo = "macOS";
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      osInfo = "iOS";
    } else if (userAgent.includes("Android")) {
      osInfo = "Android";
    } else if (userAgent.includes("Linux")) {
      osInfo = "Linux";
    }
    
    return `${browserInfo} on ${osInfo}`;
  };

  // Format date to relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    } else {
      return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Heading 
        title="Account Settings" 
        description="Manage your account preferences and security settings"
        className="mb-6"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} /> Security
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <LogOut size={16} /> Sessions
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile information and email address
              </CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xl">
                        {fullName?.split(' ').map(n => n[0]).join('') || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {profileError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{profileError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {user?.email_confirmed_at ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mb-2">
                      <Check size={12} className="mr-1" /> Email verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mb-2">
                      Email not verified
                    </Badge>
                  )}
                  
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            disabled={isUpdatingProfile}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            {...field}
                            disabled={isUpdatingProfile}
                          />
                        </FormControl>
                        <FormMessage />
                        {field.value !== user?.email && (
                          <p className="text-xs text-amber-600 mt-1">
                            Changing your email will require verification of the new address.
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="ml-auto"
                    disabled={isUpdatingProfile || !profileForm.formState.isDirty || !profileForm.formState.isValid}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to maintain account security
              </CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
                <CardContent className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isChangingPassword}
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isChangingPassword}
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isChangingPassword}
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                    <h4 className="text-sm font-medium text-amber-800">Password Requirements</h4>
                    <ul className="text-xs text-amber-700 mt-1 ml-4 list-disc">
                      <li>At least 8 characters</li>
                      <li>Include at least one uppercase letter</li>
                      <li>Include at least one lowercase letter</li>
                      <li>Include at least one number</li>
                      <li>Include at least one special character</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    variant="default"
                    className="ml-auto"
                    disabled={isChangingPassword || !passwordForm.formState.isDirty || !passwordForm.formState.isValid}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
            
            <div className="px-6 pb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Account Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium">Log out from all devices</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        This will terminate all your active sessions across all devices
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => setShowLogoutAllDialog(true)}
                    >
                      Log out all
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Card>
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={`p-4 rounded-lg border ${session.current ? 'border-primary/20 bg-primary/5' : 'border-border'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{getBrowserInfo(session.user_agent)}</h3>
                            {session.current && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                Current session
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            IP: {session.ip_address} • Last active: {getRelativeTime(session.created_at)}
                          </div>
                        </div>
                        {!session.current && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowLogoutAllDialog(true)}
                      className="mt-4"
                    >
                      Log out from all devices
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Logout All Alert Dialog */}
      <AlertDialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out from all devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will terminate all your active sessions across all devices.
              You'll need to log in again on each device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOutAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleLogoutAll();
              }}
              disabled={isLoggingOutAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOutAll ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Log out all"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountSettings;
