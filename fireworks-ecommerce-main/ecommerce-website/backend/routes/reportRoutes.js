import express from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import {
  generateSalesReport,
  generateCustomerReport,
  generateInventoryReport,
  getAnalyticsDashboard,
  getReportsList,
  getRealTimeData,
  getAdvancedAnalytics,
  exportToExcel,
  exportToCSV,
  exportToJSON
} from "../controllers/reportController.js";

const router = express.Router();

// All routes require admin authentication
router.use(isAuthenticated);
router.use(isAdmin);

// Generate reports
router.post("/sales", generateSalesReport);
router.post("/customers", generateCustomerReport);
router.post("/inventory", generateInventoryReport);

// Get analytics dashboard data
router.get("/dashboard", getAnalyticsDashboard);

// Get available reports list
router.get("/", getReportsList);

// Real-time data
router.get("/realtime", getRealTimeData);

// Advanced Analytics
router.get("/analytics", getAdvancedAnalytics);

// Export options
router.post("/export/excel", exportToExcel);
router.post("/export/csv", exportToCSV);
router.post("/export/json", exportToJSON);

export default router;
