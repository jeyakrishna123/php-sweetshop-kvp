import express from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { 
  getAIAnalytics, 
  getVisualizations, 
  getBIAnalysis,
  getAIRecommendations,
  getCustomerBehaviorAnalysis,
  getInventoryOptimization,
  getFraudAnalysis,
  getAIChatResponse,
  getSmartInsights,
  getPriceOptimization
} from "../controllers/aiController.js";

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(isAuthenticated);
router.use(isAdmin);

// AI Analytics routes
router.get("/analytics", getAIAnalytics);
router.get("/visualizations", getVisualizations);
router.get("/bi/analysis", getBIAnalysis);

// Advanced AI Features
router.get("/recommendations", getAIRecommendations);
router.get("/customer-behavior", getCustomerBehaviorAnalysis);
router.get("/inventory-optimization", getInventoryOptimization);
router.get("/fraud-analysis", getFraudAnalysis);
router.post("/chat", getAIChatResponse);
router.get("/smart-insights", getSmartInsights);
router.get("/price-optimization", getPriceOptimization);

export default router;
