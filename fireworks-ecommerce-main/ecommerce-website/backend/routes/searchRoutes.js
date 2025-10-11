import express from "express";
import { 
  advancedSearch, 
  getSearchSuggestions, 
  getPopularSearches, 
  getSearchFilters 
} from "../controllers/searchController.js";

const router = express.Router();

// Advanced search
router.get("/", advancedSearch);

// Get search suggestions
router.get("/suggestions", getSearchSuggestions);

// Get popular searches
router.get("/popular", getPopularSearches);

// Get filter options
router.get("/filters", getSearchFilters);

export default router;
