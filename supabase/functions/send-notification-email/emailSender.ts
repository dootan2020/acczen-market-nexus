
export async function sendEmail(to: string, subject: string, htmlContent: string) {
  // Using a third-party email service like SendGrid or similar
  const emailApiKey = Deno.env.get('EMAIL_API_KEY');
  const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'noreply@acczen.net';
  const fromName = 'AccZen';
  const emailProvider = Deno.env.get('EMAIL_PROVIDER') || 'sendgrid';
  
  interface EmailServiceResponse {
    success: boolean;
    message?: string;
  }
  
  if (!emailApiKey) {
    console.log('No email API key found. Using development mode.');
    // For development/testing, we'll just log success
    console.log(`Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${fromName} <${fromEmail}>`);
    return { success: true } as EmailServiceResponse;
  }
  
  // Check which email provider to use
  if (emailProvider === 'sendgrid') {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
          }],
          from: {
            email: fromEmail,
            name: fromName,
          },
          subject: subject,
          content: [{
            type: 'text/html',
            value: htmlContent,
          }],
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`SendGrid API error status: ${response.status}`);
        console.error(`SendGrid API error text: ${errorText}`);
        throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
      }
      
      return { success: true } as EmailServiceResponse;
    } catch (error: any) {
      console.error('Error sending email via SendGrid:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } else if (emailProvider === 'resend') {
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        throw new Error('RESEND_API_KEY not configured');
      }
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject: subject,
          html: htmlContent,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resend API error:', errorData);
        throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
      }
      
      return { success: true } as EmailServiceResponse;
    } catch (error: any) {
      console.error('Error sending email via Resend:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } else {
    // For development/testing fallback
    console.log(`Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${fromName} <${fromEmail}>`);
    return { success: true } as EmailServiceResponse;
  }
}
