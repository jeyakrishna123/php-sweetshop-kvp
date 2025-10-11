import express from "express";
import { 
  getOrderTracking, 
  updateTrackingStatus, 
  getAllOrdersForTracking,
  getTrackingStats 
} from "../controllers/trackingController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get order tracking by tracking number (public)
router.get("/:trackingNumber", getOrderTracking);

// Update tracking status (admin only)
router.put("/:orderId/status", isAuthenticated, isAdmin, updateTrackingStatus);

// Get all orders for tracking (admin only)
router.get("/", isAuthenticated, isAdmin, getAllOrdersForTracking);

// Get tracking statistics (admin only)
router.get("/stats/overview", isAuthenticated, isAdmin, getTrackingStats);

export default router;
