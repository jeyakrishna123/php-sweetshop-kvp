import db from '../database.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize AI services
const genAI = process.env.GOOGLE_AI_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// AI-Powered Analytics Controller
export const getAIAnalytics = async (req, res) => {
  try {
    const { type } = req.query;
    
    // Mock AI analytics data - in production, this would connect to ML services
    const aiData = {
      predictions: {
        salesForecast: [
          { month: 'Jan', predicted: 125000, actual: 118000, confidence: 85 },
          { month: 'Feb', predicted: 135000, actual: 142000, confidence: 78 },
          { month: 'Mar', predicted: 145000, actual: null, confidence: 82 },
          { month: 'Apr', predicted: 155000, actual: null, confidence: 79 },
          { month: 'May', predicted: 165000, actual: null, confidence: 76 }
        ],
        customerGrowth: {
          current: 1250,
          predicted: 1450,
          growthRate: 16.0,
          confidence: 88
        },
        inventoryNeeds: [
          { product: 'Diwali Crackers', currentStock: 150, predictedDemand: 280, recommendation: 'Increase Stock' },
          { product: 'Sparklers', currentStock: 200, predictedDemand: 180, recommendation: 'Maintain' },
          { product: 'Rockets', currentStock: 80, predictedDemand: 120, recommendation: 'Increase Stock' }
        ]
      },
      anomalies: {
        detected: [
          { type: 'Sales Spike', date: '2024-01-15', value: 250000, normal: 120000, severity: 'High' },
          { type: 'Low Inventory', date: '2024-01-20', value: 5, normal: 50, severity: 'Medium' },
          { type: 'Customer Churn', date: '2024-01-25', value: 45, normal: 15, severity: 'High' }
        ],
        patterns: [
          { pattern: 'Weekend Sales Boost', frequency: 'Every Saturday', impact: 'Positive' },
          { pattern: 'Mid-month Dip', frequency: '15th of each month', impact: 'Negative' }
        ]
      },
      recommendations: {
        products: [
          { product: 'Premium Fireworks', reason: 'High margin, growing demand', priority: 'High' },
          { product: 'Eco-friendly Crackers', reason: 'Trending category', priority: 'Medium' }
        ],
        marketing: [
          { strategy: 'Email Campaign', reason: 'High open rates in evening', priority: 'High' },
          { strategy: 'Social Media Ads', reason: 'Young audience engagement', priority: 'Medium' }
        ],
        operations: [
          { action: 'Increase Staff', reason: 'Peak season approaching', priority: 'High' },
          { action: 'Optimize Inventory', reason: 'Reduce storage costs', priority: 'Medium' }
        ]
      },
      sentiment: {
        overall: { positive: 78, neutral: 15, negative: 7 },
        trends: [
          { date: '2024-01-01', positive: 75, neutral: 18, negative: 7 },
          { date: '2024-01-08', positive: 78, neutral: 15, negative: 7 },
          { date: '2024-01-15', positive: 82, neutral: 12, negative: 6 },
          { date: '2024-01-22', positive: 78, neutral: 15, negative: 7 }
        ],
        keywords: [
          { word: 'quality', sentiment: 'positive', count: 45 },
          { word: 'delivery', sentiment: 'positive', count: 38 },
          { word: 'price', sentiment: 'neutral', count: 32 },
          { word: 'slow', sentiment: 'negative', count: 12 }
        ]
      },
      forecasting: {
        demand: [
          { product: 'Diwali Crackers', current: 150, forecast: [180, 220, 280, 320, 250] },
          { product: 'Sparklers', current: 200, forecast: [190, 185, 180, 175, 170] },
          { product: 'Rockets', current: 80, forecast: [95, 110, 125, 140, 120] }
        ],
        seasonal: {
          peak: 'October-November',
          low: 'June-August',
          growth: 25.5
        }
      },
      optimization: {
        pricing: [
          { product: 'Premium Crackers', current: 500, optimal: 550, impact: '+12% revenue' },
          { product: 'Basic Sparklers', current: 100, optimal: 95, impact: '+8% volume' }
        ],
        recommendations: [
          'Bundle popular items for 15% discount',
          'Dynamic pricing during peak hours',
          'Loyalty program for repeat customers'
        ]
      }
    };

    res.json({
      success: true,
      data: aiData[type] || aiData.predictions
    });
  } catch (error) {
    console.error('Error fetching AI analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI analytics data'
    });
  }
};

