
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle, Check, Key, Mail, CreditCard, Lock, Save, Trash, Plus, Globe, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
}

const Settings = () => {
  const queryClient = useQueryClient();
  const [newSetting, setNewSetting] = useState({ key: '', value: '', description: '', is_public: false });
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSettingId, setCurrentSettingId] = useState<string | null>(null);

  // Exchange rates
  const [newExchangeRate, setNewExchangeRate] = useState({ 
    from_currency: 'USD', 
    to_currency: 'VND', 
    rate: 0 
  });
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [isAddRateDialogOpen, setIsAddRateDialogOpen] = useState(false);
  const [isEditRateDialogOpen, setIsEditRateDialogOpen] = useState(false);

  // Email templates
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditTemplateDialogOpen, setIsEditTemplateDialogOpen] = useState(false);

  // Fetch system settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as SystemSetting[];
    }
  });

  // Fetch exchange rates
  const { data: exchangeRates, isLoading: isLoadingRates } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('from_currency');
      
      if (error) throw error;
      return data as ExchangeRate[];
    }
  });

  // Fetch email templates
  const { data: emailTemplates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  // Add new setting
  const addSettingMutation = useMutation({
    mutationFn: async (setting: Omit<SystemSetting, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('system_settings')
        .insert([setting])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setIsAddDialogOpen(false);
      setNewSetting({ key: '', value: '', description: '', is_public: false });
      toast.success('Setting added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add setting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update setting
  const updateSettingMutation = useMutation({
    mutationFn: async (setting: Partial<SystemSetting> & { id: string }) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          value: setting.value,
          description: setting.description,
          is_public: setting.is_public
        })
        .eq('id', setting.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setIsEditDialogOpen(false);
      setEditingSetting(null);
      toast.success('Setting updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update setting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Delete setting
  const deleteSettingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setIsDeleteDialogOpen(false);
      setCurrentSettingId(null);
      toast.success('Setting deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete setting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Add exchange rate
  const addExchangeRateMutation = useMutation({
    mutationFn: async (rate: Omit<ExchangeRate, 'id' | 'updated_at'>) => {
      const { error } = await supabase.rpc('admin_update_exchange_rate', {
        p_from_currency: rate.from_currency,
        p_to_currency: rate.to_currency,
        p_new_rate: rate.rate
      });
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
      setIsAddRateDialogOpen(false);
      setNewExchangeRate({ from_currency: 'USD', to_currency: 'VND', rate: 0 });
      toast.success('Exchange rate added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update exchange rate
  const updateExchangeRateMutation = useMutation({
    mutationFn: async (rate: Pick<ExchangeRate, 'from_currency' | 'to_currency' | 'rate'>) => {
      const { error } = await supabase.rpc('admin_update_exchange_rate', {
        p_from_currency: rate.from_currency,
        p_to_currency: rate.to_currency,
        p_new_rate: rate.rate
      });
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
      setIsEditRateDialogOpen(false);
      setEditingRate(null);
      toast.success('Exchange rate updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update email template
  const updateEmailTemplateMutation = useMutation({
    mutationFn: async (template: Partial<EmailTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          subject: template.subject,
          body: template.body,
          is_active: template.is_active
        })
        .eq('id', template.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsEditTemplateDialogOpen(false);
      setEditingTemplate(null);
      toast.success('Email template updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update email template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleAddSetting = () => {
    if (!newSetting.key || !newSetting.value) {
      toast.error('Key and value are required');
      return;
    }
    
    addSettingMutation.mutate({
      key: newSetting.key,
      value: newSetting.value,
      description: newSetting.description,
      is_public: newSetting.is_public
    });
  };

  const handleUpdateSetting = () => {
    if (!editingSetting || !editingSetting.value) {
      toast.error('Value is required');
      return;
    }
    
    updateSettingMutation.mutate({
      id: editingSetting.id,
      value: editingSetting.value,
      description: editingSetting.description,
      is_public: editingSetting.is_public
    });
  };

  const handleDeleteSetting = () => {
    if (!currentSettingId) return;
    deleteSettingMutation.mutate(currentSettingId);
  };

  const handleAddExchangeRate = () => {
    if (!newExchangeRate.from_currency || !newExchangeRate.to_currency || !newExchangeRate.rate) {
      toast.error('All fields are required');
      return;
    }
    
    addExchangeRateMutation.mutate({
      from_currency: newExchangeRate.from_currency,
      to_currency: newExchangeRate.to_currency,
      rate: newExchangeRate.rate
    });
  };

  const handleUpdateExchangeRate = () => {
    if (!editingRate) return;
    
    updateExchangeRateMutation.mutate({
      from_currency: editingRate.from_currency,
      to_currency: editingRate.to_currency,
      rate: editingRate.rate
    });
  };

  const handleUpdateEmailTemplate = () => {
    if (!editingTemplate || !editingTemplate.subject || !editingTemplate.body) {
      toast.error('Subject and body are required');
      return;
    }
    
    updateEmailTemplateMutation.mutate({
      id: editingTemplate.id,
      subject: editingTemplate.subject,
      body: editingTemplate.body,
      is_active: editingTemplate.is_active
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your application settings, API credentials, email templates, and more.
        </p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">General Settings</h2>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Setting
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium">Key</th>
                      <th className="py-3 px-4 text-left font-medium">Value</th>
                      <th className="py-3 px-4 text-left font-medium">Description</th>
                      <th className="py-3 px-4 text-center font-medium">Public</th>
                      <th className="py-3 px-4 text-left font-medium">Last Updated</th>
                      <th className="py-3 px-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingSettings ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center">
                          Loading settings...
                        </td>
                      </tr>
                    ) : settings && settings.filter(s => !s.key.startsWith('api_') && 
                                                         !s.key.startsWith('email_') && 
                                                         !s.key.startsWith('payment_') && 
                                                         !s.key.startsWith('security_')).length > 0 ? (
                      settings
                        .filter(s => !s.key.startsWith('api_') && 
                                     !s.key.startsWith('email_') && 
                                     !s.key.startsWith('payment_') && 
                                     !s.key.startsWith('security_'))
                        .map((setting) => (
                        <tr key={setting.id} className="border-b">
                          <td className="py-3 px-4 font-medium">{setting.key}</td>
                          <td className="py-3 px-4">
                            {setting.value.length > 50 ? `${setting.value.substring(0, 50)}...` : setting.value}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{setting.description || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            {setting.is_public ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                Private
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs">{formatDate(setting.updated_at)}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingSetting(setting);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setCurrentSettingId(setting.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No general settings found. You can add new settings using the button above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Exchange Rates</CardTitle>
              <CardDescription>Configure currency exchange rates for your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium">From Currency</th>
                      <th className="py-3 px-4 text-left font-medium">To Currency</th>
                      <th className="py-3 px-4 text-right font-medium">Rate</th>
                      <th className="py-3 px-4 text-left font-medium">Last Updated</th>
                      <th className="py-3 px-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingRates ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center">
                          Loading exchange rates...
                        </td>
                      </tr>
                    ) : exchangeRates && exchangeRates.length > 0 ? (
                      exchangeRates.map((rate) => (
                        <tr key={rate.id} className="border-b">
                          <td className="py-3 px-4">{rate.from_currency}</td>
                          <td className="py-3 px-4">{rate.to_currency}</td>
                          <td className="py-3 px-4 text-right">{rate.rate.toFixed(6)}</td>
                          <td className="py-3 px-4 text-xs">{formatDate(rate.updated_at)}</td>
                          <td className="py-3 px-4 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingRate(rate);
                                setIsEditRateDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No exchange rates found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => setIsAddRateDialogOpen(true)}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Exchange Rate
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mobile App Configuration</CardTitle>
              <CardDescription>Settings for mobile applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app_version">App Version</Label>
                    <Input 
                      id="app_version"
                      placeholder="1.0.0"
                      value={settings?.find(s => s.key === 'app_version')?.value || ''}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="force_update">Force Update</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="force_update" 
                        checked={settings?.find(s => s.key === 'force_update')?.value === 'true'}
                        disabled
                      />
                      <Label htmlFor="force_update">
                        {settings?.find(s => s.key === 'force_update')?.value === 'true' 
                          ? 'Enabled' 
                          : 'Disabled'}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Edit these settings via the API configuration</span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* API Keys */}
        <TabsContent value="api" className="space-y-6 pt-4">
          <h2 className="text-xl font-bold">API Configuration</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for external services</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium">Service</th>
                      <th className="py-3 px-4 text-left font-medium">API Key</th>
                      <th className="py-3 px-4 text-left font-medium">Description</th>
                      <th className="py-3 px-4 text-left font-medium">Last Updated</th>
                      <th className="py-3 px-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingSettings ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center">
                          Loading API settings...
                        </td>
                      </tr>
                    ) : settings && settings.filter(s => s.key.startsWith('api_')).length > 0 ? (
                      settings
                        .filter(s => s.key.startsWith('api_'))
                        .map((setting) => (
                        <tr key={setting.id} className="border-b">
                          <td className="py-3 px-4 font-medium">{setting.key.replace('api_', '')}</td>
                          <td className="py-3 px-4">
                            {setting.value.length > 30 
                              ? `${setting.value.substring(0, 5)}...${setting.value.substring(setting.value.length - 5)}` 
                              : setting.value}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{setting.description || '-'}</td>
                          <td className="py-3 px-4 text-xs">{formatDate(setting.updated_at)}</td>
                          <td className="py-3 px-4 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingSetting(setting);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No API keys found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => {
                  setNewSetting({ 
                    key: 'api_', 
                    value: '', 
                    description: '', 
                    is_public: false 
                  });
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add API Key
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Health Monitoring</CardTitle>
              <CardDescription>Status of your connected API services</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium">API Name</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                      <th className="py-3 px-4 text-left font-medium">Last Error</th>
                      <th className="py-3 px-4 text-right font-medium">Error Count</th>
                      <th className="py-3 px-4 text-left font-medium">Last Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">
                        <div className="font-medium">TaphoaMMO API</div>
                        <div className="text-xs text-muted-foreground">Product Inventory</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Check className="mr-1 h-3 w-3" /> Healthy
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">None</td>
                      <td className="py-3 px-4 text-right">0</td>
                      <td className="py-3 px-4 text-xs">2 minutes ago</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">
                        <div className="font-medium">PayPal API</div>
                        <div className="text-xs text-muted-foreground">Payment Processing</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Check className="mr-1 h-3 w-3" /> Healthy
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">None</td>
                      <td className="py-3 px-4 text-right">0</td>
                      <td className="py-3 px-4 text-xs">15 minutes ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                <p>
                  For detailed API monitoring and logs, please visit the API Monitoring page.
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Email Templates */}
        <TabsContent value="email" className="space-y-6 pt-4">
          <h2 className="text-xl font-bold">Email Templates</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure email provider settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_host">SMTP Host</Label>
                    <Input 
                      id="smtp_host"
                      placeholder="smtp.example.com"
                      value={settings?.find(s => s.key === 'email_smtp_host')?.value || ''}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input 
                      id="smtp_port"
                      placeholder="587"
                      value={settings?.find(s => s.key === 'email_smtp_port')?.value || ''}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_user">SMTP Username</Label>
                    <Input 
                      id="smtp_user"
                      placeholder="username"
                      value={settings?.find(s => s.key === 'email_smtp_user')?.value || ''}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_pass">SMTP Password</Label>
                    <Input 
                      id="smtp_pass"
                      type="password"
                      value="••••••••••••"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="from_email">From Email</Label>
                  <Input 
                    id="from_email"
                    placeholder="noreply@example.com"
                    value={settings?.find(s => s.key === 'email_from')?.value || ''}
                    disabled
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const emailSetting = settings?.find(s => s.key === 'email_smtp_host');
                      if (emailSetting) {
                        setEditingSetting(emailSetting);
                        setIsEditDialogOpen(true);
                      }
                    }}
                    disabled={!settings?.find(s => s.key === 'email_smtp_host')}
                  >
                    Edit Email Settings
                  </Button>
                  <Button variant="outline" disabled>
                    Test Email Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email templates sent to users</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium">Template Name</th>
                      <th className="py-3 px-4 text-left font-medium">Subject</th>
                      <th className="py-3 px-4 text-center font-medium">Status</th>
                      <th className="py-3 px-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTemplates ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center">
                          Loading email templates...
                        </td>
                      </tr>
                    ) : emailTemplates && emailTemplates.length > 0 ? (
                      emailTemplates.map((template) => (
                        <tr key={template.id} className="border-b">
                          <td className="py-3 px-4 font-medium">{template.name}</td>
                          <td className="py-3 px-4">{template.subject}</td>
                          <td className="py-3 px-4 text-center">
                            {template.is_active ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700">
                                Inactive
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingTemplate(template);
                                setIsEditTemplateDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No email templates found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment */}
        <TabsContent value="payment" className="space-y-6 pt-4">
          <h2 className="text-xl font-bold">Payment Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>PayPal Integration</CardTitle>
              <CardDescription>Configure PayPal payment settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypal_client_id">PayPal Client ID</Label>
                    <Input 
                      id="paypal_client_id"
                      placeholder="Client ID"
                      value={settings?.find(s => s.key === 'payment_paypal_client_id')?.value || ''}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypal_secret">PayPal Client Secret</Label>
                    <Input 
                      id="paypal_secret"
                      type="password"
                      value="••••••••••••"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paypal_mode">PayPal Environment</Label>
                  <Select disabled defaultValue={settings?.find(s => s.key === 'payment_paypal_mode')?.value || 'sandbox'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="production">Production (Live)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const paypalSetting = settings?.find(s => s.key === 'payment_paypal_client_id');
                      if (paypalSetting) {
                        setEditingSetting(paypalSetting);
                        setIsEditDialogOpen(true);
                      }
                    }}
                    disabled={!settings?.find(s => s.key === 'payment_paypal_client_id')}
                  >
                    Edit PayPal Settings
                  </Button>
                  <Button variant="outline" disabled>
                    Test PayPal Integration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>USDT Integration</CardTitle>
              <CardDescription>Configure USDT payment settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usdt_address">USDT Wallet Address</Label>
                  <Input 
                    id="usdt_address"
                    placeholder="USDT Address"
                    value={settings?.find(s => s.key === 'payment_usdt_address')?.value || ''}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="usdt_network">USDT Network</Label>
                  <Select disabled defaultValue={settings?.find(s => s.key === 'payment_usdt_network')?.value || 'trc20'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trc20">TRC20</SelectItem>
                      <SelectItem value="erc20">ERC20</SelectItem>
                      <SelectItem value="bep20">BEP20 (BSC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const usdtSetting = settings?.find(s => s.key === 'payment_usdt_address');
                      if (usdtSetting) {
                        setEditingSetting(usdtSetting);
                        setIsEditDialogOpen(true);
                      }
                    }}
                    disabled={!settings?.find(s => s.key === 'payment_usdt_address')}
                  >
                    Edit USDT Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security */}
        <TabsContent value="security" className="space-y-6 pt-4">
          <h2 className="text-xl font-bold">Security Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>Configure authentication and security policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Verification</Label>
                    <div className="text-sm text-muted-foreground">
                      Require email verification before users can log in
                    </div>
                  </div>
                  <Switch 
                    checked={settings?.find(s => s.key === 'security_require_email_verification')?.value === 'true'}
                    disabled
                  />
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between pb-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Password Requirements</Label>
                      <div className="text-sm text-muted-foreground">
                        Minimum password strength requirements
                      </div>
                    </div>
                    <Select disabled defaultValue={settings?.find(s => s.key === 'security_password_strength')?.value || 'medium'}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Password strength" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between pb-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Session Timeout</Label>
                      <div className="text-sm text-muted-foreground">
                        How long before inactive sessions are expired
                      </div>
                    </div>
                    <Select disabled defaultValue={settings?.find(s => s.key === 'security_session_timeout')?.value || '24h'}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Timeout period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="8h">8 hours</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between pb-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">API Rate Limiting</Label>
                      <div className="text-sm text-muted-foreground">
                        Maximum number of API requests allowed per minute
                      </div>
                    </div>
                    <Input 
                      type="number"
                      className="w-[180px]"
                      value={settings?.find(s => s.key === 'security_api_rate_limit')?.value || '60'}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Security settings can be edited in the Supabase Auth console</span>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Access system audit logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  System audit logs are available in the Supabase dashboard.
                </p>
                <Button variant="outline" className="mt-4" disabled>
                  View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Setting Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Setting</DialogTitle>
            <DialogDescription>
              Add a new configuration setting to your system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Setting Key</Label>
              <Input
                id="key"
                placeholder="Enter setting key"
                value={newSetting.key}
                onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Setting Value</Label>
              <Textarea
                id="value"
                placeholder="Enter setting value"
                value={newSetting.value}
                onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={newSetting.description}
                onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={newSetting.is_public}
                onCheckedChange={(checked) => setNewSetting({ ...newSetting, is_public: checked })}
              />
              <Label htmlFor="is_public">Public Setting</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddSetting} disabled={addSettingMutation.isPending}>
              {addSettingMutation.isPending ? 'Adding...' : 'Add Setting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Setting Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              Update the value for {editingSetting?.key}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-key">Setting Key</Label>
              <Input
                id="edit-key"
                value={editingSetting?.key || ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-value">Setting Value</Label>
              <Textarea
                id="edit-value"
                placeholder="Enter setting value"
                value={editingSetting?.value || ''}
                onChange={(e) => setEditingSetting(prev => prev ? { ...prev, value: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                placeholder="Enter description"
                value={editingSetting?.description || ''}
                onChange={(e) => setEditingSetting(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_public"
                checked={editingSetting?.is_public || false}
                onCheckedChange={(checked) => setEditingSetting(prev => prev ? { ...prev, is_public: checked } : null)}
              />
              <Label htmlFor="edit-is_public">Public Setting</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateSetting} disabled={updateSettingMutation.isPending}>
              {updateSettingMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Setting Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected setting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSettingMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Exchange Rate Dialog */}
      <Dialog open={isAddRateDialogOpen} onOpenChange={setIsAddRateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exchange Rate</DialogTitle>
            <DialogDescription>
              Add a new currency exchange rate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_currency">From Currency</Label>
                <Input
                  id="from_currency"
                  placeholder="USD"
                  value={newExchangeRate.from_currency}
                  onChange={(e) => setNewExchangeRate({ ...newExchangeRate, from_currency: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_currency">To Currency</Label>
                <Input
                  id="to_currency"
                  placeholder="VND"
                  value={newExchangeRate.to_currency}
                  onChange={(e) => setNewExchangeRate({ ...newExchangeRate, to_currency: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Exchange Rate</Label>
              <Input
                id="rate"
                type="number"
                step="0.000001"
                placeholder="24500"
                value={newExchangeRate.rate || ''}
                onChange={(e) => setNewExchangeRate({ ...newExchangeRate, rate: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                How much {newExchangeRate.to_currency} equals 1 {newExchangeRate.from_currency}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddExchangeRate} disabled={addExchangeRateMutation.isPending}>
              {addExchangeRateMutation.isPending ? 'Adding...' : 'Add Rate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Exchange Rate Dialog */}
      <Dialog open={isEditRateDialogOpen} onOpenChange={setIsEditRateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exchange Rate</DialogTitle>
            <DialogDescription>
              Update exchange rate for {editingRate?.from_currency} to {editingRate?.to_currency}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_from_currency">From Currency</Label>
                <Input
                  id="edit_from_currency"
                  value={editingRate?.from_currency || ''}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_to_currency">To Currency</Label>
                <Input
                  id="edit_to_currency"
                  value={editingRate?.to_currency || ''}
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_rate">Exchange Rate</Label>
              <Input
                id="edit_rate"
                type="number"
                step="0.000001"
                value={editingRate?.rate || ''}
                onChange={(e) => setEditingRate(prev => prev ? { ...prev, rate: parseFloat(e.target.value) } : null)}
              />
              <p className="text-xs text-muted-foreground">
                How much {editingRate?.to_currency} equals 1 {editingRate?.from_currency}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateExchangeRate} disabled={updateExchangeRateMutation.isPending}>
              {updateExchangeRateMutation.isPending ? 'Updating...' : 'Update Rate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Email Template Dialog */}
      <Dialog open={isEditTemplateDialogOpen} onOpenChange={setIsEditTemplateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Update the {editingTemplate?.name} email template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                value={editingTemplate?.name || ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_subject">Email Subject</Label>
              <Input
                id="template_subject"
                placeholder="Enter email subject"
                value={editingTemplate?.subject || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_body">Email Body</Label>
              <Textarea
                id="template_body"
                placeholder="Enter email body"
                className="min-h-[200px]"
                value={editingTemplate?.body || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, body: e.target.value } : null)}
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {'{name}'}, {'{email}'}, {'{link}'}, {'{code}'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="template_active"
                checked={editingTemplate?.is_active || false}
                onCheckedChange={(checked) => setEditingTemplate(prev => prev ? { ...prev, is_active: checked } : null)}
              />
              <Label htmlFor="template_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateEmailTemplate} disabled={updateEmailTemplateMutation.isPending}>
              {updateEmailTemplateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
