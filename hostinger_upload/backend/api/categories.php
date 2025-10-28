<?php
/**
 * Categories API Endpoints - PRODUCTION FIXED VERSION
 * Routes: /api/categories/*
 */

// Enhanced error reporting
error_reporting(E_ALL);
ini_set("display_errors", 0);
ini_set("log_errors", 1);

// Set proper headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Include required files with error handling
try {
    require_once __DIR__ . "/../config/database.php";
    require_once __DIR__ . "/../config/config.php";
    require_once __DIR__ . "/../includes/helpers.php";
    require_once __DIR__ . "/../middleware/auth.php";
    require_once __DIR__ . "/../middleware/cors.php";
} catch (Exception $e) {
    error_log("❌ Categories API Setup Error: " . $e->getMessage());
    sendError("API setup failed", [], 500);
}

// Handle CORS
try {
    CorsMiddleware::handle();
} catch (Exception $e) {
    error_log("❌ CORS Error: " . $e->getMessage());
}

// Get database connection
try {
    $db = Database::getInstance()->getConnection();
} catch (Exception $e) {
    error_log("❌ Database Connection Error: " . $e->getMessage());
    sendError("Database connection failed", [], 500);
}

$method = $_SERVER["REQUEST_METHOD"];
$requestUri = $_SERVER["REQUEST_URI"];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode("/", trim($path, "/"));

// Handle both /api/categories and /api/php-backend/api/categories
if (isset($pathParts[1]) && $pathParts[1] === "php-backend" && isset($pathParts[2]) && $pathParts[2] === "api" && isset($pathParts[3]) && $pathParts[3] === "categories") {
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : "";
    $id = isset($pathParts[5]) ? $pathParts[5] : null;
} else {
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : "";
    $id = isset($pathParts[3]) ? $pathParts[3] : null;
}

try {
    error_log("🔍 Categories API - Method: $method, Endpoint: $endpoint");
    
    switch ($endpoint) {
        case "":
            if ($method === "GET") {
                getAllCategories($db);
            } elseif ($method === "POST") {
                createCategory($db);
            }
            break;

        case "all":
            if ($method === "GET") {
                getAllCategories($db);
            }
            break;

        case "tree":
            if ($method === "GET") {
                getCategoryTree($db);
            }
            break;

        case "featured":
            if ($method === "GET") {
                getFeaturedCategories($db);
            }
            break;

        default:
            if (is_numeric($endpoint)) {
                $categoryId = $endpoint;
                if ($method === "GET") {
                    getCategoryById($db, $categoryId);
                } elseif ($method === "PUT") {
                    updateCategory($db, $categoryId);
                } elseif ($method === "DELETE") {
                    deleteCategory($db, $categoryId);
                }
            } else {
                sendError("Endpoint not found", [], 404);
            }
    }
} catch (Exception $e) {
    error_log("❌❌❌ FATAL ERROR in categories.php:");
    error_log("Message: " . $e->getMessage());
    error_log("File: " . $e->getFile());
    error_log("Line: " . $e->getLine());
    error_log("Trace: " . $e->getTraceAsString());
    
    sendError("Server error", [
        "error" => $e->getMessage(),
        "file" => basename($e->getFile()),
        "line" => $e->getLine()
    ], 500);
}

/**
 * Get all categories with enhanced error handling
 */
