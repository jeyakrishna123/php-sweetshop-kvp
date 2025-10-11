// Email configuration helper
export const getEmailConfig = () => {
  // Default email configuration for development
  const defaultConfig = {
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: 587,
    SMTP_EMAIL: 'upgradenowtechnologies@gmail.com',
    SMTP_PASSWORD: 'your-gmail-app-password-here',
    FROM_NAME: 'FireworksHub',
    FROM_EMAIL: 'noreply@fireworkshub.com'
  };

  // Check if environment variables are set (try multiple possible names)
  const config = {
    SMTP_HOST: process.env.SMTP_HOST || process.env.EMAIL_HOST || defaultConfig.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT || process.env.EMAIL_PORT || defaultConfig.SMTP_PORT,
    SMTP_EMAIL: process.env.SMTP_EMAIL || process.env.EMAIL_USER || defaultConfig.SMTP_EMAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || defaultConfig.SMTP_PASSWORD,
    FROM_NAME: process.env.FROM_NAME || process.env.EMAIL_FROM_NAME || defaultConfig.FROM_NAME,
    FROM_EMAIL: process.env.FROM_EMAIL || process.env.EMAIL_FROM || defaultConfig.FROM_EMAIL
  };

  return config;
};

// Check if email is properly configured
export const isEmailConfigured = () => {
  const config = getEmailConfig();
  return config.SMTP_EMAIL !== 'your-email@gmail.com' && 
         config.SMTP_PASSWORD !== 'your-app-password' &&
         config.SMTP_PASSWORD !== 'REPLACE_WITH_REAL_APP_PASSWORD' &&
         config.SMTP_PASSWORD !== 'your-gmail-app-password-here' &&
         config.SMTP_EMAIL && config.SMTP_PASSWORD;
};

// Get email setup instructions
export const getEmailSetupInstructions = () => {
  return `
📧 Email Configuration Required

To enable order confirmation emails, please configure your email settings:

1. Create a .env file in the backend directory if it doesn't exist
2. Add the following email configuration:

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_NAME=FireworksHub
FROM_EMAIL=noreply@fireworkshub.com

For Gmail:
- Enable 2-factor authentication
- Generate an App Password
- Use the App Password as SMTP_PASSWORD

For other providers, check their SMTP settings.

The application will work without email configuration, but users won't receive order confirmations.
  `;
};