export const getVisualizations = async (req, res) => {
  try {
    const { type } = req.query;
    
    const vizData = {
      heatmap: {
        title: 'Sales Distribution by Region',
        data: [
          { region: 'North', jan: 12000, feb: 15000, mar: 18000, apr: 22000, may: 25000 },
          { region: 'South', jan: 15000, feb: 18000, mar: 21000, apr: 24000, may: 28000 },
          { region: 'East', jan: 10000, feb: 12000, mar: 15000, apr: 18000, may: 20000 },
          { region: 'West', jan: 18000, feb: 22000, mar: 25000, apr: 28000, may: 32000 },
          { region: 'Central', jan: 8000, feb: 10000, mar: 12000, apr: 15000, may: 18000 }
        ]
      },
      sankey: {
        title: 'Customer Journey Flow',
        nodes: [
          { name: 'Website Visit' },
          { name: 'Product View' },
          { name: 'Add to Cart' },
          { name: 'Checkout' },
          { name: 'Purchase' },
          { name: 'Abandon' }
        ],
        links: [
          { source: 0, target: 1, value: 10000 },
          { source: 1, target: 2, value: 3000 },
          { source: 2, target: 3, value: 1500 },
          { source: 3, target: 4, value: 800 },
          { source: 3, target: 5, value: 700 },
          { source: 2, target: 5, value: 1500 }
        ]
      },
      treemap: {
        title: 'Product Category Performance',
        data: [
          { name: 'Diwali Crackers', value: 45000, children: [
            { name: 'Premium Crackers', value: 25000 },
            { name: 'Standard Crackers', value: 20000 }
          ]},
          { name: 'Sparklers', value: 30000, children: [
            { name: 'Color Sparklers', value: 18000 },
            { name: 'Gold Sparklers', value: 12000 }
          ]},
          { name: 'Rockets', value: 25000, children: [
            { name: 'Sound Rockets', value: 15000 },
            { name: 'Light Rockets', value: 10000 }
          ]},
          { name: 'Fountains', value: 20000, children: [
            { name: 'Ground Fountains', value: 12000 },
            { name: 'Aerial Fountains', value: 8000 }
          ]}
        ]
      }
    };

    res.json({
      success: true,
      data: vizData[type] || vizData.heatmap
    });
  } catch (error) {
    console.error('Error fetching visualization data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visualization data'
    });
  }
};

export const getBIAnalysis = async (req, res) => {
  try {
    const { type } = req.query;
    
    const biData = {
      cohort: {
        title: 'Customer Cohort Analysis',
        cohorts: [
          { cohort: 'Jan 2024', customers: 100, month1: 85, month2: 78, month3: 72, month4: 68, month5: 65, month6: 62 },
          { cohort: 'Feb 2024', customers: 120, month1: 0, month2: 95, month3: 88, month4: 82, month5: 78, month6: 75 },
          { cohort: 'Mar 2024', customers: 150, month1: 0, month2: 0, month3: 120, month4: 110, month5: 105, month6: 100 },
          { cohort: 'Apr 2024', customers: 180, month1: 0, month2: 0, month3: 0, month4: 145, month5: 135, month6: 130 },
          { cohort: 'May 2024', customers: 200, month1: 0, month2: 0, month3: 0, month4: 0, month5: 160, month6: 150 },
          { cohort: 'Jun 2024', customers: 220, month1: 0, month2: 0, month3: 0, month4: 0, month5: 0, month6: 175 }
        ],
        retention: {
          average: 78.5,
          trend: 'increasing',
          insights: ['New customer retention improved by 15%', 'Premium customers show 90% retention']
        }
      },
      funnel: {
        title: 'Sales Funnel Analysis',
        stages: [
          { stage: 'Website Visit', visitors: 10000, conversion: 100 },
          { stage: 'Product View', visitors: 3000, conversion: 30 },
          { stage: 'Add to Cart', visitors: 1200, conversion: 12 },
          { stage: 'Checkout', visitors: 600, conversion: 6 },
          { stage: 'Purchase', visitors: 480, conversion: 4.8 }
        ],
        dropoff: [
          { stage: 'Visit to View', rate: 70, reason: 'Poor product presentation' },
          { stage: 'View to Cart', rate: 60, reason: 'High prices' },
          { stage: 'Cart to Checkout', rate: 50, reason: 'Complex checkout process' },
          { stage: 'Checkout to Purchase', rate: 20, reason: 'Payment issues' }
        ]
      },
      abtesting: {
        title: 'A/B Testing Results',
        tests: [
          {
            name: 'Homepage Banner Test',
            variantA: { name: 'Original', conversions: 1200, visitors: 5000, rate: 24 },
            variantB: { name: 'New Design', conversions: 1500, visitors: 5000, rate: 30 },
            winner: 'B',
            confidence: 95,
            improvement: 25
          }
        ]
      }
    };

    res.json({
      success: true,
      data: biData[type] || biData.cohort
    });
  } catch (error) {
    console.error('Error fetching BI analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BI analysis data'
    });
  }
};

