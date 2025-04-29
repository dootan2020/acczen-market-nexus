
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define notification types and their descriptions
const notificationTypes = [
  { 
    id: 'account_registration',
    name: 'Account Registration',
    description: 'Receive a confirmation email when you register for an account'
  },
  { 
    id: 'order_confirmation',
    name: 'Order Confirmations',
    description: 'Receive order details and confirmations when you place an order'
  },
  { 
    id: 'deposit_success',
    name: 'Deposit Confirmations',
    description: 'Receive confirmations when your account deposits are successful'
  },
  { 
    id: 'order_status_update',
    name: 'Order Status Updates',
    description: 'Receive updates when the status of your order changes'
  },
  { 
    id: 'password_reset',
    name: 'Password Reset',
    description: 'Receive emails to reset your password when requested'
  }
];

interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  is_enabled: boolean;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  
  // Fetch existing notification preferences
  useEffect(() => {
    async function fetchPreferences() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        // Initialize default preferences (all enabled) and override with saved preferences
        const userPrefs: Record<string, boolean> = {};
        
        // Default all to true
        notificationTypes.forEach(type => {
          userPrefs[type.id] = true;
        });
        
        // Override with saved preferences
        if (data && data.length > 0) {
          data.forEach((pref: NotificationPreference) => {
            userPrefs[pref.notification_type] = pref.is_enabled;
          });
        }
        
        setPreferences(userPrefs);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        toast.error('Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPreferences();
  }, [user]);
  
  // Handle preference toggle
  const togglePreference = async (notificationType: string) => {
    if (!user) return;
    
    const newValue = !preferences[notificationType];
    
    // Optimistically update UI
    setPreferences(prev => ({
      ...prev,
      [notificationType]: newValue
    }));
    
    // Show save in progress
    setIsSaving(prev => ({ ...prev, [notificationType]: true }));
    
    try {
      // Check if preference already exists
      const { data: existingPref } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('notification_type', notificationType)
        .single();
      
      if (existingPref) {
        // Update existing preference
        const { error } = await supabase
          .from('notification_preferences')
          .update({ 
            is_enabled: newValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPref.id);
          
        if (error) throw error;
      } else {
        // Insert new preference
        const { error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            notification_type: notificationType,
            is_enabled: newValue
          });
          
        if (error) throw error;
      }
      
      toast.success(`Email notification ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating notification preference:', error);
      toast.error('Failed to update notification preference');
      
      // Revert optimistic update on error
      setPreferences(prev => ({
        ...prev,
        [notificationType]: !newValue
      }));
    } finally {
      // Hide save in progress
      setIsSaving(prev => ({ ...prev, [notificationType]: false }));
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Notification Preferences</CardTitle>
          <CardDescription>
            Choose which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notification Preferences</CardTitle>
        <CardDescription>
          Choose which email notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationTypes.map((type) => (
          <div key={type.id} className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor={`notification-${type.id}`} className="font-medium">
                {type.name}
              </Label>
              <p className="text-sm text-muted-foreground">
                {type.description}
              </p>
            </div>
            <div className="flex items-center">
              {isSaving[type.id] && (
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />
              )}
              <Switch
                id={`notification-${type.id}`}
                checked={preferences[type.id] || false}
                onCheckedChange={() => togglePreference(type.id)}
                disabled={isSaving[type.id]}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default NotificationPreferences;
