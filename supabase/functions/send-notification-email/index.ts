import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"
import { sendEmail } from "./emailSender.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  [key: string]: any;
}

interface EmailRequest {
  user_id: string;
  template: string;
  data: EmailData;
}

// Email template definitions
const emailTemplates = {
  deposit_success: {
    subject: "Deposit Confirmation - Digital Deals Hub",
    getHtml: (data: EmailData) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2ECC71; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Deposit Successful</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
          <p>Dear Customer,</p>
          <p>Your deposit has been successfully processed and added to your account balance.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.payment_method}</p>
            <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transaction_id}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
          </div>
          
          <p>Your updated balance is now available in your account. You can use these funds to make purchases on our platform.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('PUBLIC_URL') || 'https://digitaldealshub.com'}/dashboard" style="background-color: #2ECC71; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Account</a>
          </div>
          
          <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
          
          <p>Thank you for using Digital Deals Hub!</p>
          
          <p style="margin-top: 30px;">Best regards,<br/>The Digital Deals Hub Team</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message, please do not reply directly to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Digital Deals Hub. All rights reserved.</p>
        </div>
      </div>
    `,
  },
  usdt_deposit_admin_notification: {
    subject: "New USDT Deposit Requires Verification",
    getHtml: (data: EmailData) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3498DB; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New USDT Deposit</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
          <p>Hello Admin,</p>
          <p>A new USDT deposit has been submitted and requires verification.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>User:</strong> ${data.user_email}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Transaction Hash:</strong> ${data.transaction_hash}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('PUBLIC_URL') || 'https://digitaldealshub.com'}/admin/deposits" style="background-color: #3498DB; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Deposit</a>
          </div>
          
          <p>Please verify this transaction on the Tron blockchain and approve or reject it accordingly.</p>
          
          <p style="margin-top: 30px;">Digital Deals Hub Admin System</p>
        </div>
      </div>
    `,
  },
  order_confirmation: {
    subject: "Order Confirmation - Digital Deals Hub",
    getHtml: (data: EmailData) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2ECC71; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Your Order is Confirmed!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
          <p>Dear ${data.customer_name || 'Customer'},</p>
          <p>Thank you for your purchase! Your order has been confirmed and is being processed.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.order_id}</p>
            <p style="margin: 5px 0;"><strong>Total:</strong> $${data.total.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.payment_method}</p>
            ${data.transaction_id ? `<p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transaction_id}</p>` : ''}
          </div>
          
          <h3>Order Summary:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f4f4f4;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item: any) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                  <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: bold;">
                <td style="padding: 10px;" colspan="3">Total</td>
                <td style="padding: 10px; text-align: right;">$${data.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          ${data.digital_items && data.digital_items.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h3>Your Digital Items:</h3>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
              ${data.digital_items.map((item: any) => `
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                  <p style="font-weight: bold; margin: 0 0 5px 0;">${item.name}</p>
                  ${item.keys && item.keys.length > 0 ? `
                    <div style="background-color: #eaf7ff; padding: 10px; border-radius: 3px; font-family: monospace; overflow-wrap: break-word;">
                      ${item.keys.join('<br>')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          
          <div style="background-color: #f3f9f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2ECC71;">Track Your Order</h3>
            <p>You can view the complete details of your order and track its status in your account dashboard.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('PUBLIC_URL') || 'https://digitaldealshub.com'}/dashboard/purchases" style="background-color: #2ECC71; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
          </div>
          
          <p>If you have any questions about your order, please contact our support team.</p>
          
          <p>Thank you for shopping with Digital Deals Hub!</p>
          
          <p style="margin-top: 30px;">Best regards,<br/>The Digital Deals Hub Team</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message, please do not reply directly to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Digital Deals Hub. All rights reserved.</p>
          <p>
            <a href="${Deno.env.get('PUBLIC_URL') || 'https://digitaldealshub.com'}/terms" style="color: #666; text-decoration: none; margin: 0 5px;">Terms of Service</a> |
            <a href="${Deno.env.get('PUBLIC_URL') || 'https://digitaldealshub.com'}/privacy" style="color: #666; text-decoration: none; margin: 0 5px;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `,
  },
  order_status_update: {
    subject: "Order Status Update - Digital Deals Hub",
    getHtml: (data: EmailData) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3498DB; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Status Update</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
          <p>Dear ${data.customer_name || 'Customer'},</p>
          <p>The status of your order has been updated.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.order_id}</p>
            <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: ${
              data.status === 'completed' ? '#2ECC71' : 
              data.status === 'processing' ? '#3498DB' : 
              data.status === 'cancelled' ? '#E74C3C' : '#F39C12'
            }; font-weight: bold;">${data.status.toUpperCase()}</span></p>
            <p style="margin: 5px 0;"><strong>Updated On:</strong> ${new Date(data.updated_at).toLocaleString()}</p>
          </div>
          
          ${data.message ? `<p>${data.message}</p>` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('PUBLIC_URL') || 'https://digitaldealshub.com'}/dashboard/purchases" style="background-color: #3498DB; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Thank you for shopping with Digital Deals Hub!</p>
          
          <p style="margin-top: 30px;">Best regards,<br/>The Digital Deals Hub Team</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message, please do not reply directly to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Digital Deals Hub. All rights reserved.</p>
        </div>
      </div>
    `,
  },
};

export const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body with type safety
    const { user_id, template, data } = await req.json() as EmailRequest;
    
    if (!user_id || !template || !data) {
      throw new Error('Missing required parameters: user_id, template, or data');
    }
    
    // Get template with type safety
    const emailTemplate = emailTemplates[template as keyof typeof emailTemplates];
    if (!emailTemplate) {
      throw new Error(`Email template "${template}" not found`);
    }
    
    // Get user email with type safety
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('email, full_name, username')
      .eq('id', user_id)
      .single();
    
    if (userError || !userData) {
      throw new Error(`Failed to retrieve user information: ${userError?.message || 'User not found'}`);
    }
    
    // Generate email content with proper typing
    const subject = emailTemplate.subject;
    
    // Add user name to data for personalization if needed
    const enrichedData = {
      ...data,
      customer_name: userData.full_name || userData.username,
    };
    
    const htmlContent = emailTemplate.getHtml(enrichedData);
    
    // Send email with retry
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        await sendEmail(userData.email, subject, htmlContent);
        
        // Log the email notification
        await supabaseClient
          .from('email_logs')
          .insert({
            user_id,
            email_type: template,
            recipient_email: userData.email,
            sent_at: new Date().toISOString(),
            metadata: { data: enrichedData }
          });
        
        return new Response(
          JSON.stringify({ success: true, message: 'Email notification sent successfully' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (error: any) {
        console.error(`Email sending attempt ${attempts + 1} failed:`, error.message);
        lastError = error;
        attempts++;
        
        // Wait before retrying
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        }
      }
    }
    
    // If we get here, all attempts failed
    throw new Error(`Failed to send email after ${maxAttempts} attempts: ${lastError?.message}`);
  } catch (error: any) {
    console.error('Error sending notification email:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);
