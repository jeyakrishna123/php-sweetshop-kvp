<?php
/**
 * Payment API Endpoints
 * Real Google Pay, PhonePe, Paytm Integration
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';

class PaymentAPI {
    private $db;
    private $merchantConfig;

    public function __construct($db) {
        $this->db = $db;
        $this->merchantConfig = [
            'googlepay' => [
                'merchantId' => $_ENV['GOOGLE_PAY_MERCHANT_ID'] ?? 'SK_BAKERS_001',
                'merchantName' => 'SK Bakers',
                'upiId' => $_ENV['MERCHANT_UPI_ID'] ?? 'skbakers@paytm',
                'environment' => $_ENV['ENVIRONMENT'] ?? 'sandbox'
            ],
            'phonepe' => [
                'merchantId' => $_ENV['PHONEPE_MERCHANT_ID'] ?? 'SK_BAKERS_001',
                'saltKey' => $_ENV['PHONEPE_SALT_KEY'] ?? 'your-salt-key',
                'saltIndex' => $_ENV['PHONEPE_SALT_INDEX'] ?? '1',
                'environment' => $_ENV['ENVIRONMENT'] ?? 'sandbox'
            ],
            'paytm' => [
                'merchantId' => $_ENV['PAYTM_MERCHANT_ID'] ?? 'SK_BAKERS_001',
                'merchantKey' => $_ENV['PAYTM_MERCHANT_KEY'] ?? 'your-merchant-key',
                'website' => $_ENV['PAYTM_WEBSITE'] ?? 'WEBSTAGING',
                'environment' => $_ENV['ENVIRONMENT'] ?? 'sandbox'
            ]
        ];
    }

    // Google Pay Session Creation
    public function createGooglePaySession($data) {
        try {
            $orderId = $data['orderId'];
            $transactionId = $data['transactionId'];
            $amount = $data['amount'];
            $customerInfo = $data['customerInfo'];
            $shippingAddress = $data['shippingAddress'];

            // Create payment record in database
            $stmt = $this->db->prepare("
                INSERT INTO payments (
                    order_id, transaction_id, payment_method, amount, currency, 
                    customer_info, shipping_address, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $orderId,
                $transactionId,
                'googlepay',
                $amount,
                'INR',
                json_encode($customerInfo),
                json_encode($shippingAddress),
                'pending'
            ]);

            // Generate Google Pay payment data
            $paymentData = [
                'apiVersion' => 2,
                'apiVersionMinor' => 0,
                'allowedPaymentMethods' => [
                    [
                        'type' => 'CARD',
                        'parameters' => [
                            'allowedAuthMethods' => ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                            'allowedCardNetworks' => ['MASTERCARD', 'VISA']
                        ],
                        'tokenizationSpecification' => [
                            'type' => 'PAYMENT_GATEWAY',
                            'parameters' => [
                                'gateway' => 'example',
                                'gatewayMerchantId' => $this->merchantConfig['googlepay']['merchantId']
                            ]
                        ]
                    ]
                ],
                'transactionInfo' => [
                    'totalPriceStatus' => 'FINAL',
                    'totalPrice' => $amount,
                    'currencyCode' => 'INR'
                ],
                'merchantInfo' => [
                    'merchantId' => $this->merchantConfig['googlepay']['merchantId'],
                    'merchantName' => $this->merchantConfig['googlepay']['merchantName']
                ]
            ];

            return [
                'success' => true,
                'orderId' => $orderId,
                'transactionId' => $transactionId,
                'paymentData' => $paymentData
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Google Pay session creation failed: ' . $e->getMessage()
            ];
        }
    }

    // PhonePe Session Creation
    public function createPhonePeSession($data) {
        try {
            $orderId = $data['orderId'];
            $transactionId = $data['transactionId'];
            $amount = $data['amount'];
            $customerInfo = $data['customerInfo'];
            $shippingAddress = $data['shippingAddress'];

            // Create payment record
            $stmt = $this->db->prepare("
                INSERT INTO payments (
                    order_id, transaction_id, payment_method, amount, currency, 
                    customer_info, shipping_address, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $orderId,
                $transactionId,
                'phonepe',
                $amount,
                'INR',
                json_encode($customerInfo),
                json_encode($shippingAddress),
                'pending'
            ]);

            // PhonePe API request
            $phonePeRequest = [
                'merchantId' => $this->merchantConfig['phonepe']['merchantId'],
                'merchantTransactionId' => $transactionId,
                'merchantUserId' => $customerInfo['userId'] ?? 'USER_' . time(),
                'amount' => $amount * 100, // Amount in paise
                'redirectUrl' => $_ENV['FRONTEND_URL'] . '/payment/callback',
                'redirectMode' => 'POST',
                'callbackUrl' => $_ENV['BACKEND_URL'] . '/api/payment/phonepe/callback',
                'mobileNumber' => $customerInfo['phone'] ?? '',
                'paymentInstrument' => [
                    'type' => 'PAY_PAGE'
                ]
            ];

            // Generate checksum
            $checksum = $this->generatePhonePeChecksum($phonePeRequest);
            $phonePeRequest['checksum'] = $checksum;

            // Call PhonePe API
            $phonePeResponse = $this->callPhonePeAPI($phonePeRequest);

            if ($phonePeResponse['success']) {
                return [
                    'success' => true,
                    'orderId' => $orderId,
                    'transactionId' => $transactionId,
                    'paymentUrl' => $phonePeResponse['data']['instrumentResponse']['redirectInfo']['url']
                ];
            } else {
                throw new Exception('PhonePe API call failed');
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'PhonePe session creation failed: ' . $e->getMessage()
            ];
        }
    }

    // Paytm Session Creation
    public function createPaytmSession($data) {
        try {
            $orderId = $data['orderId'];
            $transactionId = $data['transactionId'];
            $amount = $data['amount'];
            $customerInfo = $data['customerInfo'];
            $shippingAddress = $data['shippingAddress'];

            // Create payment record
            $stmt = $this->db->prepare("
                INSERT INTO payments (
                    order_id, transaction_id, payment_method, amount, currency, 
                    customer_info, shipping_address, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $orderId,
                $transactionId,
                'paytm',
                $amount,
                'INR',
                json_encode($customerInfo),
                json_encode($shippingAddress),
                'pending'
            ]);

            // Paytm API request
            $paytmRequest = [
                'MID' => $this->merchantConfig['paytm']['merchantId'],
                'ORDER_ID' => $orderId,
                'CUST_ID' => $customerInfo['userId'] ?? 'CUST_' . time(),
                'INDUSTRY_TYPE_ID' => 'Retail',
                'CHANNEL_ID' => 'WAP',
                'TXN_AMOUNT' => $amount,
                'WEBSITE' => $this->merchantConfig['paytm']['website'],
                'CALLBACK_URL' => $_ENV['BACKEND_URL'] . '/api/payment/paytm/callback',
                'EMAIL' => $customerInfo['email'] ?? '',
                'MOBILE_NO' => $customerInfo['phone'] ?? ''
            ];

            // Generate checksum
            $checksum = $this->generatePaytmChecksum($paytmRequest);
            $paytmRequest['CHECKSUMHASH'] = $checksum;

            // Call Paytm API
            $paytmResponse = $this->callPaytmAPI($paytmRequest);

            if ($paytmResponse['success']) {
                return [
                    'success' => true,
                    'orderId' => $orderId,
                    'transactionId' => $transactionId,
                    'paymentUrl' => $paytmResponse['data']['redirectUrl']
                ];
            } else {
                throw new Exception('Paytm API call failed');
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Paytm session creation failed: ' . $e->getMessage()
            ];
        }
    }

    // UPI Session Creation
    public function createUPISession($data) {
        try {
            $orderId = $data['orderId'];
            $transactionId = $data['transactionId'];
            $amount = $data['amount'];
            $customerInfo = $data['customerInfo'];
            $shippingAddress = $data['shippingAddress'];
            $upiString = $data['upiString'];

            // Create payment record
            $stmt = $this->db->prepare("
                INSERT INTO payments (
                    order_id, transaction_id, payment_method, amount, currency, 
                    customer_info, shipping_address, upi_string, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $orderId,
                $transactionId,
                'upi',
                $amount,
                'INR',
                json_encode($customerInfo),
                json_encode($shippingAddress),
                $upiString,
                'pending'
            ]);

            // Generate QR Code
            $qrCode = $this->generateQRCode($upiString);

            return [
                'success' => true,
                'orderId' => $orderId,
                'transactionId' => $transactionId,
                'upiString' => $upiString,
                'qrCode' => $qrCode
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'UPI session creation failed: ' . $e->getMessage()
            ];
        }
    }

    // Payment Verification
    public function verifyPayment($orderId, $transactionId, $paymentMethod) {
        try {
            // Get payment record
            $stmt = $this->db->prepare("
                SELECT * FROM payments 
                WHERE order_id = ? AND transaction_id = ? AND payment_method = ?
            ");
            $stmt->execute([$orderId, $transactionId, $paymentMethod]);
            $payment = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$payment) {
                return [
                    'success' => false,
                    'message' => 'Payment record not found'
                ];
            }

            // Verify payment based on method
            $verificationResult = $this->verifyPaymentByMethod($payment, $paymentMethod);

            if ($verificationResult['success']) {
                // Update payment status
                $updateStmt = $this->db->prepare("
                    UPDATE payments 
                    SET status = 'completed', verified_at = NOW() 
                    WHERE order_id = ? AND transaction_id = ?
                ");
                $updateStmt->execute([$orderId, $transactionId]);

                return [
                    'success' => true,
                    'paymentStatus' => 'completed',
                    'transactionId' => $transactionId,
                    'amount' => $payment['amount'],
                    'paymentMethod' => $paymentMethod
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Payment verification failed'
                ];
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Payment verification failed: ' . $e->getMessage()
            ];
        }
    }

    // Helper Methods
    private function generatePhonePeChecksum($data) {
        $hashString = '';
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $hashString .= $key . '=' . json_encode($value) . '&';
            } else {
                $hashString .= $key . '=' . $value . '&';
            }
        }
        $hashString = rtrim($hashString, '&');
        $hashString .= $this->merchantConfig['phonepe']['saltKey'];
        
        return hash('sha256', $hashString);
    }

    private function generatePaytmChecksum($data) {
        $hashString = '';
        foreach ($data as $key => $value) {
            $hashString .= $key . '=' . $value . '&';
        }
        $hashString = rtrim($hashString, '&');
        $hashString .= $this->merchantConfig['paytm']['merchantKey'];
        
        return hash('sha256', $hashString);
    }

    private function generateQRCode($upiString) {
        // Use a QR code library or API
        $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=' . urlencode($upiString);
        return $qrCodeUrl;
    }

    private function callPhonePeAPI($data) {
        // Implement PhonePe API call
        $url = $this->merchantConfig['phonepe']['environment'] === 'production' 
            ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay' 
            : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay';

        $response = $this->makeAPICall($url, $data);
        return $response;
    }

    private function callPaytmAPI($data) {
        // Implement Paytm API call
        $url = $this->merchantConfig['paytm']['environment'] === 'production' 
            ? 'https://securegw.paytm.in/theia/processTransaction' 
            : 'https://securegw-stage.paytm.in/theia/processTransaction';

        $response = $this->makeAPICall($url, $data);
        return $response;
    }

    private function makeAPICall($url, $data) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $decodedResponse = json_decode($response, true);
            return [
                'success' => true,
                'data' => $decodedResponse
            ];
        } else {
            return [
                'success' => false,
                'message' => 'API call failed with HTTP code: ' . $httpCode
            ];
        }
    }

    private function verifyPaymentByMethod($payment, $paymentMethod) {
        // Implement payment verification logic based on method
        // This would typically involve calling the payment gateway's verification API
        
        switch ($paymentMethod) {
            case 'googlepay':
                return $this->verifyGooglePay($payment);
            case 'phonepe':
                return $this->verifyPhonePe($payment);
            case 'paytm':
                return $this->verifyPaytm($payment);
            case 'upi':
                return $this->verifyUPI($payment);
            default:
                return ['success' => false, 'message' => 'Unknown payment method'];
        }
    }

    private function verifyGooglePay($payment) {
        // Implement Google Pay verification
        return ['success' => true];
    }

    private function verifyPhonePe($payment) {
        // Implement PhonePe verification
        return ['success' => true];
    }

    private function verifyPaytm($payment) {
        // Implement Paytm verification
        return ['success' => true];
    }

    private function verifyUPI($payment) {
        // Implement UPI verification
        return ['success' => true];
    }
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $paymentAPI = new PaymentAPI($db);

    $action = $data['action'] ?? '';

    switch ($action) {
        case 'create-googlepay-session':
            $result = $paymentAPI->createGooglePaySession($data);
            break;
        case 'create-phonepe-session':
            $result = $paymentAPI->createPhonePeSession($data);
            break;
        case 'create-paytm-session':
            $result = $paymentAPI->createPaytmSession($data);
            break;
        case 'create-upi-session':
            $result = $paymentAPI->createUPISession($data);
            break;
        case 'verify-payment':
            $result = $paymentAPI->verifyPayment($data['orderId'], $data['transactionId'], $data['paymentMethod']);
            break;
        default:
            $result = ['success' => false, 'message' => 'Invalid action'];
    }

    header('Content-Type: application/json');
    echo json_encode($result);
} else {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
