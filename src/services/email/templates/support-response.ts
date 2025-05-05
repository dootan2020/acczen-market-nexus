
export const supportResponseEmailTemplate = (data: { 
  ticketId?: string; 
  username: string; 
  firstName?: string;
  subject: string;
  message: string;
  responseMessage?: string;
}) => {
  const name = data.firstName || data.username;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Request Received - AccZen</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 150px; margin-bottom: 15px; }
    h1 { color: #2ECC71; margin-bottom: 20px; }
    .inquiry-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .message-box { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #2ECC71; }
    .response-box { background-color: #f0f7f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #3498DB; }
    .button { display: inline-block; background-color: #2ECC71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://i.imgur.com/logo.png" alt="AccZen Logo" class="logo">
    <h1>${data.responseMessage ? 'Support Response' : 'Support Request Received'}</h1>
  </div>
  
  <div class="content">
    <p>Hi ${name},</p>
    
    ${data.responseMessage 
      ? '<p>We have responded to your support inquiry. Please see the details below:</p>' 
      : '<p>Thank you for contacting AccZen support. We have received your inquiry and will get back to you as soon as possible.</p>'
    }
    
    <div class="inquiry-info">
      ${data.ticketId ? `<p><strong>Ticket ID:</strong> ${data.ticketId}</p>` : ''}
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <h3>Your Message</h3>
    <div class="message-box">
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    </div>
    
    ${data.responseMessage ? `
    <h3>Our Response</h3>
    <div class="response-box">
      <p>${data.responseMessage.replace(/\n/g, '<br>')}</p>
    </div>
    ` : `
    <p>Our support team typically responds within 24 hours during business days. We'll notify you as soon as we have an update.</p>
    `}
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://acczen.net/support" class="button">View Support History</a>
    </p>
    
    <p>If you have any additional information to add to your request, please reply to this email or visit our support center.</p>
    <p>Best regards,<br>The AccZen Support Team</p>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} AccZen. All rights reserved.</p>
    <p>
      <a href="https://acczen.net/terms">Terms of Service</a> • 
      <a href="https://acczen.net/privacy">Privacy Policy</a>
    </p>
  </div>
</body>
</html>
  `;
};
