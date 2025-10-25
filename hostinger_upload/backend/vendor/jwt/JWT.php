<?php
/**
 * Simple JWT (JSON Web Token) Implementation
 * For production, consider using: composer require firebase/php-jwt
 */

class JWT {
    /**
     * Encode payload to JWT
     */
    public static function encode($payload, $secret) {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }

    /**
     * Decode JWT token
     */
    public static function decode($token, $secret) {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new Exception('Invalid token format');
        }

        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;

        // Verify signature
        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $secret, true);
        $signatureCheck = self::base64UrlEncode($signature);

        if ($signatureEncoded !== $signatureCheck) {
            throw new Exception('Invalid token signature');
        }

        // Decode payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded));

        if (!$payload) {
            throw new Exception('Invalid token payload');
        }

        // Check expiration
        if (isset($payload->exp) && $payload->exp < time()) {
            throw new Exception('Token has expired');
        }

        return $payload;
    }

    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
