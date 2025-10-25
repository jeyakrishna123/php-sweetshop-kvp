import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

const SignupOtpModal = ({ isOpen, onClose, onSuccess, email, userName }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  
  const modalRef = useRef(null);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCountdown(60);
      setIsResendDisabled(true);
      setOtp('');
      setError('');
      setSuccess('');
      
      // Focus first input after modal opens
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
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

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    
    // Only allow single digits
    if (!/^\d$/.test(value) && value !== '') return;

    // Create new OTP array
    const newOtp = otp.split('');
    newOtp[index] = value;
    const updatedOtp = newOtp.join('');
    setOtp(updatedOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      setTimeout(() => {
        otpInputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    const { key } = e;
    
    // Handle backspace
    if (key === 'Backspace') {
      if (!otp.split('')[index] && index > 0) {
        // If current field is empty, go to previous field
        otpInputRefs.current[index - 1]?.focus();
      } else if (otp.split('')[index]) {
        // If current field has value, clear it
        const newOtp = otp.split('');
        newOtp[index] = '';
        setOtp(newOtp.join(''));
      }
    }
    
    // Handle arrow keys
    if (key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    
    // Handle paste
    if (key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        if (/^\d{6}$/.test(text)) {
          setOtp(text);
          otpInputRefs.current[5]?.focus();
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
      const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/auth/verify-signup-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully! Your account is now active.');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(data.message || 'Invalid or expired OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/auth/resend-signup-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('New OTP sent to your email address');
        setCountdown(60);
        setIsResendDisabled(true);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Icon name="email" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Verify Your Email</h2>
                <p className="text-red-100 text-sm">Enter the OTP sent to your email</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
            >
              <Icon name="close" className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Welcome, {userName}!
            </h3>
            <p className="text-gray-600 text-sm">
              We've sent a verification code to <span className="font-medium text-red-600">{email}</span>
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 mb-4">
              <Icon name="info" className="text-red-500" />
              <span>{error}</span>
            </div>
          )}

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
              <div className="flex justify-center space-x-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength="1"
                    value={otp.split('')[index] || ''}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text');
                      if (/^\d{6}$/.test(pastedData)) {
                        setOtp(pastedData);
                        otpInputRefs.current[5]?.focus();
                      }
                    }}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-red-400"
                    placeholder="0"
                    autoComplete="off"
                    required
                  />
                ))}
              </div>
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
                  className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleResendOtp}
                disabled={isResendDisabled || loading}
                className="text-red-600 hover:text-red-700 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                resend
              </button>
            </p>
            
            {/* Development Helper */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 font-medium mb-2">
                🧪 Development Mode: Use OTP from console logs
              </p>
              <button
                onClick={() => {
                  // This will be populated by the backend response
                  console.log('📧 Check backend logs for OTP or use: 864333');
                }}
                className="text-xs text-yellow-600 hover:text-yellow-700 underline"
              >
                Show OTP in Console
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupOtpModal;
