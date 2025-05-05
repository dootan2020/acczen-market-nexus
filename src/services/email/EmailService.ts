
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { parseError } from '@/utils/errorUtils';
import * as emailTemplates from './templates';
import { withRetry } from '@/utils/errorUtils';

type EmailType = 'welcome' | 'order-confirmation' | 'deposit-confirmation' | 'support-response';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  emailType: EmailType;
  metadata?: Record<string, any>;
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: Error;
}

class EmailService {
  private isDevelopment: boolean;
  
  constructor() {
    // Check if we're in development mode based on environment
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  }
  
  /**
   * Send an email using the appropriate method based on environment
   */
  public async sendEmail(options: EmailOptions): Promise<SendEmailResponse> {
    try {
      if (this.isDevelopment) {
        return this.sendMockEmail(options);
      } else {
        return this.sendRealEmail(options);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      const parsedError = parseError(error);
      
      return {
        success: false,
        error: new Error(parsedError.message)
      };
    }
  }
  
  /**
   * Send a welcome email to a new user
   */
  public async sendWelcomeEmail(to: string, data: { username: string; firstName?: string }): Promise<SendEmailResponse> {
    return this.sendEmail({
      to,
      subject: 'Welcome to AccZen!',
      html: emailTemplates.welcomeEmailTemplate(data),
      emailType: 'welcome',
      metadata: { userId: data.username }
    });
  }
  
  /**
   * Send an order confirmation email
   */
  public async sendOrderConfirmationEmail(
    to: string, 
    data: { 
      orderId: string; 
      username: string; 
      firstName?: string;
      date: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
    }
  ): Promise<SendEmailResponse> {
    return this.sendEmail({
      to,
      subject: `Order Confirmation #${data.orderId}`,
      html: emailTemplates.orderConfirmationEmailTemplate(data),
      emailType: 'order-confirmation',
      metadata: { orderId: data.orderId }
    });
  }
  
  /**
   * Send a deposit confirmation email
   */
  public async sendDepositConfirmationEmail(
    to: string,
    data: {
      depositId: string;
      username: string;
      firstName?: string;
      date: string;
      amount: number;
      paymentMethod: string;
      transactionId?: string;
    }
  ): Promise<SendEmailResponse> {
    return this.sendEmail({
      to,
      subject: 'Deposit Confirmation',
      html: emailTemplates.depositConfirmationEmailTemplate(data),
      emailType: 'deposit-confirmation',
      metadata: { depositId: data.depositId }
    });
  }
  
  /**
   * Send a support response email
   */
  public async sendSupportResponseEmail(
    to: string,
    data: {
      ticketId: string;
      username: string;
      firstName?: string;
      subject: string;
      message: string;
      responseMessage: string;
    }
  ): Promise<SendEmailResponse> {
    return this.sendEmail({
      to,
      subject: `Re: ${data.subject} [Ticket #${data.ticketId}]`,
      html: emailTemplates.supportResponseEmailTemplate(data),
      emailType: 'support-response',
      metadata: { ticketId: data.ticketId }
    });
  }
  
  /**
   * Send a real email using Supabase Edge Function
   */
  private async sendRealEmail(options: EmailOptions): Promise<SendEmailResponse> {
    return await withRetry(
      async () => {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: options
        });
        
        if (error) {
          throw new Error(`Failed to send email: ${error.message}`);
        }
        
        return {
          success: true,
          messageId: data?.messageId || `email-${Date.now()}`
        };
      },
      {
        maxRetries: 3,
        delay: 1000,
        backoffFactor: 2,
        retryCondition: (error) => {
          // Only retry on network or timeout errors
          const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
          return errorMessage.includes('network') || 
                 errorMessage.includes('timeout') || 
                 errorMessage.includes('connection');
        }
      }
    );
  }
  
  /**
   * Send a mock email (for development)
   */
  private async sendMockEmail(options: EmailOptions): Promise<SendEmailResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Log the email details
    console.group('📧 MOCK EMAIL SENT');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Type:', options.emailType);
    console.log('Metadata:', options.metadata);
    console.log('HTML Content:', options.html.substring(0, 500) + '...');
    console.groupEnd();
    
    // Show toast notification
    toast.success(`Mock email sent: ${options.subject}`, {
      description: `To: ${options.to}`,
      duration: 3000,
    });
    
    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    };
  }
}

export const emailService = new EmailService();
