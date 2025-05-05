
import { supabase } from '@/integrations/supabase/client';
import { welcomeEmailTemplate, orderConfirmationEmailTemplate, depositConfirmationEmailTemplate, supportResponseEmailTemplate } from './templates';
import { toast } from 'sonner';

export type EmailMode = 'production' | 'development';

// Types for email data
export interface WelcomeEmailData {
  email: string;
  username: string;
  firstName?: string;
}

export interface OrderConfirmationEmailData {
  email: string;
  username: string;
  firstName?: string;
  orderId: string;
  date: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  digitalKeys?: Array<{
    productName: string;
    keys: string[];
  }>;
}

export interface DepositConfirmationEmailData {
  email: string;
  username: string;
  firstName?: string;
  depositId: string;
  date: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}

export interface SupportResponseEmailData {
  email: string;
  username: string;
  firstName?: string;
  ticketId?: string;
  subject: string;
  message: string;
  responseMessage?: string;
}

class EmailService {
  private mode: EmailMode;
  
  constructor(mode: EmailMode = 'development') {
    this.mode = mode;
  }
  
  // Set the service mode
  setMode(mode: EmailMode) {
    this.mode = mode;
    console.log(`Email service mode set to: ${mode}`);
    return this;
  }
  
  // Get current mode
  getMode(): EmailMode {
    return this.mode;
  }
  
  // Send welcome email
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const emailContent = welcomeEmailTemplate({
      username: data.username,
      firstName: data.firstName,
    });
    
    return this.sendEmail({
      to: data.email,
      subject: 'Welcome to AccZen!',
      html: emailContent,
      emailType: 'welcome',
      metadata: {
        username: data.username,
      }
    });
  }
  
  // Send order confirmation email
  async sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<boolean> {
    const emailContent = orderConfirmationEmailTemplate({
      orderId: data.orderId,
      username: data.username,
      firstName: data.firstName,
      date: data.date,
      total: data.total,
      items: data.items,
      digitalKeys: data.digitalKeys,
    });
    
    return this.sendEmail({
      to: data.email,
      subject: `Order Confirmation #${data.orderId}`,
      html: emailContent,
      emailType: 'order_confirmation',
      metadata: {
        orderId: data.orderId,
        total: data.total,
      }
    });
  }
  
  // Send deposit confirmation email
  async sendDepositConfirmationEmail(data: DepositConfirmationEmailData): Promise<boolean> {
    const emailContent = depositConfirmationEmailTemplate({
      depositId: data.depositId,
      username: data.username,
      firstName: data.firstName,
      date: data.date,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
    });
    
    return this.sendEmail({
      to: data.email,
      subject: 'Deposit Confirmation',
      html: emailContent,
      emailType: 'deposit_confirmation',
      metadata: {
        depositId: data.depositId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
      }
    });
  }
  
  // Send support response email
  async sendSupportResponseEmail(data: SupportResponseEmailData): Promise<boolean> {
    const emailContent = supportResponseEmailTemplate({
      ticketId: data.ticketId,
      username: data.username,
      firstName: data.firstName,
      subject: data.subject,
      message: data.message,
      responseMessage: data.responseMessage,
    });
    
    return this.sendEmail({
      to: data.email,
      subject: data.responseMessage ? 'Support Response: ' + data.subject : 'Support Request Received: ' + data.subject,
      html: emailContent,
      emailType: 'support_response',
      metadata: {
        ticketId: data.ticketId,
        subject: data.subject,
      }
    });
  }
  
  // Generic email sending method
  private async sendEmail({
    to,
    subject,
    html,
    emailType,
    metadata = {}
  }: {
    to: string;
    subject: string;
    html: string;
    emailType: string;
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    try {
      // In development mode, just log the email
      if (this.mode === 'development') {
        console.log('====================================');
        console.log(`📧 MOCK EMAIL (${emailType}):`);
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Metadata:', metadata);
        console.log('Email Content (HTML): Available in browser console as an object');
        console.log({emailContent: html});
        console.log('====================================');
        
        // Return success for development mode
        return true;
      }
      
      // In production mode, send the email through edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html,
          emailType,
          metadata
        }
      });
      
      if (error) {
        console.error('Error sending email:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in sendEmail:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const emailService = new EmailService();

// Export the class for testing or custom instances
export default EmailService;
