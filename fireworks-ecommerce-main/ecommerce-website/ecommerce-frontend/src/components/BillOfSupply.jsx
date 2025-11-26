import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { orderAPI } from '../utils/adminAPI';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BillOfSupply = ({ order, onClose }) => {
  const { showToast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  
  if (!order) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  // Send email function - converts invoice to PDF and sends to customer
  const sendEmailToCustomer = async () => {
    console.log("📧 sendEmailToCustomer - Button clicked");
    console.log("📧 sendEmailToCustomer - Order:", order);
    
    const printContent = document.querySelector('.print-content');
    
    if (!printContent) {
      showToast("Error: Could not find bill content to email", "error", 3000);
      console.error("❌ Print content not found");
      return;
    }
    
    if (!order) {
      showToast("Error: Order data is missing", "error", 3000);
      console.error("❌ Order is missing");
      return;
    }
    
    // Get order ID - try multiple possible fields in priority order
    // Backend uses numeric ID, so prioritize id over _id
    let orderId = order.id || order._id || order.orderId || order.order_id;
    
    console.log("📧 Order ID extraction - order.id:", order.id);
    console.log("📧 Order ID extraction - order._id:", order._id);
    console.log("📧 Order ID extraction - order.orderId:", order.orderId);
    console.log("📧 Order ID extraction - order.order_id:", order.order_id);
    console.log("📧 Order ID extraction - Selected orderId:", orderId);
    console.log("📧 Order ID extraction - Order object keys:", Object.keys(order));
    
    // If orderId is a temp ID (starts with "temp-"), we can't send email
    if (!orderId || String(orderId).startsWith('temp-')) {
      showToast("Error: Valid Order ID is required to send email", "error", 3000);
      console.error("❌ Order ID is missing or invalid:", orderId);
      console.error("❌ Full order object:", order);
      return;
    }
    
    try {
      setIsSendingEmail(true);
      showToast("📧 Generating PDF and sending invoice to customer...", "info", 2000);
      
      console.log("📧 Step 1: Starting PDF generation...");
      
      // Generate PDF using the same method as download
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("📧 Step 2: Converting to canvas with html2canvas...");
      
      // Configure html2canvas for high quality
      let canvas;
      try {
        canvas = await html2canvas(printContent, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: printContent.scrollWidth,
          height: printContent.scrollHeight,
          windowWidth: printContent.scrollWidth,
          windowHeight: printContent.scrollHeight,
        });
        console.log("✅ Step 2: Canvas created successfully", canvas.width, "x", canvas.height);
      } catch (canvasError) {
        console.error("❌ Step 2: Canvas creation failed:", canvasError);
        throw new Error("Failed to generate PDF image: " + canvasError.message);
      }
      
      console.log("📧 Step 3: Creating PDF document...");
      
      // Calculate PDF dimensions (A4 size in mm)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Handle multi-page PDF if content is taller than one page
      const pageHeight = pdf.internal.pageSize.height;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      console.log("✅ Step 3: PDF document created");
      
      console.log("📧 Step 4: Converting PDF to base64...");
      
      // Get PDF as base64 string
      // Use 'datauristring' which includes the data URI prefix, then extract base64 part
      const pdfDataUri = pdf.output('datauristring');
      const pdfBase64 = pdfDataUri.includes(',') ? pdfDataUri.split(',')[1] : pdfDataUri;
      
      if (!pdfBase64 || pdfBase64.length < 100) {
        throw new Error("PDF generation failed: Base64 data is too short");
      }
      
      // Log PDF size for debugging
      const pdfSizeMB = (pdfBase64.length * 3 / 4 / 1024 / 1024).toFixed(2);
      console.log("✅ Step 4: PDF converted to base64");
      console.log("✅ Step 4: PDF base64 length:", pdfBase64.length, "characters");
      console.log("✅ Step 4: PDF estimated size:", pdfSizeMB, "MB");
      console.log("✅ Step 4: PDF will be sent to backend (this may take time for large PDFs)");
      
      // Warn if PDF is very large (>5MB)
      if (parseFloat(pdfSizeMB) > 5) {
        console.warn("⚠️ PDF is large (" + pdfSizeMB + " MB). Upload may take longer.");
      }
      
      // Generate filename - use the orderId we already validated above
      // Ensure it's a clean numeric string for the backend
      let cleanOrderId = String(orderId).trim();
      
      console.log("📧 Order ID cleaning - Original:", cleanOrderId);
      console.log("📧 Order ID cleaning - Type:", typeof cleanOrderId);
      
      // Extract numeric part - backend expects integer ID
      // Try to get the numeric ID directly
      if (/^\d+$/.test(cleanOrderId)) {
        // Already numeric, use as-is
        cleanOrderId = cleanOrderId;
      } else {
        // Try to extract numeric part from string
        const extractedNumeric = cleanOrderId.match(/\d+/);
        if (extractedNumeric && extractedNumeric[0]) {
          cleanOrderId = extractedNumeric[0];
          console.log("📧 Order ID cleaning - Extracted numeric:", cleanOrderId);
        } else {
          // If no numeric found, try to use the ID as-is (might be valid)
          console.warn("⚠️ Order ID cleaning - No numeric found, using as-is:", cleanOrderId);
          // Don't throw error - let backend validate it
        }
      }
      
      // Final validation - ensure it's not empty
      if (!cleanOrderId || cleanOrderId === '') {
        throw new Error("Invalid order ID: Cannot extract numeric ID from " + String(orderId));
      }
      
      console.log("📧 Order ID cleaning - Final cleanOrderId:", cleanOrderId);
      
      const filename = `Bill_of_Supply_${cleanOrderId}_${formatDate(order.createdAt).replace(/\//g, '-')}.pdf`;
      
      console.log("📧 Step 5: Sending PDF to backend...");
      console.log("📧 Step 5: Original order._id:", order._id);
      console.log("📧 Step 5: Original order.id:", order.id);
      console.log("📧 Step 5: Cleaned Order ID:", cleanOrderId);
      console.log("📧 Step 5: Filename:", filename);
      console.log("📧 Step 5: PDF Base64 length:", pdfBase64.length);
      console.log("📧 Step 5: Full order object keys:", Object.keys(order));
      
      // Send PDF to backend - use cleaned numeric ID
      let response;
      try {
        response = await orderAPI.sendBillEmailWithPDF(cleanOrderId, pdfBase64, filename);
        console.log("✅ Step 5: Backend response received:", response);
      } catch (apiError) {
        // Re-throw to be caught by outer catch block
        console.error("❌ Step 5: API call failed:", apiError);
        throw apiError;
      }
      
      if (response && response.success) {
        showToast("📧 Invoice PDF sent successfully to customer's email!", "success", 3000);
      } else {
        const errorMsg = response?.message || "Unknown error occurred";
        showToast("Failed to send email: " + errorMsg, "error", 5000);
        console.error("❌ Backend returned unsuccessful response:", response);
      }
    } catch (error) {
      // Comprehensive error logging
      console.error("❌ Error sending email - Full error:", error);
      console.error("❌ Error name:", error?.name || 'Unknown');
      console.error("❌ Error message:", error?.message || 'Unknown error');
      console.error("❌ Error stack:", error?.stack || 'No stack trace');
      console.error("❌ Error details:", error?.details || 'No details');
      console.error("❌ Full error response:", error?.response || 'No response');
      console.error("❌ Error response data:", error?.response?.data || 'No response data');
      console.error("❌ Error response status:", error?.response?.status || 'No status');
      
      // Prevent unhandled promise rejection
      if (error && typeof error === 'object') {
        // Ensure error has all necessary properties
        if (!error.name) error.name = 'EmailSendError';
        if (!error.message) error.message = 'Failed to send email';
      }
      
      // Extract error message - try multiple sources
      let errorMessage = "Failed to send email";
      
      // First, try to get the message from the error object itself (from adminAPI)
      if (error.message && error.message !== "Failed to send bill email with PDF") {
        errorMessage = error.message;
      }
      
      // Second, try to extract directly from response data (bypass adminAPI extraction)
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // Try to get message from response
        if (responseData.message && typeof responseData.message === 'string') {
          errorMessage = responseData.message;
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
        
        // Try to extract details from response data
        const responseDetails = responseData.data || responseData.errors || {};
        
        // Add PHPMailer error if available
        if (responseDetails.phpmailer_error && responseDetails.phpmailer_error !== 'No detailed error available') {
          const phpmailerError = String(responseDetails.phpmailer_error);
          if (phpmailerError.length > 100) {
            errorMessage += ' - PHPMailer: ' + phpmailerError.substring(0, 100) + '...';
          } else {
            errorMessage += ' - PHPMailer: ' + phpmailerError;
          }
        } else if (responseDetails.phpmailer_status === 'not_installed') {
          errorMessage += ' - PHPMailer is not installed';
        }
        
        // Add SMTP config issues
        if (responseDetails.smtp_config) {
          const smtp = responseDetails.smtp_config;
          const issues = [];
          if (smtp.host === 'not_configured') issues.push('SMTP host');
          if (smtp.port === 'not_configured') issues.push('SMTP port');
          if (smtp.username === 'not_configured' || smtp.username === 'empty') issues.push('SMTP username');
          if (smtp.password === 'not_configured' || smtp.password === 'empty') issues.push('SMTP password');
          if (issues.length > 0) {
            errorMessage += ' - Missing: ' + issues.join(', ');
          }
        }
        
        // Add hint if available
        if (responseDetails.hint) {
          errorMessage += ' - ' + responseDetails.hint;
        }
      }
      
      // Handle network errors
      if (error.isNetworkError || error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || !error.response) {
        errorMessage = "Network error: Unable to connect to server. Please check your internet connection.";
      }
      
      // If the error message doesn't have details yet, try to extract them from error.details
      if (!errorMessage.includes('PHPMailer') && !errorMessage.includes('SMTP') && error.details) {
        const additionalInfo = [];
        
        // Show PHPMailer error first (most important)
        if (error.details.phpmailer_error && error.details.phpmailer_error !== 'No detailed error available') {
          const phpmailerError = String(error.details.phpmailer_error);
          if (phpmailerError.length > 100) {
            additionalInfo.push(`PHPMailer: ${phpmailerError.substring(0, 100)}...`);
          } else {
            additionalInfo.push(`PHPMailer: ${phpmailerError}`);
          }
        } else if (error.details.phpmailer_status === 'not_installed') {
          additionalInfo.push("PHPMailer not installed");
        }
        
        if (error.details.smtp_config) {
          const smtp = error.details.smtp_config;
          const issues = [];
          if (smtp.host === 'not_configured') issues.push('SMTP host');
          if (smtp.port === 'not_configured') issues.push('SMTP port');
          if (smtp.username === 'not_configured' || smtp.username === 'empty') issues.push('SMTP username');
          if (smtp.password === 'not_configured' || smtp.password === 'empty') issues.push('SMTP password');
          if (issues.length > 0) {
            additionalInfo.push(`Missing: ${issues.join(', ')}`);
          }
        }
        
        if (additionalInfo.length > 0) {
          errorMessage += ' - ' + additionalInfo.join(', ');
        }
      }
      
      // Final fallback: if still generic, show HTTP status
      if (errorMessage === "Failed to send email" || errorMessage === "Failed to send bill email with PDF") {
        if (error.response?.status) {
          errorMessage = `Failed to send email (HTTP ${error.response.status})`;
        } else if (!error.response) {
          errorMessage = "Network error: Unable to connect to server";
        } else {
          errorMessage = "Failed to send email - Check console for details";
        }
      }
      
      // Ensure error message is not empty
      if (!errorMessage || errorMessage.trim() === '') {
        errorMessage = "An error occurred while sending the email. Please try again.";
      }
      
      // Show error toast with detailed message
      console.error("📧 Final error message to display:", errorMessage);
      console.error("📧 Error object summary:", {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        isNetworkError: error.isNetworkError,
        hasResponse: !!error.response
      });
      
      // Show toast with error message (max 15 seconds for detailed errors)
      showToast(errorMessage, "error", 15000);
    } finally {
      setIsSendingEmail(false);
      console.log("📧 sendEmailToCustomer - Process completed");
    }
  };

  // High-quality print function
  const handlePrint = () => {
    const printContent = document.querySelector('.print-content');
    
    if (!printContent) {
      showToast("Error: Could not find bill content to print", "error", 3000);
      console.error("Print content not found");
      return;
    }
    
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      showToast("Please allow popups to print the bill", "error", 3000);
      return;
    }
    
    try {
      // Get the HTML content and fix logo URLs
      let content = printContent.innerHTML;
      // Replace relative logo paths with full URLs - try multiple possible paths
      const logoUrl = `${window.location.origin}/billlogo.webp`;
      const logoUrlPng = `${window.location.origin}/sk-bakers-logo.png`;
      // Replace all possible logo path variations
      content = content.replace(/src="\/billlogo\.webp"/g, `src="${logoUrl}"`);
      content = content.replace(/src='\/billlogo\.webp'/g, `src='${logoUrl}'`);
      content = content.replace(/src="\/sk-bakers-logo\.png"/g, `src="${logoUrlPng}"`);
      content = content.replace(/src='\/sk-bakers-logo\.png'/g, `src='${logoUrlPng}'`);
      // Also replace window.location.origin patterns
      content = content.replace(/src="\$\{window\.location\.origin\}\/billlogo\.webp"/g, `src="${logoUrl}"`);
      content = content.replace(/src='\$\{window\.location\.origin\}\/billlogo\.webp'/g, `src='${logoUrl}'`);
      
      // Create the HTML document for high-quality printing
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bill of Supply - ${order._id}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 0.2in;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              color: black;
              width: 100%;
              min-height: 100vh;
              line-height: 1.2;
              font-size: 10px;
            }
            .bg-white { background: white !important; }
            .bg-gray-50 { background: #f9fafb !important; }
            .bg-gray-100 { background: #f3f4f6 !important; }
            .bg-gray-800 { background: #1f2937 !important; }
            .text-gray-900 { color: #111827 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-white { color: white !important; }
            .border-2 { border: 2px solid #d1d5db !important; }
            .border { border: 1px solid #d1d5db !important; }
            .border-b-2 { border-bottom: 2px solid #d1d5db !important; }
            .border-b-4 { border-bottom: 4px solid #1f2937 !important; }
            .border-t-2 { border-top: 2px solid #1f2937 !important; }
            .border-r { border-right: 1px solid #d1d5db !important; }
            .border-gray-300 { border-color: #d1d5db !important; }
            .border-gray-400 { border-color: #9ca3af !important; }
            .border-gray-800 { border-color: #1f2937 !important; }
            .p-8 { padding: 0.5rem !important; }
            .p-6 { padding: 0.375rem !important; }
            .p-4 { padding: 0.25rem !important; }
            .p-3 { padding: 0.2rem !important; }
            .p-2 { padding: 0.15rem !important; }
            .px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
            .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
            .py-3 { padding-top: 0.375rem !important; padding-bottom: 0.375rem !important; }
            .py-2 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
            .py-1 { padding-top: 0.125rem !important; padding-bottom: 0.125rem !important; }
            .mb-8 { margin-bottom: 0.3rem !important; }
            .mb-6 { margin-bottom: 0.25rem !important; }
            .mb-4 { margin-bottom: 0.2rem !important; }
            .mb-3 { margin-bottom: 0.15rem !important; }
            .mb-2 { margin-bottom: 0.1rem !important; }
            .mb-1 { margin-bottom: 0.05rem !important; }
            .mt-4 { margin-top: 0.5rem !important; }
            .space-y-4 > * + * { margin-top: 0.15rem !important; }
            .space-y-3 > * + * { margin-top: 0.1rem !important; }
            .space-y-2 > * + * { margin-top: 0.05rem !important; }
            .space-x-4 > * + * { margin-left: 0.5rem !important; }
            .space-x-3 > * + * { margin-left: 0.375rem !important; }
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .gap-8 { gap: 0.75rem !important; }
            .gap-3 { gap: 0.5rem !important; }
            .flex { display: flex !important; }
            .items-center { align-items: center !important; }
            .items-start { align-items: flex-start !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-end { justify-content: flex-end !important; }
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            .text-right { text-align: right !important; }
            .w-20 { width: 5rem !important; }
            .w-24 { width: 6rem !important; }
            .flex-1 { flex: 1 1 0% !important; }
            .leading-tight { line-height: 1.25 !important; }
            .gap-2 { gap: 0.5rem !important; }
            .space-y-1 > * + * { margin-top: 0.25rem !important; }
            .text-4xl { font-size: 2rem !important; line-height: 2.5rem !important; }
            .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
            .text-lg { font-size: 1.125rem !important; line-height: 1.5rem !important; }
            .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
            .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            .italic { font-style: italic !important; }
            .tracking-wide { letter-spacing: 0.025em !important; }
            .w-96 { width: 18rem !important; }
            .w-40 { width: 8rem !important; }
            .w-12 { width: 2.5rem !important; }
            .w-6 { width: 1.25rem !important; }
            .h-12 { height: 2.5rem !important; }
            .h-6 { height: 1.25rem !important; }
            .object-cover { object-fit: cover !important; }
            .break-all { word-break: break-all !important; }
            .flex-shrink-0 { flex-shrink: 0 !important; }
            img { 
              max-width: 100% !important; 
              height: auto !important; 
              display: block !important; 
            }
            .w-12 { width: 3rem !important; }
            .h-12 { height: 3rem !important; }
            .overflow-hidden { overflow: hidden !important; }
            .overflow-x-auto { overflow-x: auto !important; }
            .border-collapse { border-collapse: collapse !important; }
            table { 
              width: 100% !important; 
              border-spacing: 0 !important;
              table-layout: fixed !important;
            }
            th, td { 
              padding: 0.2rem 0.3rem !important; 
              border: 1px solid #d1d5db !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            tr { 
              page-break-inside: avoid !important; 
              break-inside: avoid !important;
            }
            .page-break-inside-avoid { 
              page-break-inside: avoid !important; 
              break-inside: avoid !important;
            }
            tbody tr:nth-child(even) { background-color: #f9fafb !important; }
            tbody tr:nth-child(odd) { background-color: white !important; }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body { 
                margin: 0 !important; 
                padding: 0 !important; 
                font-size: 10px !important;
                line-height: 1.2 !important;
                width: 100% !important;
                overflow: visible !important;
              }
              .no-print { display: none !important; }
              .print-content {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                page-break-inside: avoid !important;
              }
              .print-content > div {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
              }
              /* Grid Layout - Prevent Collapse */
              .grid { 
                display: grid !important;
                width: 100% !important;
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 0.5rem !important;
              }
              .grid-cols-2 { 
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                display: grid !important;
                width: 100% !important;
              }
              .grid-cols-1 { 
                grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
                display: grid !important;
                width: 100% !important;
              }
              /* Flex Layout - Prevent Collapse */
              .flex { 
                display: flex !important;
                width: 100% !important;
              }
              .items-center { align-items: center !important; }
              .items-start { align-items: flex-start !important; }
              .justify-between { justify-content: space-between !important; }
              .justify-end { justify-content: flex-end !important; }
              .text-center { text-align: center !important; }
              .text-left { text-align: left !important; }
              .text-right { text-align: right !important; }
              /* Sizing - Prevent Collapse */
              .w-20 { width: 5rem !important; min-width: 5rem !important; }
              .w-24 { width: 6rem !important; min-width: 6rem !important; }
              .w-12 { width: 3rem !important; min-width: 3rem !important; }
              .h-12 { height: 3rem !important; min-height: 3rem !important; }
              .flex-1 { flex: 1 1 0% !important; min-width: 0 !important; }
              /* Spacing */
              .p-2 { padding: 0.5rem !important; }
              .p-1 { padding: 0.25rem !important; }
              .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
              .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
              .mb-2 { margin-bottom: 0.5rem !important; }
              .mb-1 { margin-bottom: 0.25rem !important; }
              .space-y-1 > * + * { margin-top: 0.25rem !important; }
              .gap-2 { gap: 0.5rem !important; }
              .leading-tight { line-height: 1.25 !important; }
              /* Borders */
              .border { border: 1px solid #d1d5db !important; }
              .border-2 { border: 2px solid #d1d5db !important; }
              .border-b-2 { border-bottom: 2px solid #1f2937 !important; }
              .border-b-4 { border-bottom: 4px solid #1f2937 !important; }
              .border-b { border-bottom: 1px solid #d1d5db !important; }
              .border-r { border-right: 1px solid #d1d5db !important; }
              .border-gray-300 { border-color: #d1d5db !important; }
              .border-gray-400 { border-color: #9ca3af !important; }
              .border-gray-800 { border-color: #1f2937 !important; }
              /* Colors */
              .bg-white { background-color: white !important; }
              .bg-gray-50 { background-color: #f9fafb !important; }
              .bg-gray-100 { background-color: #f3f4f6 !important; }
              .bg-gray-800 { background-color: #1f2937 !important; }
              .text-gray-700 { color: #374151 !important; }
              .text-gray-900 { color: #111827 !important; }
              .text-white { color: white !important; }
              /* Typography */
              .text-xs { font-size: 0.75rem !important; }
              .text-sm { font-size: 0.875rem !important; }
              .text-xl { font-size: 1.25rem !important; }
              .font-bold { font-weight: 700 !important; }
              .font-semibold { font-weight: 600 !important; }
              /* Table - Prevent Collapse */
              table { 
                width: 100% !important;
                max-width: 100% !important;
                table-layout: fixed !important;
                border-collapse: collapse !important;
                border-spacing: 0 !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              thead {
                display: table-header-group !important;
              }
              tbody {
                display: table-row-group !important;
              }
              tr { 
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: table-row !important;
              }
              th, td { 
                padding: 0.2rem 0.3rem !important;
                border: 1px solid #d1d5db !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                display: table-cell !important;
                vertical-align: top !important;
              }
              th {
                font-weight: 700 !important;
              }
              /* Images */
              img {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
                page-break-inside: avoid !important;
              }
              /* Prevent page breaks in critical sections */
              .page-break-inside-avoid { 
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .page-break-before { 
                page-break-before: always !important;
              }
              .page-break-after { 
                page-break-after: always !important;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `;
      
      // Write the content to the new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content and images to load, then trigger print
      printWindow.onload = () => {
        // Wait for all images to load
        const images = printWindow.document.querySelectorAll('img');
        let imagesLoaded = 0;
        const totalImages = images.length;
        
        if (totalImages === 0) {
          // No images, proceed immediately
          setTimeout(() => {
            printWindow.print();
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          }, 300);
        } else {
          // Wait for all images to load
          images.forEach((img) => {
            if (img.complete) {
              imagesLoaded++;
              if (imagesLoaded === totalImages) {
                setTimeout(() => {
                  printWindow.print();
                  setTimeout(() => {
                    printWindow.close();
                  }, 1000);
                }, 300);
              }
            } else {
              img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                  setTimeout(() => {
                    printWindow.print();
                    setTimeout(() => {
                      printWindow.close();
                    }, 1000);
                  }, 300);
                }
              };
              img.onerror = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                  setTimeout(() => {
                    printWindow.print();
                    setTimeout(() => {
                      printWindow.close();
                    }, 1000);
                  }, 300);
                }
              };
            }
          });
          
          // Fallback timeout in case images don't load
          setTimeout(() => {
            if (imagesLoaded < totalImages) {
              printWindow.print();
              setTimeout(() => {
                printWindow.close();
              }, 1000);
            }
          }, 3000);
        }
      };
    } catch (error) {
      console.error("Error in handlePrint:", error);
      showToast("Error printing bill: " + error.message, "error", 3000);
      if (printWindow) {
        printWindow.close();
      }
    }
  };

  // Download PDF function
  const handleDownloadPDF = async () => {
    const printContent = document.querySelector('.print-content');
    
    if (!printContent) {
      showToast("Error: Could not find bill content to download", "error", 3000);
      console.error("Print content not found");
      return;
    }
    
    try {
      setIsDownloadingPDF(true);
      showToast("📄 Generating PDF...", "info", 2000);
      
      // Wait a bit for the toast to show
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Configure html2canvas for high quality
      const canvas = await html2canvas(printContent, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: printContent.scrollWidth,
        height: printContent.scrollHeight,
        windowWidth: printContent.scrollWidth,
        windowHeight: printContent.scrollHeight,
      });
      
      // Calculate PDF dimensions (A4 size in mm)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Handle multi-page PDF if content is taller than one page
      const pageHeight = pdf.internal.pageSize.height;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename
      const orderId = order._id ? order._id.slice(-8) : 'invoice';
      const filename = `Bill_of_Supply_${orderId}_${formatDate(order.createdAt).replace(/\//g, '-')}.pdf`;
      
      // Download PDF
      pdf.save(filename);
      
      showToast("✅ PDF downloaded successfully!", "success", 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error generating PDF: " + error.message, "error", 3000);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-[210mm] max-w-[210mm] max-h-[95vh] overflow-y-auto" style={{aspectRatio: '210/297'}}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg no-print">
          <h2 className="text-xl font-bold">📄 Bill of Supply</h2>
          <div className="flex space-x-2">
            <button
              onClick={sendEmailToCustomer}
              disabled={isSendingEmail}
              className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send Email with PDF to Customer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{isSendingEmail ? "Sending..." : "Email"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2 font-medium"
              title="Print Bill"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download PDF to Local Device"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{isDownloadingPDF ? "Downloading..." : "Download PDF"}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition duration-200 font-medium"
              title="Close"
            >
              Close
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div className="p-2 print:p-0 print-content">
          <div className="bg-white border-2 border-gray-200 print:border-0 print:shadow-none shadow-lg rounded-lg overflow-hidden">
            {/* Bill Header */}
            <div className="bg-white border-b-2 border-gray-800 p-2">
              <div className="flex justify-between items-center mb-2">
                <div className="border border-gray-300 px-2 py-1 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700">Phone: 082209 57243</p>
                </div>
                <div className="border border-gray-300 px-2 py-1 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700">Website: www.skbakers.com</p>
                </div>
              </div>
              
              <div className="text-center border border-gray-800 p-2 bg-gray-50">
                <div className="flex justify-center items-center mb-3">
                  <img 
                    src={`${window.location.origin}/billlogo.webp`}
                    alt="SK BAKERS Logo" 
                    className="w-48 h-28 object-contain mx-auto"
                    style={{ maxWidth: '200px', maxHeight: '120px', height: 'auto', width: 'auto' }}
                    onError={(e) => {
                      // Try fallback logo
                      if (e.target.src !== `${window.location.origin}/sk-bakers-logo.png`) {
                        e.target.src = `${window.location.origin}/sk-bakers-logo.png`;
                      } else {
                        // If both fail, show text fallback
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'text-2xl font-bold text-red-600 p-5 bg-red-50 rounded-lg';
                        fallback.textContent = 'SK BAKERS';
                        e.target.parentElement.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">PREMIUM BAKERY & CONFECTIONERY</p>
                <p className="text-xs text-gray-600">
                  Groundfloor, Gateway plaza, opposite hdfc bank, Srinivasa Nagar, Inam Maniyachi, Kovilpatti, Tamil Nadu 628502
                </p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="p-1 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* Left Side - Recipient Details */}
                <div className="bg-white border border-gray-300 p-2">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-400 pb-1 text-center">
                    RECIPIENT DETAILS
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700 w-20">Name:</span>
                      <span className="text-xs text-gray-900 font-semibold flex-1 text-right">{order.user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-gray-700 w-20">Address:</span>
                      <span className="text-xs text-gray-900 flex-1 text-right leading-tight">
                        {order.shippingAddress?.address || 'N/A'}, {order.shippingAddress?.city || ''}, {order.shippingAddress?.postalCode || ''}, {order.shippingAddress?.country || 'India'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700 w-20">State:</span>
                      <span className="text-xs text-gray-900 flex-1 text-right">{order.shippingAddress?.state || 'Delhi'} (07)</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Invoice Details */}
                <div className="bg-white border border-gray-300 p-2">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-400 pb-1 text-center">
                    INVOICE DETAILS
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700 w-24">Inv. No.:</span>
                      <span className="text-xs text-gray-900 font-semibold flex-1 text-right">{order._id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700 w-24">Date:</span>
                      <span className="text-xs text-gray-900 flex-1 text-right">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700 w-24">Transport:</span>
                      <span className="text-xs text-gray-900 flex-1 text-right">Road</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700 w-24">Place of Supply:</span>
                      <span className="text-xs text-gray-900 flex-1 text-right">Delhi (07)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="p-1 bg-white">
              <div className="bg-white border border-gray-300 overflow-hidden">
                <div className="bg-gray-800 p-1">
                  <h3 className="text-sm font-bold text-white">
                    PRODUCT DETAILS
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-400">
                        <th className="px-2 py-2 text-left font-bold text-gray-900 border-r border-gray-300 text-xs">S.No.</th>
                        <th className="px-2 py-2 text-left font-bold text-gray-900 border-r border-gray-300 text-xs">Product Details</th>
                        <th className="px-2 py-2 text-left font-bold text-gray-900 border-r border-gray-300 text-xs">HSN</th>
                        <th className="px-2 py-2 text-center font-bold text-gray-900 border-r border-gray-300 text-xs">Qty</th>
                        <th className="px-2 py-2 text-right font-bold text-gray-900 border-r border-gray-300 text-xs">Rate</th>
                        <th className="px-2 py-2 text-right font-bold text-white bg-gray-800 text-xs">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems?.map((item, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}>
                          <td className="px-2 py-2 border-r border-gray-300 font-semibold text-gray-900 text-center text-xs">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 border-r border-gray-300">
                            <div className="flex items-center space-x-2">
                              <img 
                                src={item.image || 'https://via.placeholder.com/60x60?text=No+Image'} 
                                alt={item.name}
                                className="w-12 h-12 object-cover border border-gray-300"
                              />
                              <div>
                                <p className="font-semibold text-gray-900 text-xs">{item.name}</p>
                                <p className="text-xs text-gray-600">Bakery Items</p>
                                {item.selectedWeight && (
                                  <p className="text-xs text-gray-500">Weight: {item.selectedWeight.weight} Kg</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-1 py-0.5 border-r border-gray-300 text-center font-semibold text-gray-900 text-xs">
                            3604
                          </td>
                          <td className="px-1 py-0.5 border-r border-gray-300 text-center font-semibold text-gray-900 text-xs">
                            {item.quantity}
                          </td>
                          <td className="px-1 py-0.5 border-r border-gray-300 text-right font-semibold text-gray-900 text-xs">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-2 py-2 text-right font-bold text-gray-900 bg-gray-100 text-xs">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Financial Summary Rows */}
                      <tr className="bg-gray-50 border-t-2 border-gray-400">
                        <td className="px-1 py-0.5 border-r border-gray-300 font-bold text-gray-900 text-xs" colSpan="5">TOTAL</td>
                        <td className="px-1 py-0.5 text-right font-bold text-gray-900 bg-gray-100 text-xs">{formatCurrency(order.itemsPrice || 0)}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-1 py-0.5 border-r border-gray-300 text-gray-700 text-xs" colSpan="5">Commission</td>
                        <td className="px-1 py-0.5 text-right font-semibold text-gray-900 text-xs">₹0.00</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-1 py-0.5 border-r border-gray-300 text-gray-700 text-xs" colSpan="5">Discount</td>
                        <td className="px-1 py-0.5 text-right font-semibold text-gray-900 text-xs">{formatCurrency(order.discountPrice || 0)}</td>
                      </tr>
                      <tr className="bg-white border-b border-gray-300">
                        <td className="px-1 py-0.5 border-r border-gray-300 font-semibold text-gray-900 text-xs" colSpan="5">Taxable Value</td>
                        <td className="px-1 py-0.5 text-right font-semibold text-gray-900 text-xs">{formatCurrency((order.itemsPrice || 0) - (order.discountPrice || 0))}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-1 py-0.5 border-r border-gray-300 text-gray-700 text-xs" colSpan="5">CGST @ 9%</td>
                        <td className="px-1 py-0.5 text-right font-semibold text-gray-900 text-xs">{formatCurrency(order.taxPrice ? order.taxPrice / 2 : 0)}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-1 py-0.5 border-r border-gray-300 text-gray-700 text-xs" colSpan="5">SGST @ 9%</td>
                        <td className="px-1 py-0.5 text-right font-semibold text-gray-900 text-xs">{formatCurrency(order.taxPrice ? order.taxPrice / 2 : 0)}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-1 py-0.5 border-r border-gray-300 text-gray-700 text-xs" colSpan="5">IGST @ 18%</td>
                        <td className="px-1 py-0.5 text-right font-semibold text-gray-900 text-xs">₹0.00</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-1 py-0.5 border-r border-gray-300 text-gray-700 text-xs" colSpan="5">Freight</td>
                        <td className="px-1 py-0.5 text-right font-semibold text-gray-900 text-xs">{formatCurrency(order.shippingPrice || 0)}</td>
                      </tr>
                      <tr className="bg-gray-800 text-white border-t-2 border-gray-800">
                        <td className="px-2 py-2 border-r border-gray-300 font-bold text-white text-sm" colSpan="5">GRAND TOTAL</td>
                        <td className="px-2 py-2 text-right font-bold text-white text-lg">{formatCurrency(order.totalPrice || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>



            {/* Amount in Words */}
            <div className="p-1 bg-white">
              <div className="bg-white border border-gray-300 p-1">
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-gray-900 text-sm">
                    Rupees in words:
                  </span>
                  <span className="text-gray-900 italic text-sm font-semibold border border-gray-300 px-1 py-0.5 bg-gray-50">
                    {numberToWords(Math.floor(order.totalPrice || 0))} Rupees Only
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="p-1 bg-white">
              <div className="bg-white border border-gray-300 overflow-hidden">
                <div className="bg-gray-800 p-1">
                  <h4 className="font-bold text-white text-sm">
                    TERMS & CONDITIONS
                  </h4>
                </div>
                <div className="p-1">
                  <ol className="text-gray-900 space-y-1">
                    <li className="flex items-start space-x-2">
                      <span className="bg-gray-800 text-white w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span className="text-gray-900 text-xs">Bakery items are made fresh daily and should be consumed within the recommended timeframe.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-gray-800 text-white w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span className="text-gray-900 text-xs">Store in a cool, dry place and consume before the expiry date.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-gray-800 text-white w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span className="text-gray-900 text-xs">All disputes subject to Tamil Nadu Jurisdiction.</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default BillOfSupply;

