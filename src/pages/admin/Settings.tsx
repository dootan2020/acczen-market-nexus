import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Heading } from '@/components/ui/heading';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Since there's no system_settings table yet, 
// we'll create a type to describe what it might look like
interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'json';
  group: 'general' | 'payment' | 'email' | 'security' | 'api';
}

// Form schema for general settings
const generalSettingsSchema = z.object({
  site_name: z.string().min(1, 'Site name is required'),
  site_description: z.string(),
  contact_email: z.string().email('Must be a valid email'),
  enable_registration: z.boolean(),
});

// Form schema for payment settings
const paymentSettingsSchema = z.object({
  paypal_client_id: z.string(),
  enable_paypal: z.boolean(),
  enable_crypto: z.boolean(),
  transaction_fees: z.string().regex(/^(\d*\.)?\d+$/, 'Must be a valid number'),
  min_deposit: z.string().regex(/^(\d*\.)?\d+$/, 'Must be a valid number'),
});

// Form schema for email settings
const emailSettingsSchema = z.object({
  smtp_host: z.string(),
  smtp_port: z.string().regex(/^\d+$/, 'Must be a number'),
  smtp_user: z.string(),
  smtp_password: z.string(),
  sender_email: z.string().email('Must be a valid email'),
  enable_email_notifications: z.boolean(),
});

// Form schema for security settings
const securitySettingsSchema = z.object({
  require_email_verification: z.boolean(),
  password_min_length: z.string().regex(/^\d+$/, 'Must be a number'),
  session_timeout: z.string().regex(/^\d+$/, 'Must be a number'),
  enable_2fa: z.boolean(),
});

