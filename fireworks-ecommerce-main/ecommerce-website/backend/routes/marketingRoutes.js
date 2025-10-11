import express from "express";
import { 
  getMarketingCampaigns,
  createMarketingCampaign,
  updateMarketingCampaign,
  deleteMarketingCampaign,
  sendMarketingCampaign,
  getMarketingAnalytics
} from "../controllers/marketingController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all marketing campaigns
router.get("/", isAuthenticated, isAdmin, getMarketingCampaigns);

// Get marketing analytics
router.get("/analytics", isAuthenticated, isAdmin, getMarketingAnalytics);

// Create new marketing campaign
router.post("/", isAuthenticated, isAdmin, createMarketingCampaign);

// Update marketing campaign
router.put("/:id", isAuthenticated, isAdmin, updateMarketingCampaign);

// Delete marketing campaign
router.delete("/:id", isAuthenticated, isAdmin, deleteMarketingCampaign);

// Send marketing campaign
router.post("/:id/send", isAuthenticated, isAdmin, sendMarketingCampaign);

export default router;
