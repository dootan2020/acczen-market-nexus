
export const depositConfirmationEmailTemplate = (data: { 
  depositId: string; 
  username: string; 
  firstName?: string;
  date: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}) => {
  const name = data.firstName || data.username;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deposit Confirmation - AccZen</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 150px; margin-bottom: 15px; }
    h1 { color: #2ECC71; margin-bottom: 20px; }
    .deposit-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .amount { font-size: 24px; font-weight: bold; color: #2ECC71; }
    .button { display: inline-block; background-color: #2ECC71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://i.imgur.com/logo.png" alt="AccZen Logo" class="logo">
    <h1>Deposit Confirmation</h1>
  </div>
  
  <div class="content">
    <p>Hi ${name},</p>
    <p>Good news! Your deposit has been successfully processed and added to your account balance.</p>
    
    <div class="deposit-info">
      <p><strong>Deposit ID:</strong> ${data.depositId}</p>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
      ${data.transactionId ? `<p><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
      <p><strong>Amount:</strong> <span class="amount">$${data.amount.toFixed(2)}</span></p>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://acczen.net/dashboard" class="button">Go to My Account</a>
    </p>
    
    <p>Your account has been credited with the deposited amount, and you can now use it to make purchases on AccZen.</p>
    <p>If you have any questions about your deposit, please contact our support team.</p>
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
