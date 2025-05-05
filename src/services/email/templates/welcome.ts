
export const welcomeEmailTemplate = (data: { username: string; firstName?: string }) => {
  const name = data.firstName || data.username;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AccZen</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 150px; margin-bottom: 15px; }
    h1 { color: #2ECC71; margin-bottom: 20px; }
    .content { margin-bottom: 30px; }
    .button { display: inline-block; background-color: #2ECC71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://i.imgur.com/logo.png" alt="AccZen Logo" class="logo">
    <h1>Welcome to AccZen!</h1>
  </div>
  
  <div class="content">
    <p>Hi ${name},</p>
    <p>Thank you for joining AccZen! We're excited to have you on board.</p>
    <p>At AccZen, you'll find a wide range of digital products for your needs:</p>
    <ul>
      <li>Email accounts</li>
      <li>Social media accounts</li>
      <li>Software keys and licenses</li>
      <li>And much more!</li>
    </ul>
    <p>Ready to explore? Click the button below to start shopping:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://acczen.net/products" class="button">Browse Products</a>
    </p>
    <p>If you have any questions, our support team is always here to help.</p>
    <p>Best regards,<br>The AccZen Team</p>
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
