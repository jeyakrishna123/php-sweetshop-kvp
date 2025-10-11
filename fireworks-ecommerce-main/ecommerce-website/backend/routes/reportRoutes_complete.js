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
} from "../controllers/reportController_complete.js";

const router = express.Router();

// All routes require admin authentication
router.use(isAuthenticated);
router.use(isAdmin);

// Basic Report Generation
router.post("/sales", generateSalesReport);
router.post("/customers", generateCustomerReport);
router.post("/inventory", generateInventoryReport);

// Dashboard and Analytics
router.get("/dashboard", getAnalyticsDashboard);
router.get("/realtime", getRealTimeData);
router.get("/analytics", getAdvancedAnalytics);

// Reports Management
router.get("/", getReportsList);

// Export Options
router.post("/export/excel", exportToExcel);
router.post("/export/csv", exportToCSV);
router.post("/export/json", exportToJSON);

export default router;
