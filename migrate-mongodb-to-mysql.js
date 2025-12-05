/**
 * MongoDB to MySQL Migration Script
 *
 * This script exports all data from MongoDB and generates SQL INSERT statements
 * for importing into MySQL.
 *
 * Usage:
 * 1. Make sure your MongoDB is running
 * 2. Update MongoDB connection string below
 * 3. Run: node migrate-mongodb-to-mysql.js
 * 4. Import generated SQL file into MySQL
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Connection String - Your actual database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fireworkshub';

// Output SQL file
const OUTPUT_FILE = path.join(__dirname, 'migrated-data.sql');

// Connect to MongoDB
console.log('🔄 Connecting to MongoDB...');
await mongoose.connect(MONGODB_URI);
console.log('✅ Connected to MongoDB\n');

// Import models
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
const Banner = mongoose.model('Banner', new mongoose.Schema({}, { strict: false }));
const Coupon = mongoose.model('Coupon', new mongoose.Schema({}, { strict: false }));

// Helper function to escape SQL strings
function escapeSql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Initialize SQL output
let sqlOutput = `-- MongoDB to MySQL Migration Data
-- Generated: ${new Date().toISOString()}
--
-- Instructions:
-- 1. First import schema.sql to create tables
-- 2. Then import this file to populate data
--

SET FOREIGN_KEY_CHECKS=0;

`;

console.log('📊 Starting data migration...\n');

// ============================================================
// MIGRATE USERS
// ============================================================
console.log('👥 Migrating Users...');
const users = await User.find({});
sqlOutput += `\n-- ============================================================\n`;
sqlOutput += `-- USERS (${users.length} records)\n`;
sqlOutput += `-- ============================================================\n`;

const userIdMap = new Map(); // Map MongoDB IDs to MySQL IDs

users.forEach((user, index) => {
  const mysqlId = index + 1;
  userIdMap.set(user._id.toString(), mysqlId);

  const sql = `INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, login_attempts, newsletter, marketing,
    notifications_email, notifications_sms, notifications_push, currency, language,
    total_orders, total_spent, last_order_date, wishlist_count, review_count,
    google_id, google_email, facebook_id, facebook_email, created_at, updated_at
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
    ${escapeSql(user.loginAttempts?.count || 0)},
    ${escapeSql(user.preferences?.newsletter !== false)},
    ${escapeSql(user.preferences?.marketing || false)},
    ${escapeSql(user.preferences?.notifications?.email !== false)},
    ${escapeSql(user.preferences?.notifications?.sms || false)},
    ${escapeSql(user.preferences?.notifications?.push !== false)},
    ${escapeSql(user.preferences?.currency || 'INR')},
    ${escapeSql(user.preferences?.language || 'en')},
    ${escapeSql(user.statistics?.totalOrders || 0)},
    ${escapeSql(user.statistics?.totalSpent || 0)},
    ${escapeSql(user.statistics?.lastOrderDate)},
    ${escapeSql(user.statistics?.wishlistCount || 0)},
    ${escapeSql(user.statistics?.reviewCount || 0)},
    ${escapeSql(user.socialLogin?.google?.id)},
    ${escapeSql(user.socialLogin?.google?.email)},
    ${escapeSql(user.socialLogin?.facebook?.id)},
    ${escapeSql(user.socialLogin?.facebook?.email)},
    ${escapeSql(user.createdAt)},
    ${escapeSql(user.updatedAt)}
  );\n`;

  sqlOutput += sql;
});

console.log(`✅ Migrated ${users.length} users\n`);

// ============================================================
// MIGRATE ADDRESSES
// ============================================================
console.log('📍 Migrating Addresses...');
let addressCount = 0;
users.forEach((user) => {
  if (user.addresses && user.addresses.length > 0) {
    const userId = userIdMap.get(user._id.toString());
    user.addresses.forEach((address) => {
      addressCount++;
      const sql = `INSERT INTO addresses (
        user_id, type, address, city, state, postal_code, country, is_default, created_at, updated_at
      ) VALUES (
        ${userId},
        ${escapeSql(address.type || 'home')},
        ${escapeSql(address.address)},
        ${escapeSql(address.city)},
        ${escapeSql(address.state)},
        ${escapeSql(address.postalCode)},
        ${escapeSql(address.country || 'India')},
        ${escapeSql(address.isDefault || false)},
        NOW(),
        NOW()
      );\n`;
      sqlOutput += sql;
    });
  }
});
console.log(`✅ Migrated ${addressCount} addresses\n`);

// ============================================================
// MIGRATE CATEGORIES
// ============================================================
console.log('📂 Migrating Categories...');
const categories = await Category.find({});
sqlOutput += `\n-- ============================================================\n`;
sqlOutput += `-- CATEGORIES (${categories.length} records)\n`;
sqlOutput += `-- ============================================================\n`;

const categoryIdMap = new Map();

categories.forEach((category, index) => {
  const mysqlId = index + 1;
  categoryIdMap.set(category._id.toString(), mysqlId);

  const sql = `INSERT INTO categories (
    id, name, slug, description, image, icon, parent_id, level,
    is_active, featured, sort_order, seo_title, seo_description,
    seo_keywords, product_count, created_at, updated_at
  ) VALUES (
    ${mysqlId},
    ${escapeSql(category.name)},
    ${escapeSql(category.slug)},
    ${escapeSql(category.description)},
    ${escapeSql(category.image)},
    ${escapeSql(category.icon || '📦')},
    NULL,
    ${escapeSql(category.level || 0)},
    ${escapeSql(category.isActive !== false)},
    ${escapeSql(category.featured || false)},
    ${escapeSql(category.sortOrder || 0)},
    ${escapeSql(category.seoTitle)},
    ${escapeSql(category.seoDescription)},
    ${escapeSql(category.seoKeywords ? JSON.stringify(category.seoKeywords) : null)},
    ${escapeSql(category.productCount || 0)},
    ${escapeSql(category.createdAt)},
    ${escapeSql(category.updatedAt)}
  );\n`;

  sqlOutput += sql;
});

console.log(`✅ Migrated ${categories.length} categories\n`);

// ============================================================
// MIGRATE PRODUCTS
// ============================================================
console.log('📦 Migrating Products...');
const products = await Product.find({});
sqlOutput += `\n-- ============================================================\n`;
sqlOutput += `-- PRODUCTS (${products.length} records)\n`;
sqlOutput += `-- ============================================================\n`;

const productIdMap = new Map();

products.forEach((product, index) => {
  const mysqlId = index + 1;
  productIdMap.set(product._id.toString(), mysqlId);

  const categoryId = categoryIdMap.get(product.category?.toString());

  const sql = `INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, category_id, cake_flavor, product_types, is_new, brand, stock,
    images, thumbnail, specifications, tags, featured, is_active, sku,
    weight, has_weight_options, weight_options, length, width, height,
    average_rating, num_reviews, sold_count, view_count,
    seo_title, seo_description, seo_keywords, created_at, updated_at
  ) VALUES (
    ${mysqlId},
    ${escapeSql(product.name)},
    ${escapeSql(product.slug || product.name.toLowerCase().replace(/\s+/g, '-'))},
    ${escapeSql(product.description)},
    ${escapeSql(product.price)},
    ${escapeSql(product.originalPrice)},
    ${escapeSql(product.discountPercentage || 0)},
    ${escapeSql(product.category)},
    ${categoryId || 'NULL'},
    ${escapeSql(product.cakeFlavor)},
    ${escapeSql(product.productTypes ? JSON.stringify(product.productTypes) : null)},
    ${escapeSql(product.isNew || false)},
    ${escapeSql(product.brand)},
    ${escapeSql(product.stock || 0)},
    ${escapeSql(JSON.stringify(product.images || []))},
    ${escapeSql(product.thumbnail)},
    ${escapeSql(product.specifications ? JSON.stringify(product.specifications) : null)},
    ${escapeSql(product.tags ? JSON.stringify(product.tags) : null)},
    ${escapeSql(product.featured || false)},
    ${escapeSql(product.isActive !== false)},
    ${escapeSql(product.sku)},
    ${escapeSql(product.weight)},
    ${escapeSql(product.hasWeightOptions || false)},
    ${escapeSql(product.weightOptions ? JSON.stringify(product.weightOptions) : null)},
    ${escapeSql(product.dimensions?.length)},
    ${escapeSql(product.dimensions?.width)},
    ${escapeSql(product.dimensions?.height)},
    ${escapeSql(product.averageRating || 0)},
    ${escapeSql(product.numReviews || 0)},
    ${escapeSql(product.soldCount || 0)},
    ${escapeSql(product.viewCount || 0)},
    ${escapeSql(product.seoTitle)},
    ${escapeSql(product.seoDescription)},
    ${escapeSql(product.seoKeywords ? JSON.stringify(product.seoKeywords) : null)},
    ${escapeSql(product.createdAt)},
    ${escapeSql(product.updatedAt)}
  );\n`;

  sqlOutput += sql;

  // Migrate product reviews
  if (product.reviews && product.reviews.length > 0) {
    product.reviews.forEach((review) => {
      const userId = userIdMap.get(review.user?.toString());
      if (userId) {
        const reviewSql = `INSERT INTO reviews (product_id, user_id, name, rating, comment, created_at) VALUES (
          ${mysqlId},
          ${userId},
          ${escapeSql(review.name)},
          ${escapeSql(review.rating)},
          ${escapeSql(review.comment)},
          ${escapeSql(review.createdAt || new Date())}
        );\n`;
        sqlOutput += reviewSql;
      }
    });
  }
});

console.log(`✅ Migrated ${products.length} products\n`);

// ============================================================
// MIGRATE ORDERS
// ============================================================
console.log('🛒 Migrating Orders...');
const orders = await Order.find({});
sqlOutput += `\n-- ============================================================\n`;
sqlOutput += `-- ORDERS (${orders.length} records)\n`;
sqlOutput += `-- ============================================================\n`;

const orderIdMap = new Map();

for (const [index, order] of orders.entries()) {
  const mysqlId = index + 1;
  orderIdMap.set(order._id.toString(), mysqlId);

  const userId = userIdMap.get(order.user?.toString());
  if (!userId) continue;

  const sql = `INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, discount_amount, total_price, currency,
    coupon_code, coupon_discount, coupon_type,
    customer_notes, admin_notes, estimated_delivery, actual_delivery,
    shipping_method, shipping_carrier, shipping_tracking_url,
    is_gift, gift_message, is_cancelled, cancellation_reason,
    cancellation_date, refund_amount, refund_reason, refund_date,
    created_at, updated_at
  ) VALUES (
    ${mysqlId},
    ${userId},
    ${escapeSql(order.trackingNumber || `TRK${Date.now()}`)},
    ${escapeSql(order.status || 'pending')},
    ${escapeSql(order.itemsPrice || 0)},
    ${escapeSql(order.taxPrice || 0)},
    ${escapeSql(order.shippingPrice || 0)},
    ${escapeSql(order.discountAmount || 0)},
    ${escapeSql(order.totalPrice || 0)},
    ${escapeSql(order.currency || 'INR')},
    ${escapeSql(order.coupon?.code)},
    ${escapeSql(order.coupon?.discount)},
    ${escapeSql(order.coupon?.type)},
    ${escapeSql(order.notes?.customer)},
    ${escapeSql(order.notes?.admin)},
    ${escapeSql(order.estimatedDelivery)},
    ${escapeSql(order.actualDelivery)},
    ${escapeSql(order.shippingMethod || 'standard')},
    ${escapeSql(order.shippingCarrier)},
    ${escapeSql(order.shippingTrackingUrl)},
    ${escapeSql(order.isGift || false)},
    ${escapeSql(order.giftMessage)},
    ${escapeSql(order.isCancelled || false)},
    ${escapeSql(order.cancellationReason)},
    ${escapeSql(order.cancellationDate)},
    ${escapeSql(order.refundAmount || 0)},
    ${escapeSql(order.refundReason)},
    ${escapeSql(order.refundDate)},
    ${escapeSql(order.createdAt)},
    ${escapeSql(order.updatedAt)}
  );\n`;

  sqlOutput += sql;

  // Order Items
  if (order.orderItems && order.orderItems.length > 0) {
    order.orderItems.forEach((item) => {
      const productId = productIdMap.get(item.product?.toString());
      if (productId) {
        const itemSql = `INSERT INTO order_items (
          order_id, product_id, name, quantity, price, original_price,
          discount, image, sku, weight, length, width, height
        ) VALUES (
          ${mysqlId},
          ${productId},
          ${escapeSql(item.name)},
          ${escapeSql(item.quantity)},
          ${escapeSql(item.price)},
          ${escapeSql(item.originalPrice)},
          ${escapeSql(item.discount || 0)},
          ${escapeSql(item.image)},
          ${escapeSql(item.sku)},
          ${escapeSql(item.weight)},
          ${escapeSql(item.dimensions?.length)},
          ${escapeSql(item.dimensions?.width)},
          ${escapeSql(item.dimensions?.height)}
        );\n`;
        sqlOutput += itemSql;
      }
    });
  }

  // Shipping Address
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    const addrSql = `INSERT INTO shipping_addresses (
      order_id, name, phone, address, city, state, postal_code, country
    ) VALUES (
      ${mysqlId},
      ${escapeSql(addr.name)},
      ${escapeSql(addr.phone)},
      ${escapeSql(addr.address)},
      ${escapeSql(addr.city)},
      ${escapeSql(addr.state)},
      ${escapeSql(addr.postalCode)},
      ${escapeSql(addr.country || 'India')}
    );\n`;
    sqlOutput += addrSql;
  }

  // Payment Info
  if (order.paymentInfo) {
    const payment = order.paymentInfo;
    const paymentSql = `INSERT INTO payment_info (
      order_id, payment_id, status, method, transaction_id, payment_date,
      refund_amount, refund_reason, refund_date
    ) VALUES (
      ${mysqlId},
      ${escapeSql(payment.id)},
      ${escapeSql(payment.status || 'pending')},
      ${escapeSql(payment.method || 'cod')},
      ${escapeSql(payment.transactionId)},
      ${escapeSql(payment.paymentDate)},
      ${escapeSql(payment.refundAmount || 0)},
      ${escapeSql(payment.refundReason)},
      ${escapeSql(payment.refundDate)}
    );\n`;
    sqlOutput += paymentSql;
  }

  // Order Status History
  if (order.statusHistory && order.statusHistory.length > 0) {
    order.statusHistory.forEach((history) => {
      const historySql = `INSERT INTO order_status_history (
        order_id, status, note, created_at
      ) VALUES (
        ${mysqlId},
        ${escapeSql(history.status)},
        ${escapeSql(history.note)},
        ${escapeSql(history.timestamp || new Date())}
      );\n`;
      sqlOutput += historySql;
    });
  }
}

console.log(`✅ Migrated ${orders.length} orders\n`);

// ============================================================
// MIGRATE BANNERS
// ============================================================
console.log('🎨 Migrating Banners...');
const banners = await Banner.find({});
if (banners.length > 0) {
  sqlOutput += `\n-- ============================================================\n`;
  sqlOutput += `-- BANNERS (${banners.length} records)\n`;
  sqlOutput += `-- ============================================================\n`;

  banners.forEach((banner, index) => {
    const sql = `INSERT INTO banners (
      title, subtitle, image_url, mobile_image_url, desktop_image_url,
      link, button_text, is_active, sort_order, start_date, end_date,
      created_at, updated_at
    ) VALUES (
      ${escapeSql(banner.title)},
      ${escapeSql(banner.subtitle)},
      ${escapeSql(banner.imageUrl)},
      ${escapeSql(banner.mobileImageUrl)},
      ${escapeSql(banner.desktopImageUrl)},
      ${escapeSql(banner.link)},
      ${escapeSql(banner.buttonText)},
      ${escapeSql(banner.isActive !== false)},
      ${escapeSql(index)},
      ${escapeSql(banner.startDate)},
      ${escapeSql(banner.endDate)},
      ${escapeSql(banner.createdAt)},
      ${escapeSql(banner.updatedAt)}
    );\n`;
    sqlOutput += sql;
  });

  console.log(`✅ Migrated ${banners.length} banners\n`);
}

// ============================================================
// MIGRATE COUPONS
// ============================================================
console.log('🎟️  Migrating Coupons...');
const coupons = await Coupon.find({});
if (coupons.length > 0) {
  sqlOutput += `\n-- ============================================================\n`;
  sqlOutput += `-- COUPONS (${coupons.length} records)\n`;
  sqlOutput += `-- ============================================================\n`;

  coupons.forEach((coupon) => {
    const sql = `INSERT INTO coupons (
      code, description, type, value, min_order_amount, max_discount,
      usage_limit, usage_count, user_limit, is_active,
      start_date, end_date, created_at, updated_at
    ) VALUES (
      ${escapeSql(coupon.code)},
      ${escapeSql(coupon.description)},
      ${escapeSql(coupon.discountType || 'percentage')},
      ${escapeSql(coupon.discount)},
      ${escapeSql(coupon.minPurchase || 0)},
      ${escapeSql(coupon.maxDiscount)},
      ${escapeSql(coupon.usageLimit)},
      ${escapeSql(coupon.usedCount || 0)},
      ${escapeSql(coupon.userLimit)},
      ${escapeSql(coupon.isActive !== false)},
      ${escapeSql(coupon.startDate)},
      ${escapeSql(coupon.endDate)},
      ${escapeSql(coupon.createdAt)},
      ${escapeSql(coupon.updatedAt)}
    );\n`;
    sqlOutput += sql;
  });

  console.log(`✅ Migrated ${coupons.length} coupons\n`);
}

sqlOutput += `\nSET FOREIGN_KEY_CHECKS=1;\n`;

// Write to file
fs.writeFileSync(OUTPUT_FILE, sqlOutput);

console.log('✨ Migration complete!\n');
console.log(`📄 SQL file generated: ${OUTPUT_FILE}`);
console.log(`📊 Summary:`);
console.log(`   - Users: ${users.length}`);
console.log(`   - Addresses: ${addressCount}`);
console.log(`   - Categories: ${categories.length}`);
console.log(`   - Products: ${products.length}`);
console.log(`   - Orders: ${orders.length}`);
console.log(`   - Banners: ${banners.length}`);
console.log(`   - Coupons: ${coupons.length}`);
console.log(`\n✅ Next steps:`);
console.log(`   1. Import schema.sql into MySQL`);
console.log(`   2. Import ${OUTPUT_FILE} into MySQL`);
console.log(`   3. Verify data in MySQL`);
console.log(`   4. Update React frontend API URL`);

// Close MongoDB connection
await mongoose.connection.close();
console.log('\n👋 MongoDB connection closed');
