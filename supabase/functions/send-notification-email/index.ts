
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email template definitions
const emailTemplates = {
  deposit_success: {
    subject: "Deposit Confirmation - Digital Deals Hub",
    getHtml: (data: any) => `
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
    getHtml: (data: any) => `
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
    getHtml: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2ECC71; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Your Order is Confirmed!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
          <p>Dear Customer,</p>
          <p>Thank you for your purchase! Your order has been confirmed and is being processed.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.order_id}</p>
            <p style="margin: 5px 0;"><strong>Total:</strong> $${data.total.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
          </div>
          
          <h3>Order Summary:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f4f4f4;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item: any) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: bold;">
                <td style="padding: 10px;">Total</td>
                <td style="padding: 10px; text-align: right;">$${data.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('PUBLIC_URL') || 'https://digitaldealshub.com'}/dashboard" style="background-color: #2ECC71; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
          </div>
          
          <p>If you have any questions about your order, please contact our support team.</p>
          
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

// Email sender function
async function sendEmail(to: string, subject: string, htmlContent: string) {
  // Using a third-party email service like SendGrid or similar
  const emailApiKey = Deno.env.get('EMAIL_API_KEY');
  const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'noreply@digitaldealshub.com';
  const fromName = 'Digital Deals Hub';
  
  // This is a placeholder for using an email service API
  try {
    // For actual implementation, replace with your email service API call
    console.log(`Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${fromName} <${fromEmail}>`);
    // For development/testing, we'll just log success
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { user_id, template, data } = await req.json();
    
    if (!user_id || !template || !data) {
      throw new Error('Missing required parameters: user_id, template, or data');
    }
    
    // Get template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template "${template}" not found`);
    }
    
    // Get user email
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', user_id)
      .single();
    
    if (userError || !userData) {
      throw new Error(`Failed to retrieve user information: ${userError?.message || 'User not found'}`);
    }
    
    // Generate email content
    const subject = emailTemplate.subject;
    const htmlContent = emailTemplate.getHtml(data);
    
    // Send email
    await sendEmail(userData.email, subject, htmlContent);
    
    // Log the email notification
    await supabaseClient
      .from('email_logs')
      .insert({
        user_id,
        email_type: template,
        recipient_email: userData.email,
        sent_at: new Date().toISOString(),
        metadata: { data }
      })
      .select();
    
    return new Response(
      JSON.stringify({ success: true, message: 'Email notification sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending notification email:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
