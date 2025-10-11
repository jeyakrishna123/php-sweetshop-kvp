import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { generateOrderQRCode } from './qrCodeGenerator.js';

// Generate PDF bill using Puppeteer
export const generateBillPDF = async (order, user) => {
  try {
    // Generate QR code for order details
    const qrCodeDataURL = await generateOrderQRCode(order._id, order.trackingNumber);
    
    // Convert logo to base64 data URL
    const logoPath = path.join(process.cwd(), 'public', 'sk-bakers-logo.webp');
    let logoDataURL = '';
    
    try {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');
        logoDataURL = `data:image/webp;base64,${logoBase64}`;
        console.log('✅ Logo loaded successfully for PDF');
      } else {
        console.log('⚠️ Logo file not found, using fallback');
        // Fallback to a simple text-based logo
        logoDataURL = '';
      }
    } catch (logoError) {
      console.error('❌ Error loading logo:', logoError);
      logoDataURL = '';
    }
    
    const htmlContent = `
      <html>
        <head>
          <title>Bill of Supply - Order #${order._id.slice(-8)}</title>
          <style>
            @page { size: A4; margin: 0.5in; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; font-size: 12px; line-height: 1.4; }
            .header { text-align: center; border: 2px solid #1f2937; padding: 20px; margin-bottom: 20px; background: #f9fafb; }
            .company-name { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
            .invoice-title { font-size: 18px; color: #374151; margin-bottom: 5px; }
            .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .customer-info, .order-info { background: #f3f4f6; padding: 15px; border-radius: 8px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #d1d5db; }
            .items-table th { background: #1f2937; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
            .items-table td { padding: 10px 8px; border: 1px solid #d1d5db; }
            .items-table tr:nth-child(even) { background: #f9fafb; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-row { font-weight: bold; font-size: 16px; padding: 10px; background: #1f2937; color: white; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #6b7280; }
            .qr-section { text-align: center; margin: 20px 0; padding: 15px; background: #f9fafb; border: 1px solid #d1d5db; border-radius: 8px; }
            .qr-code { max-width: 150px; height: auto; }
            .qr-text { font-size: 10px; color: #6b7280; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              ${logoDataURL ? 
                `<img src="${logoDataURL}" alt="SK BAKERS Logo" style="width: 200px; height: 120px; object-fit: contain;">` :
                `<div style="width: 200px; height: 120px; display: flex; align-items: center; justify-content: center; background: #1f2937; color: white; font-size: 24px; font-weight: bold; border-radius: 8px;">
                  SK BAKERS
                </div>`
              }
            </div>
            <div class="invoice-title">PREMIUM BAKERY & CONFECTIONERY</div>
            <p>Groundfloor, Gateway plaza, opposite hdfc bank, Srinivasa Nagar, Inam Maniyachi, Kovilpatti, Tamil Nadu 628502</p>
            <p>Phone: 082209 57243 | Website: www.skbakers.com</p>
          </div>
          
          <div class="invoice-details">
            <div class="customer-info">
              <h3 style="margin-top: 0; color: #1f2937;">BILL TO:</h3>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Address:</strong> ${order.shippingAddress?.address || 'N/A'}</p>
              <p><strong>City:</strong> ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'} - ${order.shippingAddress?.postalCode || 'N/A'}</p>
            </div>
            <div class="order-info">
              <h3 style="margin-top: 0; color: #1f2937;">INVOICE DETAILS:</h3>
              <p><strong>Invoice No:</strong> ${order._id.slice(-8)}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Product Details</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name}${item.selectedWeight ? ` (${item.selectedWeight.weight} Kg)` : ''}</td>
                  <td>3604</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="5" style="text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="font-weight: bold;">₹${order.itemsPrice?.toFixed(2) || order.totalPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="5" style="text-align: right;">Tax (18%):</td>
                <td>₹${order.taxPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td colspan="5" style="text-align: right;">Shipping:</td>
                <td>₹${order.shippingPrice?.toFixed(2) || '0.00'}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <strong>GRAND TOTAL: ₹${order.totalPrice.toFixed(2)}</strong>
            </div>
          </div>
          
          <div class="qr-section">
            <img src="${qrCodeDataURL}" alt="Order QR Code" class="qr-code">
            <div class="qr-text">
              <strong>Scan this QR code to view order details online</strong><br>
              Order ID: ${order._id.slice(-8)} | Tracking: ${order.trackingNumber}
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing SK BAKERS! Keep this bill for your records.</p>
            <p>For any queries, contact: Phone: 082209 57243 | Website: www.skbakers.com</p>
          </div>
        </body>
      </html>
    `;
    
    // Create PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Create PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });
    
    await browser.close();
    
    // Create filename
    const filename = `bill_${order._id.slice(-8)}_${Date.now()}.pdf`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads', 'bills');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filepath = path.join(uploadsDir, filename);
    
    // Save PDF to file
    fs.writeFileSync(filepath, pdfBuffer);
    
    return { 
      success: true, 
      filepath: filepath,
      filename: filename,
      buffer: pdfBuffer
    };
  } catch (error) {
    console.error('PDF generation failed:', error);
    return { success: false, error: error.message };
  }
};

// Generate PDF for reports
export const generatePDF = async (data, type = 'report') => {
  try {
    // For now, return a simple HTML string that can be converted to PDF
    // In production, you would use a library like puppeteer or jsPDF
    const htmlContent = `
      <html>
        <head>
          <title>${type.charAt(0).toUpperCase() + type.slice(1)} Report</title>
          <style>
            @page { size: A4; margin: 0.5in; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; font-size: 12px; line-height: 1.4; }
            .header { text-align: center; border: 2px solid #1f2937; padding: 20px; margin-bottom: 20px; background: #f9fafb; }
            .company-name { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
            .report-title { font-size: 18px; color: #374151; margin-bottom: 5px; }
            .report-details { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #d1d5db; }
            .data-table th { background: #1f2937; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
            .data-table td { padding: 10px 8px; border: 1px solid #d1d5db; }
            .data-table tr:nth-child(even) { background: #f9fafb; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">🎆 FIREWORKS PARADISE</div>
            <div class="report-title">${type.charAt(0).toUpperCase() + type.slice(1)} Report</div>
            <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
          
          <div class="report-details">
            <h3 style="margin-top: 0; color: #1f2937;">Report Summary</h3>
            <p><strong>Report Type:</strong> ${type}</p>
            <p><strong>Generated Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
            <p><strong>Data Points:</strong> ${Array.isArray(data) ? data.length : 'N/A'}</p>
          </div>
          
          ${Array.isArray(data) && data.length > 0 ? `
            <table class="data-table">
              <thead>
                <tr>
                  ${Object.keys(data[0]).map(key => `<th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.slice(0, 50).map(item => `
                  <tr>
                    ${Object.values(item).map(value => `<td>${value}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div class="report-details">
              <p>No data available for this report.</p>
            </div>
          `}
          
          <div class="footer">
            <p>This report was generated automatically by Fireworks Paradise Admin Panel.</p>
            <p>For any queries, contact: upgradenowtechnologies@gmail.com</p>
          </div>
        </body>
      </html>
    `;
    
    return { success: true, html: htmlContent };
  } catch (error) {
    console.error('PDF generation failed:', error);
    return { success: false, error: error.message };
  }
};