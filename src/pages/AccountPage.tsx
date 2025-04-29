import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

// Define a profile interface that includes phone
interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string;
  balance: number;
  created_at: string;
  updated_at: string;
  role: 'user' | 'admin';
  phone?: string | null; // Add phone as an optional property
}

// Define the validation schema
const accountSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự' })
    .max(30, { message: 'Tên người dùng không được vượt quá 30 ký tự' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Chỉ cho phép chữ cái, số và dấu gạch dưới' }),
  fullName: z
    .string()
    .min(3, { message: 'Tên đầy đủ phải có ít nhất 3 ký tự' })
    .max(50, { message: 'Tên đầy đủ không được vượt quá 50 ký tự' }),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, { message: 'Số điện thoại không hợp lệ' })
    .optional()
    .or(z.literal('')),
});

type AccountFormValues = z.infer<typeof accountSchema>;

// Password change schema in a separate form
const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Vui lòng nhập mật khẩu hiện tại' }),
    newPassword: z
      .string()
      .min(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
      .regex(/[A-Z]/, { message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa' })
      .regex(/[a-z]/, { message: 'Mật khẩu phải chứa ít nhất 1 chữ thường' })
      .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất 1 số' }),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const AccountPage = () => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: '',
      fullName: '',
      phone: '',
    },
    mode: 'onChange',
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data as UserProfile);

        // Set form values
        if (data) {
          accountForm.reset({
            username: data.username || '',
            fullName: data.full_name || '',
            phone: data.phone || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        toast.error('Không thể tải thông tin hồ sơ');
      }
    };

    fetchUserProfile();
  }, [user, accountForm]);

  const onAccountSubmit = async (values: AccountFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if username is already taken
      if (values.username !== userProfile.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', values.username)
          .not('id', 'eq', user.id)
          .single();
        
        if (existingUser) {
          setError('Tên người dùng đã tồn tại, vui lòng chọn tên khác');
          setIsLoading(false);
          return;
        }
        
        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          full_name: values.fullName,
          phone: values.phone || null,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      await refreshUser();
      toast.success('Cập nhật hồ sơ thành công');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setPasswordLoading(true);
    setPasswordError(null);
    
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) throw error;
      
      toast.success('Mật khẩu đã được cập nhật thành công');
      passwordForm.reset();
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError('Có lỗi xảy ra khi cập nhật mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        <p>Please login to access your account settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Cài đặt tài khoản</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân của bạn
            </CardDescription>
          </CardHeader>
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(onAccountSubmit)}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Using a dummy field to render email read-only */}
                <div className="space-y-1">
                  <Label htmlFor="emailDisplay">Email</Label>
                  <Input 
                    id="emailDisplay"
                    value={user?.email || ''}
                    disabled 
                    className="bg-muted/50"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email không thể thay đổi
                  </p>
                </div>

                <FormField
                  control={accountForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên người dùng</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accountForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accountForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={isLoading || !accountForm.formState.isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Thay đổi mật khẩu</CardTitle>
            <CardDescription>
              Cập nhật mật khẩu của bạn
            </CardDescription>
          </CardHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
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
                      <FormLabel>Mật khẩu hiện tại</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={passwordLoading || !passwordForm.formState.isValid}
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật mật khẩu'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;