// Form schema for API settings
const apiSettingsSchema = z.object({
  rate_limit: z.string().regex(/^\d+$/, 'Must be a number'),
  api_timeout: z.string().regex(/^\d+$/, 'Must be a number'),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type PaymentSettingsValues = z.infer<typeof paymentSettingsSchema>;
type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;
type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;
type ApiSettingsValues = z.infer<typeof apiSettingsSchema>;

const Settings = () => {
  const queryClient = useQueryClient();

  // Since we don't have a system_settings table yet, we'll mock the settings data
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      // Let's check if profiles exists to make sure supabase is connected
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      // For now, return mock settings data
      return {
        site_name: 'Digital Deals Hub',
        site_description: 'Your premium source for digital products',
        contact_email: 'support@digitaldeals.com',
        enable_registration: true,
        paypal_client_id: 'YOUR_PAYPAL_CLIENT_ID',
        enable_paypal: true,
        enable_crypto: true,
        transaction_fees: '2.5',
        min_deposit: '10',
        smtp_host: 'smtp.example.com',
        smtp_port: '587',
        smtp_user: 'user@example.com',
        smtp_password: '********',
        sender_email: 'no-reply@digitaldeals.com',
        enable_email_notifications: true,
        require_email_verification: true,
        password_min_length: '8',
        session_timeout: '60',
        enable_2fa: false,
        rate_limit: '100',
        api_timeout: '30',
      };
    }
  });

  // General settings form
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      site_name: '',
      site_description: '',
      contact_email: '',
      enable_registration: false,
    },
  });

  // Payment settings form
  const paymentForm = useForm<PaymentSettingsValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      paypal_client_id: '',
      enable_paypal: false,
      enable_crypto: false,
      transaction_fees: '',
      min_deposit: '',
    },
  });

  // Email settings form
  const emailForm = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtp_host: '',
      smtp_port: '',
      smtp_user: '',
      smtp_password: '',
      sender_email: '',
      enable_email_notifications: false,
    },
  });

  // Security settings form
  const securityForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      require_email_verification: false,
      password_min_length: '',
      session_timeout: '',
      enable_2fa: false,
    },
  });

  // API settings form
  const apiForm = useForm<ApiSettingsValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      rate_limit: '',
      api_timeout: '',
    },
  });

  // Update forms when settings data is loaded
  React.useEffect(() => {
    if (settings) {
      generalForm.reset({
        site_name: settings.site_name,
        site_description: settings.site_description,
        contact_email: settings.contact_email,
        enable_registration: settings.enable_registration,
      });

      paymentForm.reset({
        paypal_client_id: settings.paypal_client_id,
        enable_paypal: settings.enable_paypal,
        enable_crypto: settings.enable_crypto,
        transaction_fees: settings.transaction_fees,
        min_deposit: settings.min_deposit,
      });

      emailForm.reset({
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_user: settings.smtp_user,
        smtp_password: settings.smtp_password,
        sender_email: settings.sender_email,
        enable_email_notifications: settings.enable_email_notifications,
      });

      securityForm.reset({
        require_email_verification: settings.require_email_verification,
        password_min_length: settings.password_min_length,
        session_timeout: settings.session_timeout,
        enable_2fa: settings.enable_2fa,
      });

      apiForm.reset({
        rate_limit: settings.rate_limit,
        api_timeout: settings.api_timeout,
      });
    }
  }, [settings]);

  // Mock mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, you would save to the database
      // For now, just return success
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const onSubmitGeneralSettings = (data: GeneralSettingsValues) => {
    updateSettingsMutation.mutate({ group: 'general', ...data });
  };

  const onSubmitPaymentSettings = (data: PaymentSettingsValues) => {
    updateSettingsMutation.mutate({ group: 'payment', ...data });
  };

  const onSubmitEmailSettings = (data: EmailSettingsValues) => {
    updateSettingsMutation.mutate({ group: 'email', ...data });
  };

  const onSubmitSecuritySettings = (data: SecuritySettingsValues) => {
    updateSettingsMutation.mutate({ group: 'security', ...data });
  };

  const onSubmitApiSettings = (data: ApiSettingsValues) => {
    updateSettingsMutation.mutate({ group: 'api', ...data });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Heading 
        title="System Settings" 
        description="Manage your application settings"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage basic website settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onSubmitGeneralSettings)} className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="site_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Website Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="site_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A brief description of your website" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="enable_registration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Enable User Registration</FormLabel>
                          <FormDescription>Allow new users to register on your website</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit(onSubmitPaymentSettings)} className="space-y-4">
                  {/* Payment settings form fields */}
                  <FormField
                    control={paymentForm.control}
                    name="paypal_client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PayPal Client ID</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={paymentForm.control}
                      name="transaction_fees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Fee (%)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="min_deposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Deposit (USD)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={paymentForm.control}
                      name="enable_paypal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Enable PayPal</FormLabel>
                            <FormDescription>Allow users to pay with PayPal</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="enable_crypto"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Enable Cryptocurrency</FormLabel>
                            <FormDescription>Allow users to pay with cryptocurrency</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would follow the same pattern */}
        {/* Email Settings Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email sending options</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSubmitEmailSettings)} className="space-y-4">
                  {/* Email settings form content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtp_host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtp_user"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtp_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={emailForm.control}
                    name="sender_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={emailForm.control}
                    name="enable_email_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Email Notifications</FormLabel>
                          <FormDescription>Send automatic emails for orders, etc.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security options</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSubmitSecuritySettings)} className="space-y-4">
                  {/* Security settings form content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={securityForm.control}
                      name="password_min_length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Password Length</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="session_timeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (minutes)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={securityForm.control}
                    name="require_email_verification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Require Email Verification</FormLabel>
                          <FormDescription>Users must verify their email before using full features</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="enable_2fa"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Two-Factor Authentication</FormLabel>
                          <FormDescription>Allow users to set up 2FA for their accounts</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Configure API related options</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiForm}>
                <form onSubmit={apiForm.handleSubmit(onSubmitApiSettings)} className="space-y-4">
                  {/* API settings form content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={apiForm.control}
                      name="rate_limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate Limit (requests per minute)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={apiForm.control}
                      name="api_timeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Timeout (seconds)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
