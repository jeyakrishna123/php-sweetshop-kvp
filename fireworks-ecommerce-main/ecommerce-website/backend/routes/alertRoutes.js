import express from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { 
  getAlerts, 
  acknowledgeAlert, 
  getAlertRules, 
  createAlertRule, 
  updateAlertRule, 
  deleteAlertRule 
} from "../controllers/alertController.js";

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(isAuthenticated);
router.use(isAdmin);

// Alert routes
router.get("/", getAlerts);
router.patch("/:alertId/acknowledge", acknowledgeAlert);

// Alert rules routes
router.get("/rules", getAlertRules);
router.post("/rules", createAlertRule);
router.patch("/rules/:ruleId", updateAlertRule);
router.delete("/rules/:ruleId", deleteAlertRule);

export default router;