// Advanced AI Features

// AI-Powered Product Recommendations
export const getAIRecommendations = async (req, res) => {
  try {
    const { userId, productId, type = 'similar' } = req.query;
    
    // Get product and user data for analysis
    const products = db.getAllProducts();
    const orders = db.getAllOrders();
    const users = db.getAllUsers();
    
    let recommendations = [];
    
    if (type === 'similar' && productId) {
      // Collaborative filtering for similar products
      recommendations = await generateSimilarProducts(productId, products, orders);
    } else if (type === 'personalized' && userId) {
      // Personalized recommendations based on user behavior
      recommendations = await generatePersonalizedRecommendations(userId, products, orders, users);
    } else if (type === 'trending') {
      // Trending products based on recent sales
      recommendations = await generateTrendingProducts(products, orders);
    } else if (type === 'cross_sell') {
      // Cross-sell recommendations
      recommendations = await generateCrossSellRecommendations(productId, orders);
    }
    
    res.json({
      success: true,
      data: {
        type,
        recommendations,
        generated_at: new Date().toISOString(),
        confidence: calculateRecommendationConfidence(recommendations)
      }
    });
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations'
    });
  }
};

// AI Customer Behavior Analysis
export const getCustomerBehaviorAnalysis = async (req, res) => {
  try {
    const { customerId, analysisType = 'comprehensive' } = req.query;
    
    const users = db.getAllUsers();
    const orders = db.getAllOrders();
    const products = db.getAllProducts();
    
    const analysis = await analyzeCustomerBehavior(customerId, users, orders, products, analysisType);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing customer behavior:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze customer behavior'
    });
  }
};

// AI Inventory Management
export const getInventoryOptimization = async (req, res) => {
  try {
    const products = db.getAllProducts();
    const orders = db.getAllOrders();
    
    const optimization = await optimizeInventory(products, orders);
    
    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    console.error('Error optimizing inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize inventory'
    });
  }
};

// AI Fraud Detection
export const getFraudAnalysis = async (req, res) => {
  try {
    const { orderId, userId, transactionData } = req.query;
    
    const orders = db.getAllOrders();
    const users = db.getAllUsers();
    
    const fraudAnalysis = await analyzeFraudRisk(orderId, userId, transactionData, orders, users);
    
    res.json({
      success: true,
      data: fraudAnalysis
    });
  } catch (error) {
    console.error('Error analyzing fraud risk:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze fraud risk'
    });
  }
};

// AI Chatbot for Admin Assistance
export const getAIChatResponse = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const response = await generateChatResponse(message, context);
    
    res.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
        context: 'admin_assistance'
      }
    });
  } catch (error) {
    console.error('Error generating chat response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate response'
    });
  }
};

// AI-Powered Analytics Insights
export const getSmartInsights = async (req, res) => {
  try {
    const { period = '30d', category = 'all' } = req.query;
    
    const orders = db.getAllOrders();
    const products = db.getAllProducts();
    const users = db.getAllUsers();
    
    const insights = await generateSmartInsights(orders, products, users, period, category);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error generating smart insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights'
    });
  }
};

// Price Optimization AI
export const getPriceOptimization = async (req, res) => {
  try {
    const { productId, strategy = 'profit_maximize' } = req.query;
    
    const products = db.getAllProducts();
    const orders = db.getAllOrders();
    
    const optimization = await optimizePricing(productId, strategy, products, orders);
    
    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    console.error('Error optimizing pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize pricing'
    });
  }
};

// Helper Functions

async function generateSimilarProducts(productId, products, orders) {
  const targetProduct = products.find(p => p._id === productId);
  if (!targetProduct) return [];
  
  // Simple similarity algorithm based on category, price range, and co-purchases
  const similar = products
    .filter(p => p._id !== productId && p.category === targetProduct.category)
    .map(p => {
      const priceSimScore = 1 - Math.abs(p.price - targetProduct.price) / Math.max(p.price, targetProduct.price);
      const categoryScore = p.category === targetProduct.category ? 1 : 0;
      const coAurchaseScore = calculateCoPurchaseScore(productId, p._id, orders);
      
      return {
        ...p,
        similarity_score: (priceSimScore * 0.3 + categoryScore * 0.4 + coAurchaseScore * 0.3) * 100,
        reason: `Similar ${targetProduct.category} with comparable price`
      };
    })
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, 6);
    
  return similar;
}

