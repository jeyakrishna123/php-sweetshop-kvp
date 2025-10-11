import jwt from "jsonwebtoken";
import db from "../database.js";

// Check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
  try {
    console.log('🔍 Auth Middleware: Starting authentication check for:', req.method, req.url);
    // Get token from cookies or Authorization header with proper extraction
    let token = null;
    
    // Check Authorization header first
    if (req.headers?.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    // Fallback to cookies if no Authorization header
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
    }

    try {
      console.log('🔍 Auth Middleware: Verifying token:', token.substring(0, 20) + '...');
      // Use fallback JWT secret if not set
      const jwtSecret = process.env.JWT_SECRET || 'sk-bakers-super-secret-jwt-key-2024-production-ready';
      // Verify token with proper error handling
      const decoded = jwt.verify(token, jwtSecret);
      console.log('🔍 Auth Middleware: Token decoded successfully:', decoded);
      
      if (!decoded || (!decoded.id && !decoded._id)) {
        console.log('❌ Auth Middleware: Invalid token format');
        return res.status(401).json({ 
          success: false,
          message: "Invalid token format" 
        });
      }
      
      // Find user with proper error handling
      const userId = decoded.id || decoded._id;
      console.log('🔍 Auth Middleware: Looking for user ID:', userId);
      const user = await db.findUserById(userId);
      if (!user) {
        console.log('❌ Auth Middleware: User not found for ID:', userId);
        return res.status(401).json({ 
          success: false,
          message: "User not found" 
        });
      }
      console.log('✅ Auth Middleware: User found:', user.name, user.email);
      
      // Check if user is active
      if (user.isActive === false) {
        return res.status(401).json({ 
          success: false,
          message: "Account is deactivated" 
        });
      }
      
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('❌ Auth Middleware: JWT verification error:', jwtError.message);
      console.error('❌ Auth Middleware: Error type:', jwtError.name);
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired token" 
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error during authentication" 
    });
  }
};

// Check if user is admin
export const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ 
      message: `Role (${req.user.role}) is not allowed to access this resource` 
    });
  }
  next();
};

// Check if user is super admin
export const isSuperAdmin = async (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ 
      message: `Role (${req.user.role}) is not allowed to access this resource` 
    });
  }
  next();
};

// Check if user is seller
export const isSeller = async (req, res, next) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ 
      message: `Role (${req.user.role}) is not allowed to access this resource` 
    });
  }
  next();
};

// Check if user is seller or admin
export const isSellerOrAdmin = async (req, res, next) => {
  if (req.user.role !== "seller" && req.user.role !== "admin") {
    return res.status(403).json({ 
      message: `Role (${req.user.role}) is not allowed to access this resource` 
    });
  }
  next();
};

// Check if user is verified
export const isVerified = async (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      message: "Please verify your email to access this resource" 
    });
  }
  next();
}; 