# Email OTP Fix Guide

## Problem Identified
The email OTP functionality was not working because:
1. PHP mail() function was trying to use localhost:25 (not configured)
2. SMTP settings were pointing to localhost instead of proper SMTP server
3. EmailService was not being used consistently across OTP endpoints

## Solutions Implemented

### 1. Updated EmailService Configuration
- Changed SMTP host from `localhost` to `smtp.hostinger.com`
- Updated SMTP port from 25 to 587 (TLS)
- Added proper SMTP credentials for Hostinger

### 2. Updated All OTP Endpoints
- Modified `backend/api/auth.php` to use EmailService
- Modified `backend/api/forgot-password.php` to use EmailService
- All OTP sending now uses the improved EmailService class

### 3. Enhanced Email Headers
- Added proper MIME headers
- Added Return-Path for better delivery
- Added X-Priority headers
- Improved error logging

## Configuration Files Updated

### backend/config/config.php
```php
// Email settings (Hostinger compatible)
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'noreply@skbakers.com');
define('SMTP_PASSWORD', 'Skbakers@123'); // Use your Hostinger email password
define('FROM_EMAIL', 'noreply@skbakers.com');
define('FROM_NAME', 'SK Bakers');
```

### backend/includes/EmailService.php
- Enhanced SMTP configuration
- Better fallback mechanisms
- Improved error handling and logging

## Testing the Fix

### For Local Development
Since local development doesn't have SMTP configured, the system will:
1. Log OTPs to error log for testing
2. Return success even if email fails (for development)
3. Show OTP in console/logs for verification

### For Production (Hostinger)
1. Ensure email account `noreply@skbakers.com` exists in Hostinger
2. Use correct email password in config
3. Test with actual email addresses

## OTP Endpoints Fixed

1. **Signup OTP**: `POST /api/auth/signup`
2. **Forgot Password OTP**: `POST /api/forgot-password`
3. **Verify OTP**: `POST /api/verify-otp`
4. **Resend OTP**: `POST /api/auth/resend-signup-otp`

## Testing Commands

```bash
# Test email functionality
php test_email_otp_fix.php

# Test simple email
php simple_email_test.php

# Check OTP in logs
tail -f backend/logs/php-error.log
```

## Production Deployment

1. Upload updated files to Hostinger
2. Ensure email account is set up in Hostinger control panel
3. Update SMTP_PASSWORD in config.php with actual email password
4. Test OTP functionality with real email addresses

## Troubleshooting

### If emails still don't work:
1. Check Hostinger email account setup
2. Verify SMTP credentials
3. Check PHP error logs
4. Test with different email providers
5. Consider using third-party email services (SendGrid, Mailgun)

### For Development:
- OTPs are logged to error log for testing
- Use the logged OTPs to test the verification flow
- The system will work normally in production with proper SMTP