async function generatePersonalizedRecommendations(userId, products, orders, users) {
  const userOrders = orders.filter(o => o.user === userId);
  const purchasedProducts = userOrders.flatMap(o => o.orderItems.map(item => item._id));
  const userCategories = new Set();
  
  userOrders.forEach(order => {
    order.orderItems.forEach(item => {
      const product = products.find(p => p._id === item._id);
      if (product) userCategories.add(product.category);
    });
  });
  
  const recommendations = products
    .filter(p => !purchasedProducts.includes(p._id))
    .map(p => {
      let score = 0;
      
      // Category preference score
      if (userCategories.has(p.category)) score += 40;
      
      // Price range preference
      const avgOrderValue = userOrders.reduce((sum, o) => sum + o.totalPrice, 0) / userOrders.length || 0;
      if (p.price <= avgOrderValue * 1.2) score += 30;
      
      // Popularity score
      const productOrders = orders.filter(o => o.orderItems.some(item => item._id === p._id));
      score += Math.min(productOrders.length * 2, 30);
      
      return {
        ...p,
        recommendation_score: score,
        reason: generateRecommendationReason(p, userCategories, avgOrderValue)
      };
    })
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, 8);
    
  return recommendations;
}

async function generateTrendingProducts(products, orders) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentOrders = orders.filter(o => new Date(o.createdAt) >= last30Days);
  const productSales = {};
  
  recentOrders.forEach(order => {
    order.orderItems.forEach(item => {
      productSales[item._id] = (productSales[item._id] || 0) + item.quantity;
    });
  });
  
  const trending = Object.entries(productSales)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([productId, sales]) => {
      const product = products.find(p => p._id === productId);
      return {
        ...product,
        sales_count: sales,
        trending_score: calculateTrendingScore(sales, orders.length),
        reason: `${sales} units sold in last 30 days`
      };
    });
    
  return trending;
}

async function generateCrossSellRecommendations(productId, orders) {
  const productOrders = orders.filter(o => o.orderItems.some(item => item._id === productId));
  const coProducts = {};
  
  productOrders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item._id !== productId) {
        coProducts[item._id] = (coProducts[item._id] || 0) + 1;
      }
    });
  });
  
  const crossSell = Object.entries(coProducts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([itemId, count]) => ({
      productId: itemId,
      co_purchase_count: count,
      confidence: (count / productOrders.length * 100).toFixed(1),
      reason: `Bought together ${count} times`
    }));
    
  return crossSell;
}

async function analyzeCustomerBehavior(customerId, users, orders, products, analysisType) {
  const customer = users.find(u => u._id === customerId);
  const customerOrders = orders.filter(o => o.user === customerId);
  
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  const analysis = {
    customer_profile: {
      id: customer._id,
      email: customer.email,
      registration_date: customer.createdAt,
      total_orders: customerOrders.length,
      total_spent: customerOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      avg_order_value: customerOrders.length ? 
        (customerOrders.reduce((sum, o) => sum + o.totalPrice, 0) / customerOrders.length).toFixed(2) : 0
    },
    purchase_patterns: analyzePurchasePatterns(customerOrders),
    category_preferences: analyzeCategoryPreferences(customerOrders, products),
    behavioral_segments: classifyCustomerSegment(customer, customerOrders),
    churn_risk: calculateChurnRisk(customerOrders),
    lifetime_value: calculateCustomerLTV(customerOrders),
    recommendations: {
      retention_strategy: generateRetentionStrategy(customerOrders),
      upsell_opportunities: generateUpsellOpportunities(customerOrders, products),
      communication_preference: analyzeCommPreference(customer, customerOrders)
    }
  };
  
  return analysis;
}

