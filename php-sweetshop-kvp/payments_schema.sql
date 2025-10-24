-- Payments Database Schema
-- Real Google Pay, PhonePe, Paytm Integration

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    payment_method ENUM('googlepay', 'phonepe', 'paytm', 'upi', 'cod') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    customer_info JSON,
    shipping_address JSON,
    upi_string TEXT,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    gateway_response JSON,
    verification_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_method (payment_method),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Payment Methods Configuration
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL,
    method_code VARCHAR(20) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_secure BOOLEAN DEFAULT TRUE,
    security_features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default payment methods
INSERT INTO payment_methods (method_name, method_code, display_name, description, icon, is_active, is_secure, security_features) VALUES
('Google Pay', 'googlepay', 'Google Pay', 'Pay securely with Google Pay', '💳', TRUE, TRUE, '["Bank-level encryption", "Tokenization", "PCI DSS compliant"]'),
('PhonePe', 'phonepe', 'PhonePe', 'Pay with PhonePe wallet', '📱', TRUE, TRUE, '["PCI DSS compliant", "RBI approved", "Secure tokenization"]'),
('Paytm', 'paytm', 'Paytm', 'Pay with Paytm wallet', '💰', TRUE, TRUE, '["RBI approved", "Secure encryption", "Tokenization"]'),
('UPI Payment', 'upi', 'UPI Payment', 'Pay with any UPI app', '🏦', TRUE, TRUE, '["NPCI certified", "Bank-grade security", "Real-time verification"]'),
('Cash on Delivery', 'cod', 'Cash on Delivery', 'Pay when delivered', '💵', TRUE, FALSE, '["No online payment", "Pay on delivery"]');

-- Payment Transactions Log
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    transaction_type ENUM('initiation', 'verification', 'refund', 'cancellation') NOT NULL,
    gateway_response JSON,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_id (payment_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at)
);

-- Payment Security Log
CREATE TABLE IF NOT EXISTS payment_security_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT,
    security_event VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_data JSON,
    response_data JSON,
    risk_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_payment_id (payment_id),
    INDEX idx_security_event (security_event),
    INDEX idx_created_at (created_at)
);

-- Payment Refunds
CREATE TABLE IF NOT EXISTS payment_refunds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    refund_id VARCHAR(100) NOT NULL UNIQUE,
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_reason TEXT,
    refund_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_id (payment_id),
    INDEX idx_refund_id (refund_id),
    INDEX idx_refund_status (refund_status)
);

-- Payment Analytics
CREATE TABLE IF NOT EXISTS payment_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    total_transactions INT DEFAULT 0,
    successful_transactions INT DEFAULT 0,
    failed_transactions INT DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    successful_amount DECIMAL(12,2) DEFAULT 0.00,
    average_transaction_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date_method (date, payment_method),
    INDEX idx_date (date),
    INDEX idx_payment_method (payment_method)
);

-- Create indexes for better performance
CREATE INDEX idx_payments_status_created ON payments(status, created_at);
CREATE INDEX idx_payments_method_status ON payments(payment_method, status);
CREATE INDEX idx_payments_amount ON payments(amount);

-- Create views for analytics
CREATE VIEW payment_summary AS
SELECT 
    p.payment_method,
    COUNT(*) as total_payments,
    SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as successful_payments,
    SUM(CASE WHEN p.status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
    SUM(p.amount) as total_amount,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as successful_amount,
    AVG(p.amount) as average_amount,
    DATE(p.created_at) as payment_date
FROM payments p
GROUP BY p.payment_method, DATE(p.created_at);

-- Create stored procedure for payment verification
DELIMITER //
CREATE PROCEDURE VerifyPayment(
    IN p_order_id VARCHAR(100),
    IN p_transaction_id VARCHAR(100),
    IN p_payment_method VARCHAR(20)
)
BEGIN
    DECLARE payment_exists INT DEFAULT 0;
    DECLARE current_status VARCHAR(20);
    
    -- Check if payment exists
    SELECT COUNT(*) INTO payment_exists
    FROM payments 
    WHERE order_id = p_order_id 
    AND transaction_id = p_transaction_id 
    AND payment_method = p_payment_method;
    
    IF payment_exists > 0 THEN
        -- Get current status
        SELECT status INTO current_status
        FROM payments 
        WHERE order_id = p_order_id 
        AND transaction_id = p_transaction_id;
        
        -- Update status to completed if pending
        IF current_status = 'pending' THEN
            UPDATE payments 
            SET status = 'completed', verified_at = NOW()
            WHERE order_id = p_order_id 
            AND transaction_id = p_transaction_id;
            
            SELECT 'Payment verified successfully' as message;
        ELSE
            SELECT CONCAT('Payment already ', current_status) as message;
        END IF;
    ELSE
        SELECT 'Payment not found' as message;
    END IF;
END //
DELIMITER ;

-- Create trigger for payment analytics
DELIMITER //
CREATE TRIGGER update_payment_analytics
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO payment_analytics (
            date, payment_method, total_transactions, 
            successful_transactions, failed_transactions,
            total_amount, successful_amount
        ) VALUES (
            DATE(NEW.created_at), NEW.payment_method, 1,
            CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
            CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
            NEW.amount,
            CASE WHEN NEW.status = 'completed' THEN NEW.amount ELSE 0 END
        ) ON DUPLICATE KEY UPDATE
            total_transactions = total_transactions + 1,
            successful_transactions = successful_transactions + 
                CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
            failed_transactions = failed_transactions + 
                CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
            total_amount = total_amount + NEW.amount,
            successful_amount = successful_amount + 
                CASE WHEN NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
            average_transaction_amount = total_amount / total_transactions;
    END IF;
END //
DELIMITER ;
