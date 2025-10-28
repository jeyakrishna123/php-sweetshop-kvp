import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

const FixedOtpModal = ({ isOpen, onClose, onSuccess, email, userName }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  
  const modalRef = useRef(null);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCountdown(60);
      setIsResendDisabled(true);
      setOtp('');
      setError('');
      setSuccess('');
      
      // Focus OTP input after modal opens
      setTimeout(() => {
        if (otpInputRef.current) {
          otpInputRef.current.focus();
          otpInputRef.current.click(); // Ensure input is active
        }
      }, 200);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [countdown]);

  const handleClose = () => {
    setOtp('');
    setError('');
    setSuccess('');
    setCountdown(60);
    setIsResendDisabled(true);
    onClose();
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    
    // Only allow digits and limit to 6 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    setError(''); // Clear error when user types
    
    // Debug log to check if input is working
    console.log('OTP Input changed:', numericValue);
  };

  const handleOtpDigitChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow single digit
    if (value && !/^\d$/.test(value)) {
      return;
    }
    
    // Update OTP string
    const newOtp = otp.split('');
    newOtp[index] = value;
    const otpString = newOtp.join('');
    setOtp(otpString);
    setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = e.target.parentElement.children[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    console.log('OTP Digit changed:', value, 'at index:', index, 'Full OTP:', otpString);
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.target.parentElement.children[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const numericText = text.replace(/\D/g, '').slice(0, 6);
        if (numericText.length === 6) {
          setOtp(numericText);
          setError('');
        }
      });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      // Force production API URL
      const apiUrl = 'https://skbakers.com/api';
      const response = await fetch(`${apiUrl}/auth/verify-signup-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Force production API URL
      const apiUrl = 'https://skbakers.com/api';
      const response = await fetch(`${apiUrl}/auth/resend-signup-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('New OTP sent to your email');
        setCountdown(60);
        setIsResendDisabled(true);
        setOtp('');
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all"
      >
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="mail" className="text-white" />
              <div>
                <h2 className="text-xl font-bold">Verify Your Email</h2>
                <p className="text-red-100 text-sm">Enter the OTP sent to your email</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <Icon name="x" className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Welcome, {userName}!
            </h3>
            <p className="text-gray-600 mt-2">
              We've sent a verification code to <span className="text-red-600 font-semibold">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 mb-4">
              <Icon name="alert-circle" className="text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 mb-4">
              <Icon name="check" className="text-green-500" />
              <span>{success}</span>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Enter Verification Code
              </label>
              
              {/* Individual OTP Input Boxes */}
              <div className="flex justify-center space-x-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={index === 0 ? otpInputRef : null}
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    min="0"
                    max="9"
                    step="1"
                    value={otp[index] || ''}
                    onChange={(e) => handleOtpDigitChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900"
                    style={{
                      color: '#000',
                      backgroundColor: '#fff',
                      border: '2px solid #d1d5db',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                    autoComplete="off"
                  />
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-3 text-center">
                Enter the 6-digit code sent to {email}
              </p>
              
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                  Current OTP: "{otp}" (Length: {otp.length}/6)
                </div>
              )}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              {isResendDisabled ? (
                <p className="text-sm text-gray-500">
                  Resend OTP in {countdown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendDisabled || loading}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                resend
              </button>
            </p>
          </div>

          {/* Development Mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-800 text-sm">
                <Icon name="info" className="text-yellow-600" />
                <span className="font-medium">Development Mode: Use OTP from console logs</span>
              </div>
              <button
                type="button"
                onClick={() => console.log('Check console for OTP')}
                className="text-blue-600 hover:text-blue-700 text-sm mt-1"
              >
                Show OTP in Console
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixedOtpModal;