async function optimizeInventory(products, orders) {
  const last90Days = new Date();
  last90Days.setDate(last90Days.getDate() - 90);
  const recentOrders = orders.filter(o => new Date(o.createdAt) >= last90Days);
  
  const optimization = {
    stock_alerts: [],
    reorder_recommendations: [],
    slow_moving_items: [],
    fast_moving_items: [],
    seasonal_analysis: [],
    abc_analysis: performABCAnalysis(products, orders)
  };
  
  products.forEach(product => {
    const productSales = recentOrders
      .flatMap(o => o.orderItems)
      .filter(item => item._id === product._id)
      .reduce((sum, item) => sum + item.quantity, 0);
      
    const velocity = productSales / 90; // daily sales velocity
    const daysOfStock = product.stock / Math.max(velocity, 0.1);
    
    // Stock alerts
    if (daysOfStock < 7) {
      optimization.stock_alerts.push({
        product_id: product._id,
        product_name: product.name,
        current_stock: product.stock,
        days_remaining: Math.round(daysOfStock),
        urgency: daysOfStock < 3 ? 'Critical' : 'High'
      });
    }
    
    // Reorder recommendations
    if (daysOfStock < 14 && velocity > 0.5) {
      const suggestedOrder = Math.ceil(velocity * 30); // 30 days supply
      optimization.reorder_recommendations.push({
        product_id: product._id,
        product_name: product.name,
        suggested_quantity: suggestedOrder,
        estimated_cost: suggestedOrder * (product.price * 0.6), // Assuming 60% cost
        priority_score: calculateReorderPriority(velocity, daysOfStock)
      });
    }
    
    // Slow/Fast moving analysis
    if (velocity < 0.1) {
      optimization.slow_moving_items.push({
        product_id: product._id,
        product_name: product.name,
        stock: product.stock,
        velocity: velocity.toFixed(3),
        recommendation: 'Consider promotional pricing or bundling'
      });
    } else if (velocity > 2) {
      optimization.fast_moving_items.push({
        product_id: product._id,
        product_name: product.name,
        velocity: velocity.toFixed(3),
        stock: product.stock,
        recommendation: 'Ensure adequate stock levels'
      });
    }
  });
  
  return optimization;
}

async function analyzeFraudRisk(orderId, userId, transactionData, orders, users) {
  const riskFactors = [];
  let riskScore = 0;
  
  if (orderId) {
    const order = orders.find(o => o._id === orderId);
    if (order) {
      // High order value risk
      const avgOrderValue = orders.reduce((sum, o) => sum + o.totalPrice, 0) / orders.length;
      if (order.totalPrice > avgOrderValue * 3) {
        riskFactors.push('Unusually high order value');
        riskScore += 25;
      }
      
      // Multiple orders in short time
      const userRecentOrders = orders.filter(o => 
        o.user === order.user && 
        new Date(o.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      if (userRecentOrders.length > 3) {
        riskFactors.push('Multiple orders in 24 hours');
        riskScore += 20;
      }
    }
  }
  
  if (userId) {
    const user = users.find(u => u._id === userId);
    const userOrders = orders.filter(o => o.user === userId);
    
    // New user with high-value order
    if (user && userOrders.length === 1 && userOrders[0].totalPrice > 1000) {
      riskFactors.push('New user with high-value first order');
      riskScore += 30;
    }
    
    // Inconsistent order patterns
    if (userOrders.length > 1) {
      const avgOrderValue = userOrders.reduce((sum, o) => sum + o.totalPrice, 0) / userOrders.length;
      const latestOrder = userOrders[userOrders.length - 1];
      if (latestOrder.totalPrice > avgOrderValue * 5) {
        riskFactors.push('Order value significantly higher than usual');
        riskScore += 15;
      }
    }
  }
  
  // Determine risk level
  let riskLevel = 'Low';
  if (riskScore > 50) riskLevel = 'High';
  else if (riskScore > 25) riskLevel = 'Medium';
  
  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    risk_factors: riskFactors,
    recommendations: generateFraudRecommendations(riskLevel, riskFactors),
    timestamp: new Date().toISOString()
  };
}

async function generateChatResponse(message, context) {
  // Simple rule-based responses for admin assistance
  const responses = {
    'sales': 'Here are your current sales metrics: Total sales this month are up 15% compared to last month.',
    'inventory': 'Current inventory status: 5 items are low in stock and need reordering.',
    'customers': 'Customer insights: You have 15% more active customers this month.',
    'orders': 'Recent orders: 23 new orders today, 5 pending fulfillment.',
    'analytics': 'Analytics summary: Conversion rate is 3.2%, average order value is ₹850.',
    'help': 'I can help you with sales data, inventory management, customer insights, order status, and analytics. What would you like to know?'
  };
  
  const lowerMessage = message.toLowerCase();
  
  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  // If using OpenAI or Google AI, generate dynamic response
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: "You are an AI assistant for an e-commerce admin panel. Provide helpful insights about sales, inventory, customers, and business operations."},
          {role: "user", content: message}
        ],
        max_tokens: 150
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }
  
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are an AI assistant for an e-commerce admin panel. User asks: "${message}". Provide a helpful response about sales, inventory, customers, or business operations.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Google AI API error:', error);
    }
  }
  
  return "I'm here to help with your e-commerce business. You can ask me about sales, inventory, customers, orders, or analytics.";
}

