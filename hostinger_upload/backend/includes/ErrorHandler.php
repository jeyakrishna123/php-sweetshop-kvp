<?php
/**
 * Global Error Handler for Production
 * Handles all errors, exceptions, and fatal errors
 */

class ErrorHandler {
    private static $logFile;
    
    public static function init() {
        self::$logFile = __DIR__ . '/../logs/php-error.log';
        
        // Set custom error handler
        set_error_handler([self::class, 'handleError']);
        
        // Set exception handler
        set_exception_handler([self::class, 'handleException']);
        
        // Set shutdown function for fatal errors
        register_shutdown_function([self::class, 'handleShutdown']);
    }
    
    /**
     * Handle PHP errors
     */
    public static function handleError($errno, $errstr, $errfile, $errline) {
        // Don't handle errors suppressed with @
        if (!(error_reporting() & $errno)) {
            return false;
        }
        
        $errorType = self::getErrorType($errno);
        
        // Log the error
        $message = sprintf(
            "[%s] %s: %s in %s on line %d",
            date('Y-m-d H:i:s'),
            $errorType,
            $errstr,
            $errfile,
            $errline
        );
        
        error_log($message, 3, self::$logFile);
        
        // In production, don't display errors to users
        // Only return false to let PHP handle it normally (which won't display due to display_errors=0)
        return false;
    }
    
    /**
     * Handle uncaught exceptions
     */
    public static function handleException($exception) {
        $message = sprintf(
            "[%s] Uncaught Exception: %s in %s on line %d\nStack trace:\n%s",
            date('Y-m-d H:i:s'),
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine(),
            $exception->getTraceAsString()
        );
        
        error_log($message, 3, self::$logFile);
        
        // Send JSON error response for API calls
        if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'An internal error occurred',
                'timestamp' => date('c')
            ]);
            exit;
        }
        
        // For non-API calls, return 500 error page would be ideal
        // But for now, just let it fail gracefully
        http_response_code(500);
        exit('An error occurred. Please try again later.');
    }
    
    /**
     * Handle fatal errors
     */
    public static function handleShutdown() {
        $error = error_get_last();
        
        if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
            $message = sprintf(
                "[%s] Fatal Error: %s in %s on line %d",
                date('Y-m-d H:i:s'),
                $error['message'],
                $error['file'],
                $error['line']
            );
            
            error_log($message, 3, self::$logFile);
            
            // Send JSON error response for API calls
            if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
                header('Content-Type: application/json');
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'A fatal error occurred',
                    'timestamp' => date('c')
                ]);
            }
        }
    }
    
    /**
     * Get human-readable error type
     */
    private static function getErrorType($errno) {
        $errorTypes = [
            E_ERROR => 'ERROR',
            E_WARNING => 'WARNING',
            E_PARSE => 'PARSE',
            E_NOTICE => 'NOTICE',
            E_CORE_ERROR => 'CORE_ERROR',
            E_CORE_WARNING => 'CORE_WARNING',
            E_COMPILE_ERROR => 'COMPILE_ERROR',
            E_COMPILE_WARNING => 'COMPILE_WARNING',
            E_USER_ERROR => 'USER_ERROR',
            E_USER_WARNING => 'USER_WARNING',
            E_USER_NOTICE => 'USER_NOTICE',
            E_STRICT => 'STRICT',
            E_RECOVERABLE_ERROR => 'RECOVERABLE_ERROR',
            E_DEPRECATED => 'DEPRECATED',
            E_USER_DEPRECATED => 'USER_DEPRECATED'
        ];
        
        return $errorTypes[$errno] ?? 'UNKNOWN';
    }
}

