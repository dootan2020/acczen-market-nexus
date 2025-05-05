
import { useState, useCallback } from 'react';
import { emailService, EmailMode } from '@/services/email/EmailService';
import type { 
  WelcomeEmailData, 
  OrderConfirmationEmailData,
  DepositConfirmationEmailData,
  SupportResponseEmailData
} from '@/services/email/EmailService';
import { toast } from 'sonner';

export interface EmailNotificationState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

export const useEmailNotifications = () => {
  const [state, setState] = useState<EmailNotificationState>({
    loading: false,
    success: false,
    error: null
  });
  
  // Set email service mode
  const setEmailMode = useCallback((mode: EmailMode) => {
    emailService.setMode(mode);
  }, []);
  
  // Reset the state
  const resetState = useCallback(() => {
    setState({
      loading: false,
      success: false,
      error: null
    });
  }, []);
  
  // Send welcome email
  const sendWelcomeEmail = useCallback(async (data: WelcomeEmailData, showToast = true) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await emailService.sendWelcomeEmail(data);
      
      setState(prev => ({ ...prev, loading: false, success: result }));
      
      if (showToast) {
        if (result) {
          toast.success('Welcome email sent successfully');
        } else {
          toast.error('Failed to send welcome email');
        }
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send welcome email';
      setState(prev => ({ ...prev, loading: false, error: errorMsg }));
      
      if (showToast) {
        toast.error(errorMsg);
      }
      
      return false;
    }
  }, []);
  
  // Send order confirmation email
  const sendOrderConfirmationEmail = useCallback(async (data: OrderConfirmationEmailData, showToast = true) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await emailService.sendOrderConfirmationEmail(data);
      
      setState(prev => ({ ...prev, loading: false, success: result }));
      
      if (showToast) {
        if (result) {
          toast.success('Order confirmation email sent successfully');
        } else {
          toast.error('Failed to send order confirmation email');
        }
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send order confirmation email';
      setState(prev => ({ ...prev, loading: false, error: errorMsg }));
      
      if (showToast) {
        toast.error(errorMsg);
      }
      
      return false;
    }
  }, []);
  
  // Send deposit confirmation email
  const sendDepositConfirmationEmail = useCallback(async (data: DepositConfirmationEmailData, showToast = true) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await emailService.sendDepositConfirmationEmail(data);
      
      setState(prev => ({ ...prev, loading: false, success: result }));
      
      if (showToast) {
        if (result) {
          toast.success('Deposit confirmation email sent successfully');
        } else {
          toast.error('Failed to send deposit confirmation email');
        }
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send deposit confirmation email';
      setState(prev => ({ ...prev, loading: false, error: errorMsg }));
      
      if (showToast) {
        toast.error(errorMsg);
      }
      
      return false;
    }
  }, []);
  
  // Send support response email
  const sendSupportResponseEmail = useCallback(async (data: SupportResponseEmailData, showToast = true) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await emailService.sendSupportResponseEmail(data);
      
      setState(prev => ({ ...prev, loading: false, success: result }));
      
      if (showToast) {
        if (result) {
          toast.success('Support response email sent successfully');
        } else {
          toast.error('Failed to send support response email');
        }
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send support response email';
      setState(prev => ({ ...prev, loading: false, error: errorMsg }));
      
      if (showToast) {
        toast.error(errorMsg);
      }
      
      return false;
    }
  }, []);
  
  return {
    ...state,
    setEmailMode,
    resetState,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendDepositConfirmationEmail,
    sendSupportResponseEmail
  };
};