async function generateSmartInsights(orders, products, users, period, category) {
  const insights = {
    key_metrics: {
      total_revenue: orders.reduce((sum, o) => sum + o.totalPrice, 0),
      total_orders: orders.length,
      avg_order_value: orders.length ? (orders.reduce((sum, o) => sum + o.totalPrice, 0) / orders.length).toFixed(2) : 0,
      customer_count: users.length
    },
    trends: {
      revenue_growth: calculateRevenueGrowth(orders),
      customer_growth: calculateCustomerGrowth(users),
      product_performance: analyzeProductPerformance(products, orders)
    },
    alerts: {
      low_stock: products.filter(p => (p.stock || 0) < 10).length,
      high_churn_risk: calculateHighChurnCustomers(users, orders),
      underperforming_products: findUnderperformingProducts(products, orders)
    },
    recommendations: {
      marketing: generateMarketingRecommendations(orders, products),
      inventory: generateInventoryRecommendations(products, orders),
      pricing: generatePricingRecommendations(products, orders)
    },
    predictions: {
      next_month_revenue: predictNextMonthRevenue(orders),
      seasonal_trends: analyzeSeasonalTrends(orders),
      customer_lifetime_value: calculateAvgCustomerLTV(users, orders)
    }
  };
  
  return insights;
}

async function optimizePricing(productId, strategy, products, orders) {
  const product = products.find(p => p._id === productId);
  if (!product) {
    throw new Error('Product not found');
  }
  
  const productOrders = orders.filter(o => 
    o.orderItems.some(item => item._id === productId)
  );
  
  const optimization = {
    current_price: product.price,
    sales_history: analyzeProductSales(productId, orders),
    price_elasticity: calculatePriceElasticity(productId, orders),
    competitor_analysis: {
      market_position: 'competitive', // Mock data
      price_range: { min: product.price * 0.8, max: product.price * 1.3 }
    },
    recommendations: []
  };
  
  switch (strategy) {
    case 'profit_maximize':
      optimization.recommendations.push({
        strategy: 'Profit Maximization',
        suggested_price: product.price * 1.15,
        expected_impact: '+12% profit margin',
        risk_level: 'Medium'
      });
      break;
      
    case 'volume_maximize':
      optimization.recommendations.push({
        strategy: 'Volume Maximization',
        suggested_price: product.price * 0.9,
        expected_impact: '+25% sales volume',
        risk_level: 'Low'
      });
      break;
      
    case 'competitive':
      optimization.recommendations.push({
        strategy: 'Competitive Pricing',
        suggested_price: product.price * 0.95,
        expected_impact: 'Match competitor pricing',
        risk_level: 'Low'
      });
      break;
  }
  
  return optimization;
}

// Utility functions
function calculateCoPurchaseScore(productId1, productId2, orders) {
  const coOccurrences = orders.filter(order => 
    order.orderItems.some(item => item._id === productId1) &&
    order.orderItems.some(item => item._id === productId2)
  ).length;
  
  const product1Orders = orders.filter(order => 
    order.orderItems.some(item => item._id === productId1)
  ).length;
  
  return product1Orders > 0 ? coOccurrences / product1Orders : 0;
}

function calculateRecommendationConfidence(recommendations) {
  return recommendations.length > 0 ? 
    Math.min(recommendations.reduce((sum, r) => sum + (r.similarity_score || r.recommendation_score || 50), 0) / recommendations.length, 95) : 0;
}

function generateRecommendationReason(product, userCategories, avgOrderValue) {
  const reasons = [];
  if (userCategories.has(product.category)) reasons.push('matches your interests');
  if (product.price <= avgOrderValue) reasons.push('within your budget');
  if (product.featured) reasons.push('popular choice');
  return reasons.join(', ') || 'recommended for you';
}

function calculateTrendingScore(sales, totalOrders) {
  return Math.min((sales / totalOrders) * 1000, 100);
}

function analyzePurchasePatterns(orders) {
  const patterns = {
    frequency: calculatePurchaseFrequency(orders),
    seasonality: analyzeSeasonality(orders),
    value_trends: analyzeValueTrends(orders),
    category_affinity: analyzeCategoryAffinity(orders)
  };
  return patterns;
}

