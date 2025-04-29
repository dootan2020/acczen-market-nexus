
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailNotificationOptions {
  template: string;
  userId: string;
  data: Record<string, any>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  showToast?: boolean;
}

/**
 * Utility function to send email notifications via the send-notification-email edge function
 */
export async function sendEmailNotification({
  template,
  userId,
  data,
  onSuccess,
  onError,
  showToast = true
}: EmailNotificationOptions): Promise<{ success: boolean; error?: any }> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data: response, error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        user_id: userId,
        template,
        data
      }
    });

    if (error) {
      console.error('Error sending email notification:', error);
      if (showToast) {
        toast.error('Failed to send notification email');
      }
      onError?.(error);
      return { success: false, error };
    }

    if (!response.success) {
      console.error('Error in send-notification-email response:', response);
      if (showToast) {
        toast.error('Failed to send notification email');
      }
      onError?.(response);
      return { success: false, error: response };
    }

    if (showToast) {
      toast.success('Notification email sent successfully');
    }
    onSuccess?.();
    return { success: true };
  } catch (error) {
    console.error('Exception sending email notification:', error);
    if (showToast) {
      toast.error('Failed to send notification email');
    }
    onError?.(error);
    return { success: false, error };
  }
}

// Specific email notification functions

/**
 * Send account registration confirmation email
 */
export async function sendRegistrationEmail(userId: string) {
  return sendEmailNotification({
    template: 'account_registration',
    userId,
    data: {
      date: new Date().toISOString()
    },
    showToast: false
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userId: string, resetLink: string) {
  return sendEmailNotification({
    template: 'password_reset',
    userId,
    data: {
      reset_link: resetLink,
      date: new Date().toISOString()
    },
    showToast: false
  });
}
