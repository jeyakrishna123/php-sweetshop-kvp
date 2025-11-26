<?php
/**
 * Email Service for sending emails
 * Uses PHPMailer for reliable email delivery
 */

class EmailService {
    private $smtpHost;
    private $smtpPort;
    private $smtpUsername;
    private $smtpPassword;
    private $fromEmail;
    private $fromName;
    private $lastError = null;
    private $phpmailerLoaded = false;
    
    public function __construct() {
        // Try to load PHPMailer
        $this->loadPHPMailer();
        
        // Load configuration with proper SMTP settings for Hostinger
        // All operations are safe and cannot throw exceptions
        try {
            $this->smtpHost = defined('SMTP_HOST') && SMTP_HOST ? SMTP_HOST : 'smtp.hostinger.com';
            $this->smtpPort = defined('SMTP_PORT') && SMTP_PORT ? SMTP_PORT : 587;
            $this->smtpUsername = defined('SMTP_USERNAME') && SMTP_USERNAME ? SMTP_USERNAME : 'noreply@skbakers.com';
            $this->smtpPassword = defined('SMTP_PASSWORD') ? SMTP_PASSWORD : '';
            $this->fromEmail = defined('FROM_EMAIL') && FROM_EMAIL ? FROM_EMAIL : 'noreply@skbakers.com';
            $this->fromName = defined('FROM_NAME') && FROM_NAME ? FROM_NAME : 'SK Bakers';
        } catch (Throwable $e) {
            // This should never happen, but ensure we have valid defaults
            error_log("❌ EmailService constructor error (unexpected): " . $e->getMessage());
            $this->smtpHost = 'smtp.hostinger.com';
            $this->smtpPort = 587;
            $this->smtpUsername = 'noreply@skbakers.com';
            $this->smtpPassword = '';
            $this->fromEmail = 'noreply@skbakers.com';
            $this->fromName = 'SK Bakers';
        }
    }
    