function analyzeCategoryPreferences(orders, products) {
  const categorySpend = {};
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const product = products.find(p => p._id === item._id);
      if (product) {
        categorySpend[product.category] = (categorySpend[product.category] || 0) + (item.price * item.quantity);
      }
    });
  });
  
  return Object.entries(categorySpend)
    .sort(([,a], [,b]) => b - a)
    .map(([category, spend]) => ({ category, spend }));
}

function classifyCustomerSegment(customer, orders) {
  const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const avgOrderValue = orders.length ? totalSpent / orders.length : 0;
  
  if (totalSpent > 10000 && avgOrderValue > 1000) return 'VIP';
  if (totalSpent > 5000) return 'Loyal';
  if (orders.length > 5) return 'Regular';
  if (orders.length === 1) return 'New';
  return 'Occasional';
}

function calculateChurnRisk(orders) {
  if (orders.length === 0) return 'High';
  
  const lastOrder = new Date(orders[orders.length - 1].createdAt);
  const daysSinceLastOrder = (Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastOrder > 90) return 'High';
  if (daysSinceLastOrder > 30) return 'Medium';
  return 'Low';
}

function calculateCustomerLTV(orders) {
  const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const avgOrderValue = orders.length ? totalSpent / orders.length : 0;
  const frequency = orders.length;
  
  // Simple LTV calculation: avg_order_value * frequency * estimated_lifespan_multiplier
  return (avgOrderValue * frequency * 2.5).toFixed(2);
}

function generateRetentionStrategy(orders) {
  if (orders.length === 0) return 'Welcome series email campaign';
  if (orders.length === 1) return 'Second purchase incentive';
  return 'Loyalty program enrollment';
}

function generateUpsellOpportunities(orders, products) {
  const purchasedCategories = new Set();
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const product = products.find(p => p._id === item._id);
      if (product) purchasedCategories.add(product.category);
    });
  });
  
  const opportunities = [];
  purchasedCategories.forEach(category => {
    const premiumProducts = products.filter(p => 
      p.category === category && p.price > 1000
    );
    if (premiumProducts.length > 0) {
      opportunities.push(`Premium ${category} products`);
    }
  });
  
  return opportunities;
}

function analyzeCommPreference(customer, orders) {
  return orders.length > 3 ? 'Email marketing' : 'SMS notifications';
}

function performABCAnalysis(products, orders) {
  const productRevenue = {};
  
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      productRevenue[item._id] = (productRevenue[item._id] || 0) + (item.price * item.quantity);
    });
  });
  
  const sortedProducts = Object.entries(productRevenue)
    .sort(([,a], [,b]) => b - a);
    
  const totalRevenue = Object.values(productRevenue).reduce((sum, rev) => sum + rev, 0);
  const analysis = { A: [], B: [], C: [] };
  
  let cumulativeRevenue = 0;
  sortedProducts.forEach(([productId, revenue]) => {
    cumulativeRevenue += revenue;
    const percentage = (cumulativeRevenue / totalRevenue) * 100;
    
    if (percentage <= 70) analysis.A.push(productId);
    else if (percentage <= 90) analysis.B.push(productId);
    else analysis.C.push(productId);
  });
  
  return analysis;
}

function calculateReorderPriority(velocity, daysOfStock) {
  const velocityScore = Math.min(velocity * 20, 50);
  const urgencyScore = Math.max(50 - daysOfStock * 2, 0);
  return velocityScore + urgencyScore;
}

function generateFraudRecommendations(riskLevel, riskFactors) {
  const recommendations = [];
  
  if (riskLevel === 'High') {
    recommendations.push('Manual review required');
    recommendations.push('Additional verification needed');
    recommendations.push('Consider payment method validation');
  } else if (riskLevel === 'Medium') {
    recommendations.push('Monitor transaction closely');
    recommendations.push('Send order confirmation email');
  } else {
    recommendations.push('Process normally');
  }
  
  return recommendations;
}

function calculateRevenueGrowth(orders) {
  // Mock calculation - in real implementation, compare with previous period
  return {
    monthly: 15.5,
    quarterly: 28.3,
    yearly: 42.1
  };
}

function calculateCustomerGrowth(users) {
  return {
    new_customers_this_month: 45,
    growth_rate: 12.5,
    churn_rate: 3.2
  };
}

