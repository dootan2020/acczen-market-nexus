
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  emailType: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request format: Could not parse JSON body',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Validate request data
    const { to, subject, html, emailType, metadata = {} } = requestBody as EmailRequest;
    
    if (!to || !subject || !html || !emailType) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: to, subject, html, or emailType',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email format',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Log the request for debugging
    console.log('Email request received:', {
      to,
      subject,
      emailType,
      metadata,
    });
    
    // In a real implementation, this would call an email service API
    // For now, we'll just log the request and return success
    
    // In an actual implementation, you would use a service like Resend:
    /*
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const result = await resend.emails.send({
      from: 'AccZen <noreply@acczen.net>',
      to: [to],
      subject: subject,
      html: html,
    });
    */
    
    // Create a record in the email_logs table (if available)
    // This would track emails sent in the system
    
    // For now, just return a mock success response
    return new Response(
      JSON.stringify({
        success: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in send-email function:', error);
    
    // Create a user-friendly error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred while sending the email';
    
    // Don't expose sensitive details in the error message
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
