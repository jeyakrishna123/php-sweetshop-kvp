// Email Configuration for FireworksHub
// This file sets up email configuration for order confirmations

// Set email environment variables for Hostinger
process.env.SMTP_HOST = 'smtp.hostinger.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_EMAIL = 'info@upgradenow.in';
process.env.SMTP_PASSWORD = 'Ravi@0056';
process.env.FROM_NAME = 'FireworksHub';
process.env.FROM_EMAIL = 'info@upgradenow.in';

console.log('📧 Email configuration loaded');
console.log('✅ Email configured with Hostinger: info@upgradenow.in');
console.log('🎆 Order confirmation emails are now enabled!');

export default {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_EMAIL: process.env.SMTP_EMAIL,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  FROM_NAME: process.env.FROM_NAME,
  FROM_EMAIL: process.env.FROM_EMAIL
};
