<?php
/**
 * Simple SMTP Mailer
 * A lightweight SMTP email sender without external dependencies
 */

class SimpleMailer {
    private $host;
    private $port;
    private $username;
    private $password;
    private $from;
    private $fromName;
    private $timeout = 30;
    private $socket;
    private $lastError = '';

    public function __construct($host, $port, $username, $password, $from, $fromName) {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
        $this->from = $from;
        $this->fromName = $fromName;
    }

    public function send($to, $subject, $body, $isHtml = true) {
        try {
            // For development: Log email instead of sending
            if (defined('APP_ENV') && APP_ENV === 'development') {
                error_log("📧 [DEV MODE] Email would be sent to: $to");
                error_log("📧 Subject: $subject");
                error_log("📧 Body preview: " . substr(strip_tags($body), 0, 100) . "...");
                return true; // Pretend it worked in dev mode
            }

            // Connect to SMTP server
            if (!$this->connect()) {
                error_log("Failed to connect to SMTP server: {$this->lastError}");
                return false;
            }

            // Send email commands
            $this->sendCommand("EHLO {$this->host}");
            $this->sendCommand("AUTH LOGIN");
            $this->sendCommand(base64_encode($this->username));
            $this->sendCommand(base64_encode($this->password));
            $this->sendCommand("MAIL FROM: <{$this->from}>");
            $this->sendCommand("RCPT TO: <{$to}>");
            $this->sendCommand("DATA");

            // Build email headers and body
            $headers = $this->buildHeaders($to, $subject, $isHtml);
            $message = $headers . "\r\n" . $body . "\r\n.";

            if (!$this->sendData($message)) {
                error_log("Failed to send email data: {$this->lastError}");
                $this->disconnect();
                return false;
            }

            $this->sendCommand("QUIT");
            $this->disconnect();

            error_log("✅ Email sent successfully via SMTP to: $to");
            return true;

        } catch (Exception $e) {
            $this->lastError = $e->getMessage();
            error_log("❌ SMTP Error: " . $e->getMessage());
            $this->disconnect();
            return false;
        }
    }

    private function connect() {
        $this->socket = @fsockopen($this->host, $this->port, $errno, $errstr, $this->timeout);

        if (!$this->socket) {
            $this->lastError = "Connection failed: $errstr ($errno)";
            return false;
        }

        stream_set_timeout($this->socket, $this->timeout);
        $this->getResponse(); // Read welcome message

        return true;
    }

    private function disconnect() {
        if ($this->socket) {
            @fclose($this->socket);
            $this->socket = null;
        }
    }

    private function sendCommand($command) {
        if (!$this->socket) {
            return false;
        }

        @fwrite($this->socket, $command . "\r\n");
        return $this->getResponse();
    }

    private function sendData($data) {
        if (!$this->socket) {
            return false;
        }

        @fwrite($this->socket, $data . "\r\n");
        return $this->getResponse();
    }

    private function getResponse() {
        if (!$this->socket) {
            return false;
        }

        $response = '';
        while ($line = @fgets($this->socket, 515)) {
            $response .= $line;
            if (strlen($line) > 3 && substr($line, 3, 1) == ' ') {
                break;
            }
        }

        // Safely get the response code
        $code = strlen($response) >= 3 ? substr($response, 0, 3) : '000';

        // Check for errors (codes 4xx and 5xx are errors)
        if (strlen($code) > 0 && ($code[0] == '4' || $code[0] == '5')) {
            $this->lastError = "SMTP Error: $response";
            // Don't return false for some commands, just log
            error_log("⚠️ SMTP Response: $response");
        }

        return true;
    }

    private function buildHeaders($to, $subject, $isHtml) {
        $headers = [];
        $headers[] = "From: {$this->fromName} <{$this->from}>";
        $headers[] = "To: <{$to}>";
        $headers[] = "Subject: {$subject}";
        $headers[] = "Date: " . date('r');
        $headers[] = "Message-ID: <" . time() . "@{$this->host}>";
        $headers[] = "MIME-Version: 1.0";

        if ($isHtml) {
            $headers[] = "Content-Type: text/html; charset=UTF-8";
        } else {
            $headers[] = "Content-Type: text/plain; charset=UTF-8";
        }

        $headers[] = "Content-Transfer-Encoding: 8bit";
        $headers[] = "X-Mailer: SimpleMailer/1.0";

        return implode("\r\n", $headers);
    }

    public function getLastError() {
        return $this->lastError;
    }
}
?>