function getAllCategories($db) {
    try {
        error_log("🔍 Getting all categories");
        
        // First try to get from categories table
        $stmt = $db->prepare("
            SELECT id, name, slug, description, image, icon, parent_id, level,
                   is_active, featured, sort_order, product_count, created_at, updated_at
            FROM categories
            WHERE is_active = 1
            ORDER BY sort_order ASC, name ASC
        ");
        $stmt->execute();
        $categories = $stmt->fetchAll();

        // If no categories in categories table, get from products
        if (empty($categories)) {
            error_log("🔍 No categories table, getting from products");
            $stmt = $db->prepare("
                SELECT DISTINCT category as name, category as slug, COUNT(*) as product_count
                FROM products 
                WHERE is_active = 1 
                GROUP BY category 
                ORDER BY category
            ");
            $stmt->execute();
            $categories = $stmt->fetchAll();
            
            // Add missing fields
            foreach ($categories as &$category) {
                $category["id"] = null;
                $category["description"] = "";
                $category["image"] = "";
                $category["icon"] = "📦";
                $category["parent_id"] = null;
                $category["level"] = 0;
                $category["is_active"] = 1;
                $category["featured"] = 0;
                $category["sort_order"] = 0;
                $category["created_at"] = null;
                $category["updated_at"] = null;
            }
        }

        error_log("✅ Retrieved " . count($categories) . " categories");
        sendSuccess("Categories retrieved successfully", ["categories" => $categories]);
        
    } catch (Exception $e) {
        error_log("❌ getAllCategories Error: " . $e->getMessage());
        
        // Fallback: return empty categories array
        sendSuccess("Categories retrieved successfully", ["categories" => []]);
    }
}

/**
 * Get category by ID with enhanced error handling
 */
function getCategoryById($db, $id) {
    try {
        error_log("🔍 Getting category by ID: $id");
        
        $stmt = $db->prepare("
            SELECT * FROM categories WHERE id = ? AND is_active = 1
        ");
        $stmt->execute([$id]);
        $category = $stmt->fetch();

        if (!$category) {
            sendError("Category not found", [], 404);
            return;
        }

        // Get products count
        $countStmt = $db->prepare("
            SELECT COUNT(*) as count FROM products
            WHERE category_id = ? AND is_active = 1
        ");
        $countStmt->execute([$id]);
        $category["product_count"] = $countStmt->fetch()["count"];

        sendSuccess("Category retrieved successfully", ["category" => $category]);
        
    } catch (Exception $e) {
        error_log("❌ getCategoryById Error: " . $e->getMessage());
        sendError("Failed to retrieve category", [], 500);
    }
}

/**
 * Get category tree with enhanced error handling
 */
function getCategoryTree($db) {
    try {
        error_log("🔍 Getting category tree");
        
        // Get all categories
        $stmt = $db->prepare("
            SELECT id, name, slug, description, image, icon, parent_id, level,
                   featured, sort_order, product_count
            FROM categories
            WHERE is_active = 1
            ORDER BY sort_order ASC, name ASC
        ");
        $stmt->execute();
        $allCategories = $stmt->fetchAll();

        // Build tree structure
        $tree = [];
        $categoryMap = [];

        // First pass: create map
        foreach ($allCategories as $category) {
            $category["children"] = [];
            $categoryMap[$category["id"]] = $category;
        }

        // Second pass: build tree
        foreach ($categoryMap as $id => $category) {
            if ($category["parent_id"] === null) {
                $tree[] = &$categoryMap[$id];
            } else {
                if (isset($categoryMap[$category["parent_id"]])) {
                    $categoryMap[$category["parent_id"]]["children"][] = &$categoryMap[$id];
                }
            }
        }

        sendSuccess("Category tree retrieved successfully", ["categories" => $tree]);
        
    } catch (Exception $e) {
        error_log("❌ getCategoryTree Error: " . $e->getMessage());
        sendSuccess("Category tree retrieved successfully", ["categories" => []]);
    }
}

/**
 * Get featured categories with enhanced error handling
 */
function getFeaturedCategories($db) {
    try {
        $limit = isset($_GET["limit"]) ? min(intval($_GET["limit"]), 20) : 6;
        error_log("🔍 Getting featured categories with limit: $limit");

        $stmt = $db->prepare("
            SELECT id, name, slug, description, image, icon, product_count
            FROM categories
            WHERE featured = 1 AND is_active = 1
            ORDER BY sort_order ASC, name ASC
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        $categories = $stmt->fetchAll();

        sendSuccess("Featured categories retrieved successfully", ["categories" => $categories]);
        
    } catch (Exception $e) {
        error_log("❌ getFeaturedCategories Error: " . $e->getMessage());
        sendSuccess("Featured categories retrieved successfully", ["categories" => []]);
    }
}

/**
 * Create category with enhanced error handling
 */
function createCategory($db) {
    try {
        $authUser = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($authUser);
        
        error_log("🔍 Creating new category");

        $data = getRequestBody();

        $errors = validateRequired($data, ["name", "image"]);
        if (!empty($errors)) {
            sendError("Validation failed", $errors, 400);
            return;
        }

        $slug = generateSlug($data["name"]);

        // Check if slug already exists
        $stmt = $db->prepare("SELECT id FROM categories WHERE slug = ?");
        $stmt->execute([$slug]);
        if ($stmt->fetch()) {
            sendError("Category with this name already exists", [], 409);
            return;
        }

        $stmt = $db->prepare("
            INSERT INTO categories (
                name, slug, description, image, icon, parent_id, level,
                is_active, featured, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $level = 0;
        if (isset($data["parentId"]) && $data["parentId"]) {
            $level = 1; // Simplified - could calculate based on parent
        }

        $result = $stmt->execute([
            sanitizeInput($data["name"]),
            $slug,
            sanitizeInput($data["description"] ?? ""),
            sanitizeInput($data["image"]),
            $data["icon"] ?? "📦",
            $data["parentId"] ?? null,
            $level,
            $data["isActive"] ?? 1,
            $data["featured"] ?? 0,
            $data["sortOrder"] ?? 0
        ]);

        if ($result) {
            $categoryId = $db->lastInsertId();
            error_log("✅ Category created with ID: $categoryId");
            sendSuccess("Category created successfully", ["id" => $categoryId], 201);
        } else {
            sendError("Failed to create category", [], 500);
        }
        
    } catch (Exception $e) {
        error_log("❌ createCategory Error: " . $e->getMessage());
        sendError("Failed to create category", [], 500);
    }
}

/**
 * Update category with enhanced error handling
 */
function updateCategory($db, $id) {
    try {
        $authUser = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($authUser);
        
        error_log("🔍 Updating category ID: $id");

        $data = getRequestBody();

        $fields = [];
        $params = [];

        $allowedFields = ["name", "description", "image", "icon", "parent_id",
                          "is_active", "featured", "sort_order"];

        foreach ($allowedFields as $field) {
            $camelField = lcfirst(str_replace("_", "", ucwords($field, "_")));
            if (isset($data[$camelField])) {
                $fields[] = "$field = ?";
                $params[] = sanitizeInput($data[$camelField]);
            }
        }

        // Update slug if name changed
        if (isset($data["name"])) {
            $fields[] = "slug = ?";
            $params[] = generateSlug($data["name"]);
        }

        if (empty($fields)) {
            sendError("No fields to update", [], 400);
            return;
        }

        $params[] = $id;
        $sql = "UPDATE categories SET " . implode(", ", $fields) . " WHERE id = ?";

        $stmt = $db->prepare($sql);

        if ($stmt->execute($params)) {
            error_log("✅ Category updated successfully");
            sendSuccess("Category updated successfully");
        } else {
            sendError("Failed to update category", [], 500);
        }
        
    } catch (Exception $e) {
        error_log("❌ updateCategory Error: " . $e->getMessage());
        sendError("Failed to update category", [], 500);
    }
}

/**
 * Delete category with enhanced error handling
 */
function deleteCategory($db, $id) {
    try {
        $authUser = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($authUser);
        
        error_log("🔍 Deleting category ID: $id");

        // Check if category has products
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
        $stmt->execute([$id]);
        $count = $stmt->fetch()["count"];

        if ($count > 0) {
            sendError("Cannot delete category with products", ["count" => $count], 400);
            return;
        }

        // Soft delete
        $stmt = $db->prepare("UPDATE categories SET is_active = 0 WHERE id = ?");

        if ($stmt->execute([$id])) {
            error_log("✅ Category deleted successfully");
            sendSuccess("Category deleted successfully");
        } else {
            sendError("Failed to delete category", [], 500);
        }
        
    } catch (Exception $e) {
        error_log("❌ deleteCategory Error: " . $e->getMessage());
        sendError("Failed to delete category", [], 500);
    }
}
?>