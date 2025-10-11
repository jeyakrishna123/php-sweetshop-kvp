import jwt from "jsonwebtoken";

// Generate JWT Token
const sendToken = (user, statusCode, res) => {
  // Create JWT Token
  const token = user.getSignedJwtToken();

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: false, // Allow JavaScript access in development
    secure: process.env.NODE_ENV === "production", // Only use secure in production
    sameSite: "lax", // Protect against CSRF
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user,
    });
};

export default sendToken; 