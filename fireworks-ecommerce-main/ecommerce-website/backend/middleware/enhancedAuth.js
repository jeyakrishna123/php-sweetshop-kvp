import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../database.js';

// Enhanced JWT Token Management
export const generateSecureToken = (user) => {
  // Extend expiration for admin users to prevent frequent logouts
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const expirationTime = isAdmin 
    ? (30 * 24 * 60 * 60) // 30 days for admin users
    : (7 * 24 * 60 * 60);  // 7 days for regular users
  
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expirationTime
  };

  console.log(`🔐 Generating token for ${user.role} user: ${user.email}, expires in ${expirationTime / 86400} days`);

  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256'
  });
};

// Enhanced Token Verification
export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    // Check if user still exists and is active
    const user = await db.findUserById(decoded.id);
    if (!user || user.isActive === false) {
      throw new Error('User not found or inactive');
    }

    return { user, decoded };
  } catch (error) {
    throw error;
  }
};

// Enhanced Authentication Middleware
export const enhancedAuth = async (req, res, next) => {
  try {
    console.log('🔍 EnhancedAuth: Starting authentication check for:', req.method, req.url);
    console.log('🔍 EnhancedAuth: Request headers:', req.headers);
    console.log('🔍 EnhancedAuth: Request cookies:', req.cookies);
    
    let token;

    // Check for token in multiple locations
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔍 EnhancedAuth: Token found in Authorization header');
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('🔍 EnhancedAuth: Token found in cookies');
    } else if (req.query.token) {
      token = req.query.token;
      console.log('🔍 EnhancedAuth: Token found in query params');
    }

    if (!token) {
      console.log('❌ EnhancedAuth: No token found');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    console.log('🔍 EnhancedAuth: Token found:', token.substring(0, 20) + '...');

    try {
      console.log('🔍 EnhancedAuth: Verifying JWT token...');
      console.log('🔍 EnhancedAuth: JWT_SECRET exists:', !!process.env.JWT_SECRET);
      console.log('🔍 EnhancedAuth: JWT_SECRET length:', process.env.JWT_SECRET?.length);
      
      // Use a fallback JWT secret if not set
      const jwtSecret = process.env.JWT_SECRET || 'sk-bakers-super-secret-jwt-key-2024-production-ready';
      console.log('🔍 EnhancedAuth: Using JWT secret length:', jwtSecret.length);
      
      // Verify token
      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256']
      });
      console.log('🔍 EnhancedAuth: Token decoded successfully:', decoded);

      if (!decoded || !decoded.id) {
        console.log('❌ EnhancedAuth: Invalid token format');
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }

      console.log('🔍 EnhancedAuth: Looking for user with ID:', decoded.id);
      // Find user with proper error handling
      const user = await db.findUserById(decoded.id);
      if (!user) {
        console.log('❌ EnhancedAuth: User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      console.log('✅ EnhancedAuth: User found:', user.name, user.email, 'Role:', user.role);

      // Check if user is active
      if (user.isActive === false) {
        console.log('❌ EnhancedAuth: User account is deactivated');
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      req.user = user;
      req.token = token;
      req.tokenData = decoded;

      console.log('✅ EnhancedAuth: Authentication successful, calling next()');
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Token verification failed'
      });
    }
  } catch (error) {
    console.error('❌ EnhancedAuth: Authentication error:', error.message);
    console.error('❌ EnhancedAuth: Error stack:', error.stack);
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

// Role-based Authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin Authorization
export const adminAuth = async (req, res, next) => {
  try {
    await enhancedAuth(req, res, async () => {
      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      // Log admin access
      console.log(`🔐 Admin Access: ${req.user.email} - ${req.method} ${req.url}`);

      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication failed'
    });
  }
};

// Super Admin Authorization
export const superAdminAuth = async (req, res, next) => {
  try {
    await enhancedAuth(req, res, async () => {
      if (req.user.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Super admin access required'
        });
      }

      // Additional super admin security
      console.log(`👑 Super Admin Access: ${req.user.email} - ${req.method} ${req.url}`);

      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Super admin authentication failed'
    });
  }
};

// Password Security Validation (Simplified for development)
export const validatePassword = (password) => {
  const minLength = 6; // Reduced from 8 for easier testing
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  // Optional: Basic strength check (commented out for development)
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  // For production, you can uncomment these validations:
  // if (!hasUpperCase) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  // if (!hasLowerCase) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }
  // if (!hasNumbers) {
  //   errors.push('Password must contain at least one number');
  // }
  // if (!hasSpecialChar) {
  //   errors.push('Password must contain at least one special character');
  // }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Enhanced Password Hashing
export const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password Comparison with Timing Attack Protection
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Export all authentication functions
export default {
  generateSecureToken,
  verifyToken,
  enhancedAuth,
  authorize,
  adminAuth,
  superAdminAuth,
  validatePassword,
  hashPassword,
  comparePassword
};
