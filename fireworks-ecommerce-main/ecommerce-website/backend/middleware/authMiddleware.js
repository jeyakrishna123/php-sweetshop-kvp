import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

// ✅ Authenticated routes
const protect = asyncHandler(async (req, res, next) => {
  console.log('Protect middleware triggered for:', req.method, req.originalUrl);
  let token;

  // Check for token in cookies first
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  // Then check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    // Set user info from token
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

// ✅ Admin-only routes
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

export { protect, admin };
