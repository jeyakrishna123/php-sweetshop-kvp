import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus
} from "../controllers/wishlistController.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Get user's wishlist
router.get("/", getUserWishlist);

// Add product to wishlist
router.post("/add", addToWishlist);

// Remove product from wishlist
router.delete("/remove/:productId", removeFromWishlist);

// Clear entire wishlist
router.delete("/clear", clearWishlist);

// Check if product is in wishlist
router.get("/check/:productId", checkWishlistStatus);

export default router;
