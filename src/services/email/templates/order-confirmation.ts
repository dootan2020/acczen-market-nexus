
export const orderConfirmationEmailTemplate = (data: { 
  orderId: string; 
  username: string; 
  firstName?: string;
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
}) => {
  const name = data.firstName || data.username;
  
  // Generate items HTML
  let itemsHtml = '';
  data.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `;
  });

  // Generate digital keys HTML if available
  let digitalKeysHtml = '';
  if (data.digitalKeys && data.digitalKeys.length > 0) {
    data.digitalKeys.forEach(product => {
      digitalKeysHtml += `
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px;">${product.productName}</h3>
          <div style="background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
      `;
      
      product.keys.forEach(key => {
        digitalKeysHtml += `<code style="display: block; margin-bottom: 5px; font-family: monospace;">${key}</code>`;
      });
      
      digitalKeysHtml += `
          </div>
        </div>
      `;
    });
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - AccZen</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 150px; margin-bottom: 15px; }
    h1 { color: #2ECC71; margin-bottom: 20px; }
    .order-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background-color: #f5f5f5; text-align: left; padding: 12px; }
    .total-row td { border-top: 2px solid #ddd; font-weight: bold; }
    .button { display: inline-block; background-color: #2ECC71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .digital-keys { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
    .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://i.imgur.com/logo.png" alt="AccZen Logo" class="logo">
    <h1>Order Confirmation</h1>
  </div>
  
  <div class="content">
    <p>Hi ${name},</p>
    <p>Thank you for your purchase! Your order has been confirmed and is being processed.</p>
    
    <div class="order-info">
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Date:</strong> ${data.date}</p>
    </div>
    
    <h2>Order Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="total-row">
          <td colspan="3" style="text-align: right; padding: 12px;">Total:</td>
          <td style="text-align: right; padding: 12px;">$${data.total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    
    ${data.digitalKeys && data.digitalKeys.length > 0 ? `
    <div class="digital-keys">
      <h2>Your Digital Products</h2>
      <p>Below are the keys/credentials for your digital products:</p>
      ${digitalKeysHtml}
    </div>
    ` : ''}
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://acczen.net/orders/${data.orderId}" class="button">View Order Details</a>
    </p>
    
    <p>If you have any questions about your order, please don't hesitate to contact our support team.</p>
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