function analyzeProductPerformance(products, orders) {
  const performance = products.slice(0, 5).map(product => ({
    name: product.name,
    sales_trend: Math.random() > 0.5 ? 'increasing' : 'stable',
    revenue_contribution: (Math.random() * 20 + 5).toFixed(1) + '%'
  }));
  
  return performance;
}

function calculateHighChurnCustomers(users, orders) {
  return users.filter(user => {
    const userOrders = orders.filter(o => o.user === user._id);
    if (userOrders.length === 0) return false;
    
    const lastOrder = new Date(userOrders[userOrders.length - 1].createdAt);
    const daysSinceLastOrder = (Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceLastOrder > 60;
  }).length;
}

function findUnderperformingProducts(products, orders) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentOrders = orders.filter(o => new Date(o.createdAt) >= last30Days);
  const soldProductIds = new Set(recentOrders.flatMap(o => o.orderItems.map(item => item._id)));
  
  return products.filter(p => !soldProductIds.has(p._id)).length;
}

function generateMarketingRecommendations(orders, products) {
  return [
    'Launch retargeting campaign for cart abandoners',
    'Create seasonal promotion for top-selling products',
    'Implement email automation for repeat purchases'
  ];
}

function generateInventoryRecommendations(products, orders) {
  return [
    'Restock top 5 selling products',
    'Consider discontinuing slow-moving inventory',
    'Optimize warehouse space allocation'
  ];
}

function generatePricingRecommendations(products, orders) {
  return [
    'Test 5-10% price increase on premium products',
    'Implement dynamic pricing for seasonal items',
    'Bundle complementary products for higher AOV'
  ];
}

function predictNextMonthRevenue(orders) {
  const currentMonthRevenue = orders
    .filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, o) => sum + o.totalPrice, 0);
    
  return (currentMonthRevenue * 1.15).toFixed(2); // 15% growth prediction
}

function analyzeSeasonalTrends(orders) {
  return {
    peak_months: ['October', 'November'],
    low_months: ['June', 'July'],
    seasonal_factor: 2.3
  };
}

function calculateAvgCustomerLTV(users, orders) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  return users.length ? (totalRevenue / users.length).toFixed(2) : 0;
}

function analyzeProductSales(productId, orders) {
  const productOrders = orders.filter(o => 
    o.orderItems.some(item => item._id === productId)
  );
  
  return {
    total_units_sold: productOrders.reduce((sum, o) => {
      const item = o.orderItems.find(item => item._id === productId);
      return sum + (item ? item.quantity : 0);
    }, 0),
    total_revenue: productOrders.reduce((sum, o) => {
      const item = o.orderItems.find(item => item._id === productId);
      return sum + (item ? item.price * item.quantity : 0);
    }, 0),
    orders_count: productOrders.length
  };
}

function calculatePriceElasticity(productId, orders) {
  // Mock calculation - in real implementation, analyze price changes vs demand
  return {
    elasticity_coefficient: -1.2,
    interpretation: 'Price elastic - demand sensitive to price changes'
  };
}

function calculatePurchaseFrequency(orders) {
  if (orders.length < 2) return 'Insufficient data';
  
  const dates = orders.map(o => new Date(o.createdAt)).sort();
  const intervals = [];
  
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
    intervals.push(diff);
  }
  
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return `Every ${Math.round(avgInterval)} days`;
}

function analyzeSeasonality(orders) {
  const monthlyOrders = {};
  orders.forEach(order => {
    const month = new Date(order.createdAt).getMonth();
    monthlyOrders[month] = (monthlyOrders[month] || 0) + 1;
  });
  
  const maxMonth = Object.keys(monthlyOrders).reduce((a, b) => monthlyOrders[a] > monthlyOrders[b] ? a : b);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `Peak in ${monthNames[maxMonth]}`;
}

function analyzeValueTrends(orders) {
  if (orders.length < 2) return 'Insufficient data';
  
  const sortedOrders = orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const firstHalf = sortedOrders.slice(0, Math.floor(orders.length / 2));
  const secondHalf = sortedOrders.slice(Math.floor(orders.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, o) => sum + o.totalPrice, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, o) => sum + o.totalPrice, 0) / secondHalf.length;
  
  const trend = secondHalfAvg > firstHalfAvg ? 'Increasing' : 'Decreasing';
  const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(1);
  
  return `${trend} (${change}%)`;
}

function analyzeCategoryAffinity(orders) {
  const categories = {};
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
  });
  
  return Object.keys(categories).length > 0 ? Object.keys(categories)[0] : 'No preference';
}
