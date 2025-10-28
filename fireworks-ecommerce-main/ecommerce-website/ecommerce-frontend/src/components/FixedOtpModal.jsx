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
        otpInputRef.current?.focus();
      }, 100);
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
              
              {/* Single OTP Input - Much Simpler */}
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={handleOtpChange}
                className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="000000"
                maxLength="6"
                autoComplete="off"
                required
              />
              
              <p className="text-sm text-gray-500 mt-3 text-center">
                Enter the 6-digit code sent to {email}
              </p>
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
