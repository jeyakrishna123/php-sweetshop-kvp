/**
 * JSON Files to MySQL Migration Script
 * This script reads your JSON data files and converts them to MySQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your JSON data files
const DATA_PATH = path.join(__dirname, 'fireworks-ecommerce-main/ecommerce-website/backend/data');
const OUTPUT_FILE = path.join(__dirname, 'migrated-data.sql');

// Helper function to escape SQL strings
function escapeSql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

console.log('🔄 Starting JSON to MySQL migration...\n');
console.log(`📂 Reading data from: ${DATA_PATH}\n`);

let sqlOutput = `-- JSON to MySQL Migration Data
-- Generated: ${new Date().toISOString()}
--

SET FOREIGN_KEY_CHECKS=0;

`;

// ============================================================
// READ JSON FILES
// ============================================================

let users = [];
let products = [];
let orders = [];
let categories = [];
let banners = [];
let reviews = [];
let weightOptions = [];
let offerPopups = [];

try {
  // Read users
  if (fs.existsSync(path.join(DATA_PATH, 'users.json'))) {
    const data = fs.readFileSync(path.join(DATA_PATH, 'users.json'), 'utf8');
    users = JSON.parse(data);
    console.log(`✅ Found ${users.length} users`);
  }

  // Read products
  if (fs.existsSync(path.join(DATA_PATH, 'products.json'))) {
    const data = fs.readFileSync(path.join(DATA_PATH, 'products.json'), 'utf8');
    products = JSON.parse(data);
    console.log(`✅ Found ${products.length} products`);
  }

  // Read orders
  if (fs.existsSync(path.join(DATA_PATH, 'orders.json'))) {
    const data = fs.readFileSync(path.join(DATA_PATH, 'orders.json'), 'utf8');
    orders = JSON.parse(data);
    console.log(`✅ Found ${orders.length} orders`);
  }

  // Read categories
  if (fs.existsSync(path.join(DATA_PATH, 'categories.json'))) {
    const data = fs.readFileSync(path.join(DATA_PATH, 'categories.json'), 'utf8');
    categories = JSON.parse(data);
    console.log(`✅ Found ${categories.length} categories`);
  }

  // Read banners
  if (fs.existsSync(path.join(DATA_PATH, 'banners.json'))) {
    const data = fs.readFileSync(path.join(DATA_PATH, 'banners.json'), 'utf8');
    banners = JSON.parse(data);
    console.log(`✅ Found ${banners.length} banners`);
  }

  // Read reviews
  if (fs.existsSync(path.join(DATA_PATH, 'reviews.json'))) {
    const data = fs.readFileSync(path.join(DATA_PATH, 'reviews.json'), 'utf8');
    reviews = JSON.parse(data);
    console.log(`✅ Found ${reviews.length} reviews`);
  }

  // Read weight options
  if (fs.existsSync(path.join(DATA_PATH, 'weightOptions.json'))) {
    const data = fs.readFileSync(path.join(DATA_PATH, 'weightOptions.json'), 'utf8');
    weightOptions = JSON.parse(data);
    console.log(`✅ Found ${weightOptions.length} weight options`);
  }

  // Read offer popups
  if (fs.existsSync(path.join(DATA_PATH, 'offerPopups.json'))) {
    const data = fs.readFileSync(path.join(DATA_PATH, 'offerPopups.json'), 'utf8');
    offerPopups = JSON.parse(data);
    console.log(`✅ Found ${offerPopups.length} offer popups`);
  }

  console.log('\n📊 Data loaded successfully!\n');

} catch (error) {
  console.error('❌ Error reading JSON files:', error.message);
  process.exit(1);
}

// ============================================================
// MIGRATE USERS
// ============================================================

console.log('👥 Migrating Users...');
sqlOutput += `\n-- ============================================================\n`;
sqlOutput += `-- USERS (${users.length} records)\n`;
sqlOutput += `-- ============================================================\n`;

const userIdMap = new Map();

users.forEach((user, index) => {
  const mysqlId = index + 1;
  userIdMap.set(user._id || user.id, mysqlId);

  const sql = `INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    ${mysqlId},
    ${escapeSql(user.name)},
    ${escapeSql(user.email)},
    ${escapeSql(user.password)},
    ${escapeSql(user.phone)},
    ${escapeSql(user.avatar)},
    ${escapeSql(user.role || 'user')},
    ${escapeSql(user.isActive !== false)},
    ${escapeSql(user.isEmailVerified || false)},
    ${escapeSql(user.lastLogin)},
    ${escapeSql(user.createdAt || new Date())},
    ${escapeSql(user.updatedAt || new Date())}
  );\n`;

  sqlOutput += sql;
});

console.log(`✅ Migrated ${users.length} users\n`);

// ============================================================
// MIGRATE CATEGORIES
// ============================================================

console.log('📂 Migrating Categories...');
sqlOutput += `\n-- ============================================================\n`;
sqlOutput += `-- CATEGORIES (${categories.length} records)\n`;
sqlOutput += `-- ============================================================\n`;

const categoryIdMap = new Map();

categories.forEach((category, index) => {
  const mysqlId = index + 1;
  categoryIdMap.set(category._id || category.id, mysqlId);

  const sql = `INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    ${mysqlId},
    ${escapeSql(category.name)},
    ${escapeSql(category.slug || category.name.toLowerCase().replace(/\s+/g, '-'))},
    ${escapeSql(category.description)},
    ${escapeSql(category.image)},
    ${escapeSql(category.icon || '📦')},
    ${escapeSql(category.isActive !== false)},
    ${escapeSql(category.featured || false)},
    ${escapeSql(category.sortOrder || index)},
    ${escapeSql(category.createdAt || new Date())},
    ${escapeSql(category.updatedAt || new Date())}
  );\n`;

  sqlOutput += sql;
});

console.log(`✅ Migrated ${categories.length} categories\n`);

// ============================================================
// MIGRATE PRODUCTS
// ============================================================

console.log('📦 Migrating Products...');
sqlOutput += `\n-- ============================================================\n`;
sqlOutput += `-- PRODUCTS (${products.length} records)\n`;
sqlOutput += `-- ============================================================\n`;

const productIdMap = new Map();

products.forEach((product, index) => {
  const mysqlId = index + 1;
  productIdMap.set(product._id || product.id, mysqlId);

  const sql = `INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    ${mysqlId},
    ${escapeSql(product.name)},
    ${escapeSql(product.slug || product.name.toLowerCase().replace(/\s+/g, '-'))},
    ${escapeSql(product.description)},
    ${escapeSql(product.price)},
    ${escapeSql(product.originalPrice)},
    ${escapeSql(product.discountPercentage || 0)},
    ${escapeSql(product.category)},
    ${escapeSql(product.stock || 0)},
    ${escapeSql(JSON.stringify(product.images || []))},
    ${escapeSql(product.thumbnail)},
    ${escapeSql(product.featured || false)},
    ${escapeSql(product.isActive !== false)},
    ${escapeSql(product.averageRating || 0)},
    ${escapeSql(product.numReviews || 0)},
    ${escapeSql(product.soldCount || 0)},
    ${escapeSql(product.createdAt || new Date())},
    ${escapeSql(product.updatedAt || new Date())}
  );\n`;

  sqlOutput += sql;
});

console.log(`✅ Migrated ${products.length} products\n`);

// ============================================================
// MIGRATE ORDERS
// ============================================================

console.log('🛒 Migrating Orders...');
sqlOutput += `\n-- ============================================================\n`;
sqlOutput += `-- ORDERS (${orders.length} records)\n`;
sqlOutput += `-- ============================================================\n`;

orders.forEach((order, index) => {
  const mysqlId = index + 1;
  const userId = userIdMap.get(order.user || order.userId) || 1;

  const sql = `INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    ${mysqlId},
    ${userId},
    ${escapeSql(order.trackingNumber || `TRK${Date.now()}${index}`)},
    ${escapeSql(order.status || 'pending')},
    ${escapeSql(order.itemsPrice || 0)},
    ${escapeSql(order.taxPrice || 0)},
    ${escapeSql(order.shippingPrice || 0)},
    ${escapeSql(order.totalPrice || 0)},
    ${escapeSql(order.currency || 'INR')},
    ${escapeSql(order.createdAt || new Date())},
    ${escapeSql(order.updatedAt || new Date())}
  );\n`;

  sqlOutput += sql;
});

console.log(`✅ Migrated ${orders.length} orders\n`);

// ============================================================
// MIGRATE BANNERS
// ============================================================

if (banners.length > 0) {
  console.log('🎨 Migrating Banners...');
  sqlOutput += `\n-- ============================================================\n`;
  sqlOutput += `-- BANNERS (${banners.length} records)\n`;
  sqlOutput += `-- ============================================================\n`;

  banners.forEach((banner, index) => {
    const sql = `INSERT INTO banners (
      title, subtitle, image_url, link, button_text, is_active,
      sort_order, created_at, updated_at
    ) VALUES (
      ${escapeSql(banner.title)},
      ${escapeSql(banner.subtitle)},
      ${escapeSql(banner.imageUrl)},
      ${escapeSql(banner.link)},
      ${escapeSql(banner.buttonText)},
      ${escapeSql(banner.isActive !== false)},
      ${escapeSql(index)},
      ${escapeSql(banner.createdAt || new Date())},
      ${escapeSql(banner.updatedAt || new Date())}
    );\n`;
    sqlOutput += sql;
  });

  console.log(`✅ Migrated ${banners.length} banners\n`);
}

sqlOutput += `\nSET FOREIGN_KEY_CHECKS=1;\n`;

// Write to file
fs.writeFileSync(OUTPUT_FILE, sqlOutput);

console.log('✨ Migration complete!\n');
console.log(`📄 SQL file generated: ${OUTPUT_FILE}`);
console.log(`📊 Summary:`);
console.log(`   - Users: ${users.length}`);
console.log(`   - Categories: ${categories.length}`);
console.log(`   - Products: ${products.length}`);
console.log(`   - Orders: ${orders.length}`);
console.log(`   - Banners: ${banners.length}`);
console.log(`\n✅ Next steps:`);
console.log(`   1. Import php-backend/database/schema.sql into MySQL`);
console.log(`   2. Import ${OUTPUT_FILE} into MySQL`);
console.log(`   3. Configure php-backend/.env`);
console.log(`   4. Test PHP API`);
console.log(`   5. Update React frontend API URL\n`);
