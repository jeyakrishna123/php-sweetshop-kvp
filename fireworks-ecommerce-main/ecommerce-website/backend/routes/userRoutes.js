import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  verifyEmail,
} from "../controllers/userController.js";
import {
  isAuthenticated,
  isAdmin,
  isVerified,
} from "../middleware/auth.js";
import {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange
} from "../middleware/validation.js";

const router = express.Router();

// Authentication routes
router.post("/register", validateUserRegistration, registerUser);
router.post("/login", validateUserLogin, loginUser);
router.get("/logout", logoutUser);
router.get("/verify/:token", verifyEmail);

// Password routes
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.put("/password", isAuthenticated, validatePasswordChange, updateUserPassword);

// User profile routes
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile", isAuthenticated, validateProfileUpdate, updateUserProfile);

// Admin routes
router.get("/", isAuthenticated, isAdmin, getAllUsers);
router
  .route("/:id")
  .get(isAuthenticated, isAdmin, getSingleUser)
  .put(isAuthenticated, isAdmin, updateUser)
  .delete(isAuthenticated, isAdmin, deleteUser);

export default router;
