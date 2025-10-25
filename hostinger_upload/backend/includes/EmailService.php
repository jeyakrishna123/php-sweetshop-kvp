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
    
    public function __construct() {
        // Load configuration
        $this->smtpHost = defined('SMTP_HOST') ? SMTP_HOST : 'smtp.gmail.com';
        $this->smtpPort = defined('SMTP_PORT') ? SMTP_PORT : 587;
        $this->smtpUsername = defined('SMTP_USERNAME') ? SMTP_USERNAME : '';
        $this->smtpPassword = defined('SMTP_PASSWORD') ? SMTP_PASSWORD : '';
        $this->fromEmail = defined('FROM_EMAIL') ? FROM_EMAIL : 'noreply@skbakers.com';
        $this->fromName = defined('FROM_NAME') ? FROM_NAME : 'SK Bakers';
    }
    
    /**
     * Send email using PHPMailer
     */
    public function sendEmail($to, $subject, $message, $isHtml = true) {
        try {
            // Check if PHPMailer is available
            if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                // Fallback to basic mail() function
                return $this->sendBasicEmail($to, $subject, $message, $isHtml);
            }
            
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            
            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtpUsername;
            $mail->Password = $this->smtpPassword;
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $this->smtpPort;
            $mail->SMTPDebug = 0; // Set to 2 for debugging
            $mail->Timeout = 30;
            
            // Recipients
            $mail->setFrom($this->fromEmail, $this->fromName);
            $mail->addAddress($to);
            
            // Content
            $mail->isHTML($isHtml);
            $mail->Subject = $subject;
            $mail->Body = $message;
            
            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            
            // In development, simulate success if SMTP fails
            if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
                error_log("Development environment - simulating email success");
                return true;
            }
            
            return false;
        }
    }
    
    /**
     * Fallback to basic mail() function
     */
    private function sendBasicEmail($to, $subject, $message, $isHtml = true) {
        $headers = "From: {$this->fromName} <{$this->fromEmail}>\r\n";
        $headers .= "Reply-To: {$this->fromEmail}\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        
        if ($isHtml) {
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        } else {
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        }
        
        return @mail($to, $subject, $message, $headers);
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
