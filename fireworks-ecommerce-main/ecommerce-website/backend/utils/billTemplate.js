import fs from 'fs';
import path from 'path';

// Bill template generator for orders
export const generateBillTemplate = (order, user) => {
  const billDate = new Date().toLocaleDateString();
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  
  // Convert logo to base64 data URL
  const logoPath = path.join(process.cwd(), 'public', 'sk-bakers-logo.webp');
  let logoDataURL = '';
  
  try {
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      logoDataURL = `data:image/webp;base64,${logoBase64}`;
    }
  } catch (logoError) {
    console.error('❌ Error loading logo for bill template:', logoError);
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - Order #${order._id.slice(-8)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .customer-info, .invoice-info { flex: 1; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background: #f8f9fa; font-weight: bold; }
        .total-section { text-align: right; border-top: 2px solid #dc2626; padding-top: 20px; }
        .total-row { margin: 10px 0; font-size: 16px; }
        .grand-total { font-size: 20px; font-weight: bold; color: #dc2626; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            ${logoDataURL ? 
              `<img src="${logoDataURL}" alt="SK BAKERS Logo" style="width: 200px; height: 120px; object-fit: contain;">` :
              `<div style="width: 200px; height: 120px; display: flex; align-items: center; justify-content: center; background: #dc2626; color: white; font-size: 24px; font-weight: bold; border-radius: 8px;">
                SK BAKERS
              </div>`
            }
          </div>
          <div>Premium Bakery & Confectionery</div>
          <div style="margin-top: 10px; color: #666;">
            <div>Groundfloor, Gateway plaza, opposite hdfc bank, Srinivasa Nagar, Inam Maniyachi, Kovilpatti, Tamil Nadu 628502</div>
            <div>Phone: 082209 57243 | Website: www.skbakers.com</div>
          </div>
        </div>
        
        <div class="invoice-details">
          <div class="customer-info">
            <h3>Bill To:</h3>
            <div><strong>${user.name}</strong></div>
            <div>${user.email}</div>
            <div>${user.phone || 'N/A'}</div>
          </div>
          <div class="invoice-info">
            <h3>Invoice Details:</h3>
            <div><strong>Invoice #:</strong> ${order._id.slice(-8)}</div>
            <div><strong>Date:</strong> ${billDate}</div>
            <div><strong>Order Date:</strong> ${orderDate}</div>
            <div><strong>Status:</strong> ${order.status}</div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.description || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${order.totalPrice.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>₹${order.shippingPrice || 0}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>₹${order.taxPrice || 0}</span>
          </div>
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>₹${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For any queries, please contact our support team.</p>
          <p>© 2025 SK Bakers. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate simple text bill
export const generateTextBill = (order, user) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  
  let bill = `
🍰 SK Bakers - Invoice
========================

Invoice #: ${order._id.slice(-8)}
Date: ${new Date().toLocaleDateString()}
Order Date: ${orderDate}
Status: ${order.status}

Customer Information:
-------------------
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || 'N/A'}

Order Items:
------------
`;
  
  order.orderItems.forEach(item => {
    bill += `${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}\n`;
  });
  
  bill += `
Totals:
-------
Subtotal: ₹${order.totalPrice.toFixed(2)}
Shipping: ₹${order.shippingPrice || 0}
Tax: ₹${order.taxPrice || 0}
Grand Total: ₹${order.totalPrice.toFixed(2)}

Thank you for your business!
For support: support@fireworkshub.com
`;
  
  return bill;
};
