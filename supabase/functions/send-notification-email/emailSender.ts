
export async function sendEmail(to: string, subject: string, htmlContent: string) {
  // Using a third-party email service like SendGrid or similar
  const emailApiKey = Deno.env.get('EMAIL_API_KEY');
  const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'noreply@digitaldealshub.com';
  const fromName = 'Digital Deals Hub';
  
  // Check if we're using SendGrid
  if (Deno.env.get('EMAIL_PROVIDER') === 'sendgrid' && emailApiKey) {
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
        throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } else {
    // For development/testing, we'll just log success
    console.log(`Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${fromName} <${fromEmail}>`);
    return { success: true };
  }
}