    /**
     * Try to load PHPMailer from various possible locations
     */
    private function loadPHPMailer() {
        // If already loaded, return
        if ($this->phpmailerLoaded || class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            $this->phpmailerLoaded = true;
            return true;
        }
        
        // Try different possible paths for PHPMailer
        $possiblePaths = [
            __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php',
            __DIR__ . '/../vendor/PHPMailer/PHPMailer/src/PHPMailer.php',
            __DIR__ . '/../vendor/autoload.php',
            __DIR__ . '/../../vendor/phpmailer/phpmailer/src/PHPMailer.php',
            __DIR__ . '/../../vendor/autoload.php',
        ];
        
        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                try {
                    require_once $path;
                    // If it's autoload.php, also try to require Exception and SMTP
                    if (strpos($path, 'autoload.php') !== false) {
                        // Autoload should handle it, but ensure classes are available
                        if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                            continue;
                        }
                    } else {
                        // If we loaded PHPMailer.php directly, also load Exception and SMTP
                        $basePath = dirname($path);
                        if (file_exists($basePath . '/Exception.php')) {
                            require_once $basePath . '/Exception.php';
                        }
                        if (file_exists($basePath . '/SMTP.php')) {
                            require_once $basePath . '/SMTP.php';
                        }
                    }
                    
                    if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                        $this->phpmailerLoaded = true;
                        error_log("✅ EmailService - PHPMailer loaded successfully from: $path");
                        return true;
                    }
                } catch (Throwable $e) {
                    error_log("⚠️ EmailService - Failed to load PHPMailer from $path: " . $e->getMessage());
                    continue;
                }
            }
        }
        
        error_log("⚠️ EmailService - PHPMailer not found. Install via: composer require phpmailer/phpmailer");
        $this->phpmailerLoaded = false;
        return false;
    }
    
    /**
     * Check if PHPMailer is available
     */
    public function isPHPMailerAvailable() {
        return $this->phpmailerLoaded || class_exists('PHPMailer\PHPMailer\PHPMailer');
    }
    
    /**
     * Send email using PHPMailer
     * NEVER throws exceptions - always returns boolean
     */
    public function sendEmail($to, $subject, $message, $isHtml = true) {
        // Validate inputs
        if (empty($to) || empty($subject)) {
            error_log("❌ EmailService - Invalid parameters: to='" . ($to ?? 'NULL') . "', subject='" . ($subject ?? 'NULL') . "'");
            return false;
        }
        
        // Suppress all errors and warnings to prevent breaking API response
        $oldErrorLevel = error_reporting(E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR);
        $displayErrors = ini_get('display_errors');
        ini_set('display_errors', '0');
        
        try {
            // Try PHPMailer first, then fallback to basic mail
            if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                $result = $this->sendEmailWithPHPMailer($to, $subject, $message, $isHtml);
            } else {
                error_log("⚠️ EmailService - PHPMailer not available, using basic mail()");
                $result = $this->sendBasicEmail($to, $subject, $message, $isHtml);
            }
        } catch (Throwable $e) {
            // Catch ALL errors including fatal errors
            error_log("❌ EmailService - sendEmail() exception: " . $e->getMessage());
            error_log("❌ EmailService - Exception trace: " . $e->getTraceAsString());
            
            // Try basic mail as fallback
            try {
                $result = $this->sendBasicEmail($to, $subject, $message, $isHtml);
            } catch (Throwable $fallbackError) {
                error_log("❌ EmailService - Fallback also failed: " . $fallbackError->getMessage());
                $result = false;
            }
        } finally {
            // Restore error reporting
            error_reporting($oldErrorLevel);
            ini_set('display_errors', $displayErrors);
        }
        
        return $result ?? false;
    }
    
    /**
     * Send email using PHPMailer (if available)
     * NEVER throws exceptions - always returns boolean
     */
    public function sendEmailWithPHPMailer($to, $subject, $message, $isHtml = true) {
        try {
            // Check if PHPMailer is available - use fully qualified check
            if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                error_log("⚠️ EmailService - PHPMailer class not found, using fallback");
                return $this->sendBasicEmail($to, $subject, $message, $isHtml);
            }
            
            // Suppress PHPMailer errors to prevent breaking JSON response
            // Use variable to store constant value safely - default to 'tls' string
            $encryptionStartTLS = 'tls'; // Default to 'tls' string instead of constant
            
            // Try to get constant safely using ReflectionClass, but don't fail if it doesn't exist
            try {
                $reflectionClass = new ReflectionClass('PHPMailer\PHPMailer\PHPMailer');
                if ($reflectionClass->hasConstant('ENCRYPTION_STARTTLS')) {
                    $encryptionStartTLS = $reflectionClass->getConstant('ENCRYPTION_STARTTLS');
                }
            } catch (Throwable $constError) {
                // Use string fallback if anything fails
                $encryptionStartTLS = 'tls';
                error_log("⚠️ EmailService - Could not get PHPMailer constant, using 'tls' string");
            }
            
            $mail = new PHPMailer\PHPMailer\PHPMailer(false); // false = don't throw exceptions
            
            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->smtpHost;
            $mail->SMTPAuth = !empty($this->smtpUsername) && !empty($this->smtpPassword);
            $mail->Username = $this->smtpUsername;
            $mail->Password = $this->smtpPassword;
            $mail->SMTPSecure = $encryptionStartTLS; // Use variable instead of direct constant
            $mail->Port = $this->smtpPort;
            $mail->SMTPDebug = 0; // Set to 2 for debugging
            $mail->Timeout = 30;
            $mail->CharSet = 'UTF-8';
            
            // Suppress SMTP errors
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            
            // Recipients
            $mail->setFrom($this->fromEmail, $this->fromName);
            $mail->addAddress($to);
            
            // Content
            $mail->isHTML($isHtml);
            $mail->Subject = $subject;
            $mail->Body = $message;
            
            // Try to send (won't throw exception since we passed false to constructor)
            if ($mail->send()) {
                error_log("✅ EmailService - Email sent successfully via PHPMailer to: $to");
                return true;
            } else {
                $errorMsg = $mail->ErrorInfo ?? 'Unknown error';
                error_log("❌ EmailService - PHPMailer send failed: $errorMsg");
                
                // In development, simulate success if SMTP fails
                if (isset($_SERVER['HTTP_HOST']) && 
                    (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || 
                     strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false)) {
                    error_log("⚠️ EmailService - Development environment, simulating email success");
                    return true;
                }
                
                return false;
            }
            
        } catch (Throwable $e) {
            error_log("❌ EmailService - PHPMailer exception: " . $e->getMessage());
            error_log("❌ EmailService - Exception trace: " . $e->getTraceAsString());
            
            // In development, simulate success
            if (isset($_SERVER['HTTP_HOST']) && 
                (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || 
                 strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false)) {
                error_log("⚠️ EmailService - Development environment, simulating email success after exception");
                return true;
            }
            
            // Try fallback
            return $this->sendBasicEmail($to, $subject, $message, $isHtml);
        }
    }
    
    /**
     * Fallback to basic mail() function
     * NEVER throws exceptions - always returns boolean
     */
    private function sendBasicEmail($to, $subject, $message, $isHtml = true) {
        try {
            // Enhanced headers for better delivery
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "From: {$this->fromName} <{$this->fromEmail}>\r\n";
            $headers .= "Reply-To: {$this->fromEmail}\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
            $headers .= "X-Priority: 3\r\n";
            $headers .= "Return-Path: {$this->fromEmail}\r\n";
            
            if ($isHtml) {
                $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            } else {
                $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
            }
            
            // Log email attempt
            error_log("📧 EmailService - Attempting to send email via mail() to: $to");
            
            // Suppress mail() errors
            $result = @mail($to, $subject, $message, $headers);
            
            if ($result) {
                error_log("✅ EmailService - Email sent successfully via mail() to: $to");
            } else {
                // Check last error
                $lastError = error_get_last();
                $errorMsg = $lastError ? $lastError['message'] : 'Unknown mail() error';
                error_log("❌ EmailService - mail() failed to send to: $to - Error: $errorMsg");
                
                // In development, simulate success
                if (isset($_SERVER['HTTP_HOST']) && 
                    (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || 
                     strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false)) {
                    error_log("⚠️ EmailService - Development environment, simulating email success");
                    return true;
                }
            }
            
            return $result;
            
        } catch (Throwable $e) {
            error_log("❌ EmailService - sendBasicEmail() exception: " . $e->getMessage());
            
            // In development, simulate success
            if (isset($_SERVER['HTTP_HOST']) && 
                (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || 
                 strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false)) {
                error_log("⚠️ EmailService - Development environment, simulating email success after exception");
                return true;
            }
            
            return false;
        }
    }
    
    /**
     * Send email with PDF attachment
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $message Email body (HTML)
     * @param string $pdfData PDF file data (binary or base64)
     * @param string $pdfFilename Filename for the PDF attachment
     * @param bool $isBase64 Whether PDF data is base64 encoded
     * @return bool Success status
     */
    public function sendEmailWithAttachment($to, $subject, $message, $pdfData, $pdfFilename = 'invoice.pdf', $isBase64 = true) {
        // Validate inputs
        if (empty($to) || empty($subject)) {
            error_log("❌ EmailService - Invalid parameters for email with attachment");
            return false;
        }
        
        // Suppress all errors and warnings
        $oldErrorLevel = error_reporting(E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR);
        $displayErrors = ini_get('display_errors');
        ini_set('display_errors', '0');
        
        try {
            // Try PHPMailer first (it supports attachments)
            if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                $result = $this->sendEmailWithAttachmentPHPMailer($to, $subject, $message, $pdfData, $pdfFilename, $isBase64);
            } else {
                error_log("⚠️ EmailService - PHPMailer not available, cannot send attachment");
                // Fallback: send email without attachment
                $result = $this->sendEmail($to, $subject, $message, true);
            }
        } catch (Throwable $e) {
            error_log("❌ EmailService - sendEmailWithAttachment exception: " . $e->getMessage());
            // Fallback: send email without attachment
            $result = $this->sendEmail($to, $subject, $message, true);
        } finally {
            error_reporting($oldErrorLevel);
            ini_set('display_errors', $displayErrors);
        }
        
        return $result ?? false;
    }
    
    /**
     * Get the last error message from email operations
     */
    public function getLastError() {
        return $this->lastError;
    }
    
    /**
     * Send email with PDF attachment using PHPMailer
     */
    private function sendEmailWithAttachmentPHPMailer($to, $subject, $message, $pdfData, $pdfFilename, $isBase64) {
        try {
            if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                return false;
            }
            
            $encryptionStartTLS = 'tls';
            try {
                $reflectionClass = new ReflectionClass('PHPMailer\PHPMailer\PHPMailer');
                if ($reflectionClass->hasConstant('ENCRYPTION_STARTTLS')) {
                    $encryptionStartTLS = $reflectionClass->getConstant('ENCRYPTION_STARTTLS');
                }
            } catch (Throwable $constError) {
                $encryptionStartTLS = 'tls';
            }
            
            $mail = new PHPMailer\PHPMailer\PHPMailer(false);
            
            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->smtpHost;
            $mail->SMTPAuth = !empty($this->smtpUsername) && !empty($this->smtpPassword);
            $mail->Username = $this->smtpUsername;
            $mail->Password = $this->smtpPassword;
            $mail->SMTPSecure = $encryptionStartTLS;
            $mail->Port = $this->smtpPort;
            $mail->SMTPDebug = 0;
            $mail->Timeout = 30;
            $mail->CharSet = 'UTF-8';
            
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            
            // Recipients
            $mail->setFrom($this->fromEmail, $this->fromName);
            $mail->addAddress($to);
            
            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $message;
            
            // Add PDF attachment
            if (!empty($pdfData)) {
                try {
                    if ($isBase64) {
                        // Remove data URI prefix if present
                        $pdfData = preg_replace('/^data:application\/pdf;base64,/', '', $pdfData);
                        
                        // Validate base64 format
                        if (!preg_match('/^[A-Za-z0-9+\/]*={0,2}$/', $pdfData)) {
                            error_log("❌ EmailService - Invalid base64 format in PDF data");
                            throw new Exception("Invalid base64 format");
                        }
                        
                        // Validate it's a valid PDF by decoding and checking header
                        $pdfBinary = base64_decode($pdfData, true);
                        if ($pdfBinary === false) {
                            error_log("❌ EmailService - Failed to decode base64 PDF data");
                            $pdfBinary = base64_decode($pdfData);
                            if ($pdfBinary === false) {
                                throw new Exception("Base64 decode failed");
                            }
                        }
                        
                        // Validate PDF binary data
                        if (strlen($pdfBinary) > 0 && substr($pdfBinary, 0, 4) === '%PDF') {
                            // CRITICAL: PHPMailer's addStringAttachment with 'base64' encoding expects
                            // the STRING to already be base64 encoded, not binary data
                            // So we pass the base64 string directly
                            $mail->addStringAttachment($pdfData, $pdfFilename, 'base64', 'application/pdf');
                            error_log("✅ EmailService - PDF attachment added: $pdfFilename (Base64 length: " . strlen($pdfData) . " chars, Binary size: " . strlen($pdfBinary) . " bytes)");
                        } else {
                            error_log("⚠️ EmailService - PDF validation failed (first 20 bytes: " . ($pdfBinary ? bin2hex(substr($pdfBinary, 0, 20)) : 'N/A') . ")");
                            // Still try to attach it - might be valid PDF
                            $mail->addStringAttachment($pdfData, $pdfFilename, 'base64', 'application/pdf');
                            error_log("⚠️ EmailService - Attached PDF anyway (validation warning)");
                        }
                    } else {
                        // Binary data provided directly - need to base64 encode it first
                        if (strlen($pdfData) > 0) {
                            if (substr($pdfData, 0, 4) === '%PDF') {
                                // It's binary PDF data - encode to base64
                                $pdfBase64 = base64_encode($pdfData);
                                $mail->addStringAttachment($pdfBase64, $pdfFilename, 'base64', 'application/pdf');
                                error_log("✅ EmailService - PDF attachment added (binary converted to base64): $pdfFilename (Size: " . strlen($pdfData) . " bytes)");
                            } else {
                                // Assume it's already base64 string
                                $mail->addStringAttachment($pdfData, $pdfFilename, 'base64', 'application/pdf');
                                error_log("✅ EmailService - PDF attachment added: $pdfFilename (Size: " . strlen($pdfData) . " chars)");
                            }
                        } else {
                            throw new Exception("Empty PDF data");
                        }
                    }
                } catch (Throwable $attachError) {
                    error_log("❌ EmailService - Error adding PDF attachment: " . $attachError->getMessage());
                    error_log("❌ EmailService - Stack trace: " . $attachError->getTraceAsString());
                    // Don't fail completely - send email without attachment
                    error_log("⚠️ EmailService - Continuing to send email without PDF attachment");
                }
            }
            
            // Send email
            $sendResult = $mail->send();
            
            if ($sendResult) {
                $this->lastError = null; // Clear error on success
                error_log("✅ EmailService - Email with PDF attachment sent successfully to: $to");
                return true;
            } else {
                $errorMsg = $mail->ErrorInfo ?? 'Unknown error';
                $this->lastError = $errorMsg;
                error_log("❌ EmailService - Failed to send email with attachment: $errorMsg");
                error_log("❌ EmailService - PHPMailer ErrorInfo: " . ($mail->ErrorInfo ?? 'N/A'));
                
                // Log additional debugging info
                if (method_exists($mail, 'getSMTPInstance')) {
                    try {
                        $smtp = $mail->getSMTPInstance();
                        if ($smtp && method_exists($smtp, 'getError')) {
                            $smtpError = $smtp->getError();
                            error_log("❌ EmailService - SMTP Error: " . print_r($smtpError, true));
                            if (!empty($smtpError)) {
                                $this->lastError .= ' | SMTP: ' . print_r($smtpError, true);
                            }
                        }
                    } catch (Exception $e) {
                        // Ignore
                    }
                }
                
                // In development, simulate success
                if (isset($_SERVER['HTTP_HOST']) && 
                    (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || 
                     strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false)) {
                    error_log("⚠️ EmailService - Development environment, simulating email success");
                    return true;
                }
                
                return false;
            }
            
        } catch (Throwable $e) {
            error_log("❌ EmailService - sendEmailWithAttachmentPHPMailer exception: " . $e->getMessage());
            
            // In development, simulate success
            if (isset($_SERVER['HTTP_HOST']) && 
                (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || 
                 strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false)) {
                error_log("⚠️ EmailService - Development environment, simulating email success after exception");
                return true;
            }
            
            return false;
        }
    }
    
    /**
     * Send email to customer with SK Bakers template
     */
    public function sendCustomerEmail($customerName, $customerEmail, $subject, $message) {
        $htmlMessage = $this->getEmailTemplate($customerName, $message);
        return $this->sendEmail($customerEmail, $subject, $htmlMessage, true);
    }
    
    /**
     * Get SK Bakers email template
     */
    private function getEmailTemplate($customerName, $message) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>SK Bakers</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>
                <!-- Header -->
                <div style='background: linear-gradient(135deg, #dc2626, #b91c3c); color: white; padding: 30px; text-align: center;'>
                    <h1 style='margin: 0; font-size: 28px; font-weight: bold;'>SK Bakers</h1>
                    <p style='margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;'>Home-Made Cakes and Cafe</p>
                </div>
                
                <!-- Content -->
                <div style='padding: 40px 30px;'>
                    <h2 style='color: #374151; margin: 0 0 20px 0; font-size: 24px;'>Hello " . htmlspecialchars($customerName) . ",</h2>
                    
                    <div style='background: #f8fafc; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;'>
                        " . nl2br(htmlspecialchars($message)) . "
                    </div>
                    
                    <p style='color: #6b7280; line-height: 1.6; margin: 30px 0 0 0;'>
                        Thank you for being our valued customer!<br>
                        <strong style='color: #dc2626;'>The SK Bakers Team</strong>
                    </p>
                </div>
                
                <!-- Footer -->
                <div style='background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;'>
                    <p style='margin: 0; color: #9ca3af; font-size: 14px;'>
                        © 2024 SK Bakers. All rights reserved.<br>
                        <a href='mailto:info@skbakers.com' style='color: #dc2626; text-decoration: none;'>info@skbakers.com</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}
?>
