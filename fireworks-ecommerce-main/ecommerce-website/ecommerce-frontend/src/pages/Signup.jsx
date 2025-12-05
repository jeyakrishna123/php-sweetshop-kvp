import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import SignupOtpModal from '../components/SignupOtpModal';
import FixedOtpModal from '../components/FixedOtpModal';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      return "Please fill in all fields";
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Please enter a valid email address";
    }
    
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Register user (this will create user but not activate account)
      await register(formData.name, formData.email, formData.phone, formData.password);
      
      // Store pending user data for OTP verification
      setPendingUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      
      // Show OTP modal instead of success message
      setShowOtpModal(true);
      
      // Clear form data
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    setSuccess(true);
    setPendingUser(null);
    
    // Navigate to login page after showing success
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  const handleOtpClose = () => {
    setShowOtpModal(false);
    setPendingUser(null);
    // User can try again or go back to form
  };

  // If success, show success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="check" size="xl" className="text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Account Created Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Welcome to our community! Your account has been created successfully. 
              You will be redirected to the login page in a few seconds.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Redirecting to login page...</span>
              </div>
            </div>
            
            <Link 
              to="/login"
              className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
            >
              <Icon name="arrowRight" size="sm" className="mr-2" />
              Go to Login Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Main Content */}
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white border-2 border-red-600 rounded-2xl shadow-lg mb-6">
            <Icon name="user" size="xl" className="text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Join Our Community</h1>
          <p className="text-gray-600 text-lg">Create your account and start shopping today</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-3">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="user" size="sm" className="text-red-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 bg-white"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="email" size="sm" className="text-red-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 bg-white"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-3">
                Phone number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="phone" size="sm" className="text-red-500" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 bg-white"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="password" size="sm" className="text-red-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 bg-white"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  <Icon 
                    name={showPassword ? "eyeSlash" : "eye"} 
                    size="sm" 
                    className="text-red-500 hover:text-red-600" 
                  />
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="text-xs text-gray-700 font-medium mb-3">
                    Password must contain:
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{formData.password.length >= 8 ? '✓' : '✗'}</span>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/[A-Z]/.test(formData.password) ? '✓' : '✗'}</span>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/[a-z]/.test(formData.password) ? '✓' : '✗'}</span>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/\d/.test(formData.password) ? '✓' : '✗'}</span>
                      One number
                    </div>
                    <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '✓' : '✗'}</span>
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-3">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="password" size="sm" className="text-red-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 bg-white"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  <Icon 
                    name={showConfirmPassword ? "eyeSlash" : "eye"} 
                    size="sm" 
                    className="text-red-500 hover:text-red-600" 
                  />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                <Icon name="info" className="text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <Icon name="arrowLeft" size="sm" className="mr-2" />
              Back to home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-red-600 hover:text-red-700 hover:underline transition-colors duration-200">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-red-600 hover:text-red-700 hover:underline transition-colors duration-200">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && pendingUser && (
        <FixedOtpModal
          isOpen={showOtpModal}
          onClose={handleOtpClose}
          onSuccess={handleOtpSuccess}
          email={pendingUser.email}
          userName={pendingUser.name}
        />
      )}
    </div>
  );
};

export default Signup;
