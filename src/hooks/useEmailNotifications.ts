
import { useState } from 'react';
import { emailService } from '@/services/email/EmailService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';

interface EmailNotificationOptions {
  showToast?: boolean;
  logToConsole?: boolean;
}

export function useEmailNotifications(options: EmailNotificationOptions = {}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleError } = useErrorHandler();
  const { toast } = useToast();
  
  const defaultOpts = {
    showToast: true,
    logToConsole: true,
    ...options
  };

  /**
   * Send welcome email to a new user
   */
  const sendWelcomeEmail = async (
    email: string, 
    data: { username: string; firstName?: string }
  ) => {
    setIsLoading(true);
    try {
      const result = await emailService.sendWelcomeEmail(email, data);
      
      if (!result.success) {
        throw result.error || new Error('Failed to send welcome email');
      }
      
      if (defaultOpts.showToast) {
        toast({
          title: "Email Sent",
          description: `Welcome email sent to ${email}`,
        });
      }
      
      return result;
    } catch (error) {
      handleError(error, {
        showToast: defaultOpts.showToast,
        logToConsole: defaultOpts.logToConsole
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send order confirmation email
   */
  const sendOrderConfirmationEmail = async (
    email: string,
    data: {
      orderId: string;
      username: string;
      firstName?: string;
      date: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
    }
  ) => {
    setIsLoading(true);
    try {
      const result = await emailService.sendOrderConfirmationEmail(email, data);
      
      if (!result.success) {
        throw result.error || new Error('Failed to send order confirmation email');
      }
      
      if (defaultOpts.showToast) {
        toast({
          title: "Order Confirmation Sent",
          description: `Order confirmation email sent to ${email}`,
        });
      }
      
      return result;
    } catch (error) {
      handleError(error, {
        showToast: defaultOpts.showToast,
        logToConsole: defaultOpts.logToConsole
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send deposit confirmation email
   */
  const sendDepositConfirmationEmail = async (
    email: string,
    data: {
      depositId: string;
      username: string;
      firstName?: string;
      date: string;
      amount: number;
      paymentMethod: string;
      transactionId?: string;
    }
  ) => {
    setIsLoading(true);
    try {
      const result = await emailService.sendDepositConfirmationEmail(email, data);
      
      if (!result.success) {
        throw result.error || new Error('Failed to send deposit confirmation email');
      }
      
      if (defaultOpts.showToast) {
        toast({
          title: "Deposit Confirmation Sent",
          description: `Deposit confirmation email sent to ${email}`,
        });
      }
      
      return result;
    } catch (error) {
      handleError(error, {
        showToast: defaultOpts.showToast,
        logToConsole: defaultOpts.logToConsole
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send support response email
   */
  const sendSupportResponseEmail = async (
    email: string,
    data: {
      ticketId: string;
      username: string;
      firstName?: string;
      subject: string;
      message: string;
      responseMessage: string;
    }
  ) => {
    setIsLoading(true);
    try {
      const result = await emailService.sendSupportResponseEmail(email, data);
      
      if (!result.success) {
        throw result.error || new Error('Failed to send support response email');
      }
      
      if (defaultOpts.showToast) {
        toast({
          title: "Support Response Sent",
          description: `Support response email sent to ${email}`,
        });
      }
      
      return result;
    } catch (error) {
      handleError(error, {
        showToast: defaultOpts.showToast,
        logToConsole: defaultOpts.logToConsole
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendDepositConfirmationEmail,
    sendSupportResponseEmail
  };
}
