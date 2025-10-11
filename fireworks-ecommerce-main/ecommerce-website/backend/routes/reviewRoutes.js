import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews,
  getAllReviews
} from "../controllers/reviewController.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);
router.post("/helpful/:reviewId", markReviewHelpful);

// Protected routes (require authentication)
router.post("/", isAuthenticated, createReview);
router.put("/:reviewId", isAuthenticated, updateReview);
router.delete("/:reviewId", isAuthenticated, deleteReview);
router.get("/user/my-reviews", isAuthenticated, getUserReviews);

// Admin routes
router.get("/admin/all", isAuthenticated, getAllReviews);

export default router;
