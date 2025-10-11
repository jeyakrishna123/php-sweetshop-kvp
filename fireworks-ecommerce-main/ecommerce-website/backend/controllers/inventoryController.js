import db from '../database.js';

// Get comprehensive inventory data
export const getInventory = async (req, res) => {
  try {
    console.log('📦 Fetching comprehensive inventory data...');
    
    const inventory = db.getInventory();
    const summary = db.getInventorySummary();
    const lowStockProducts = db.getLowStockProducts();
    const outOfStockProducts = db.getOutOfStockProducts();
    
    console.log('📊 Inventory Summary:', {
      totalProducts: summary.totalProducts,
      inStock: summary.inStock,
      lowStock: summary.lowStock,
      outOfStock: summary.outOfStock,
      totalValue: summary.totalValue,
      totalRevenue: summary.totalRevenue
    });
    
    res.json({
      success: true,
      data: {
        inventory,
        summary,
        lowStockProducts,
        outOfStockProducts
      }
    });
  } catch (error) {
    console.error('❌ Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory data',
      error: error.message
    });
  }
};

// Update product stock
export const updateStock = async (req, res) => {
  try {
    const { productId, quantity, operation = 'set' } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }
    
    console.log(`📦 Updating stock for product ${productId}:`, { quantity, operation });
    
    const updatedProduct = db.updateProductStock(productId, quantity, operation);
    
    console.log('✅ Stock updated successfully:', {
      productId: updatedProduct._id,
      name: updatedProduct.name,
      newStock: updatedProduct.stock
    });
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('❌ Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Bulk update stock
export const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }
    
    console.log(`📦 Bulk updating stock for ${updates.length} products...`);
    
    const updatedProducts = db.bulkUpdateStock(updates);
    
    console.log('✅ Bulk stock update completed:', {
      updatedCount: updatedProducts.length,
      totalUpdates: updates.length
    });
    
    res.json({
      success: true,
      message: 'Bulk stock update completed successfully',
      updatedProducts
    });
  } catch (error) {
    console.error('❌ Error bulk updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update stock',
      error: error.message
    });
  }
};

// Get inventory summary
export const getInventorySummary = async (req, res) => {
  try {
    console.log('📊 Fetching inventory summary...');
    
    const summary = db.getInventorySummary();
    
    console.log('📈 Inventory Summary:', summary);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('❌ Error fetching inventory summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory summary',
      error: error.message
    });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    console.log('⚠️ Fetching low stock products...');
    
    const lowStockProducts = db.getLowStockProducts();
    
    console.log(`📉 Found ${lowStockProducts.length} low stock products`);
    
    res.json({
      success: true,
      data: lowStockProducts
    });
  } catch (error) {
    console.error('❌ Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: error.message
    });
  }
};

// Get out of stock products
export const getOutOfStockProducts = async (req, res) => {
  try {
    console.log('🚫 Fetching out of stock products...');
    
    const outOfStockProducts = db.getOutOfStockProducts();
    
    console.log(`❌ Found ${outOfStockProducts.length} out of stock products`);
    
    res.json({
      success: true,
      data: outOfStockProducts
    });
  } catch (error) {
    console.error('❌ Error fetching out of stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch out of stock products',
      error: error.message
    });
  }
};

// Get inventory analytics
export const getInventoryAnalytics = async (req, res) => {
  try {
    console.log('📊 Fetching inventory analytics...');
    
    const inventory = db.getInventory();
    const summary = db.getInventorySummary();
    
    // Calculate additional analytics
    const topSellingProducts = inventory
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);
    
    const topRevenueProducts = inventory
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    const categoryBreakdown = inventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          count: 0,
          totalStock: 0,
          totalValue: 0,
          totalRevenue: 0
        };
      }
      acc[item.category].count++;
      acc[item.category].totalStock += item.stock;
      acc[item.category].totalValue += item.stock * item.cost;
      acc[item.category].totalRevenue += item.revenue;
      return acc;
    }, {});
    
    const stockTrends = inventory.map(item => ({
      name: item.name,
      currentStock: item.stock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      stockRatio: item.maxStock > 0 ? (item.stock / item.maxStock) * 100 : 0
    }));
    
    const analytics = {
      summary,
      topSellingProducts,
      topRevenueProducts,
      categoryBreakdown,
      stockTrends,
      averageStockValue: summary.totalProducts > 0 ? summary.totalValue / summary.totalProducts : 0,
      averageRevenuePerProduct: summary.totalProducts > 0 ? summary.totalRevenue / summary.totalProducts : 0
    };
    
    console.log('📈 Inventory Analytics Generated:', {
      totalProducts: analytics.summary.totalProducts,
      topSellingCount: analytics.topSellingProducts.length,
      categoriesCount: Object.keys(analytics.categoryBreakdown).length
    });
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error fetching inventory analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory analytics',
      error: error.message
    });
  }
};
