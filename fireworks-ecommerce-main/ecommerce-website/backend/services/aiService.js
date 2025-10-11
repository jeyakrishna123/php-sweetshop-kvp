import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize AI services
const genAI = process.env.GOOGLE_AI_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export class AIService {
  // Machine Learning Models for Predictions
  static async predictSalesForecast(historicalData, period = 6) {
    // Simple linear regression prediction
    const months = historicalData.length;
    if (months < 3) {
      return this.generateMockForecast(period);
    }

    const predictions = [];
    const trend = this.calculateTrend(historicalData);
    const seasonality = this.calculateSeasonality(historicalData);

    for (let i = 1; i <= period; i++) {
      const baseValue = historicalData[months - 1].value;
      const trendValue = baseValue + (trend * i);
      const seasonalAdjustment = seasonality[((months - 1 + i) % 12)];
      const predicted = Math.round(trendValue * seasonalAdjustment);
      
      predictions.push({
        month: this.getMonthName(new Date().getMonth() + i),
        predicted,
        confidence: Math.max(95 - (i * 5), 60) // Decreasing confidence over time
      });
    }

    return predictions;
  }

  static async analyzeCustomerSegments(customers, orders, products) {
    const segments = {
      vip: { customers: [], characteristics: [], value: 0 },
      loyal: { customers: [], characteristics: [], value: 0 },
      regular: { customers: [], characteristics: [], value: 0 },
      at_risk: { customers: [], characteristics: [], value: 0 },
      new: { customers: [], characteristics: [], value: 0 }
    };

    customers.forEach(customer => {
      const customerOrders = orders.filter(o => o.user === customer._id);
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      const avgOrderValue = customerOrders.length ? totalSpent / customerOrders.length : 0;
      const lastOrderDate = customerOrders.length ? 
        new Date(customerOrders[customerOrders.length - 1].createdAt) : null;
      const daysSinceLastOrder = lastOrderDate ? 
        (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24) : Infinity;

      const customerData = {
        ...customer,
        totalSpent,
        orderCount: customerOrders.length,
        avgOrderValue,
        daysSinceLastOrder
      };

      // Segment classification logic
      if (totalSpent > 10000 && avgOrderValue > 1000) {
        segments.vip.customers.push(customerData);
        segments.vip.value += totalSpent;
      } else if (totalSpent > 5000 || customerOrders.length > 8) {
        segments.loyal.customers.push(customerData);
        segments.loyal.value += totalSpent;
      } else if (daysSinceLastOrder > 90 && customerOrders.length > 0) {
        segments.at_risk.customers.push(customerData);
        segments.at_risk.value += totalSpent;
      } else if (customerOrders.length <= 1) {
        segments.new.customers.push(customerData);
        segments.new.value += totalSpent;
      } else {
        segments.regular.customers.push(customerData);
        segments.regular.value += totalSpent;
      }
    });

    // Generate characteristics for each segment
    Object.keys(segments).forEach(segmentKey => {
      const segment = segments[segmentKey];
      if (segment.customers.length > 0) {
        const avgSpent = segment.value / segment.customers.length;
        const avgOrders = segment.customers.reduce((sum, c) => sum + c.orderCount, 0) / segment.customers.length;
        
        segment.characteristics = [
          `Average spend: ₹${avgSpent.toFixed(0)}`,
          `Average orders: ${avgOrders.toFixed(1)}`,
          `Segment size: ${segment.customers.length} customers`
        ];
      }
    });

    return segments;
  }

  static async detectAnomalies(data, metric = 'sales') {
    const anomalies = [];
    const values = data.map(d => d[metric] || d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    const threshold = 2.5; // Standard deviations for anomaly detection

    data.forEach((point, index) => {
      const value = point[metric] || point.value;
      const zScore = Math.abs((value - mean) / stdDev);
      
      if (zScore > threshold) {
        anomalies.push({
          index,
          date: point.date || point.createdAt,
          value,
          expected: mean,
          deviation: ((value - mean) / mean * 100).toFixed(1),
          severity: zScore > 3 ? 'High' : 'Medium',
          type: value > mean ? 'Positive Spike' : 'Negative Drop'
        });
      }
    });

    return anomalies;
  }

  static async generateMarketingInsights(orders, products, customers) {
    const insights = {
      best_performing_channels: await this.analyzeMarketingChannels(orders),
      customer_acquisition_cost: await this.calculateCAC(orders, customers),
      customer_lifetime_value: await this.calculateCLV(orders, customers),
      conversion_funnel: await this.analyzeConversionFunnel(orders, customers),
      seasonal_patterns: await this.analyzeSeasonalPatterns(orders),
      product_affinity: await this.analyzeProductAffinity(orders, products),
      recommendations: []
    };

    // Generate actionable recommendations
    if (insights.customer_acquisition_cost.cac > insights.customer_lifetime_value.avg_clv * 0.3) {
      insights.recommendations.push({
        type: 'cost_optimization',
        message: 'Customer acquisition cost is high relative to LTV. Consider optimizing marketing spend.',
        priority: 'High'
      });
    }

    if (insights.conversion_funnel.cart_abandonment_rate > 70) {
      insights.recommendations.push({
        type: 'conversion_optimization',
        message: 'High cart abandonment rate detected. Implement recovery campaigns.',
        priority: 'High'
      });
    }

    return insights;
  }

  static async generateNaturalLanguageInsights(data, context) {
    const insights = [];

    // Revenue insights
    const revenue = data.totalRevenue || 0;
    const orders = data.totalOrders || 0;
    const aov = orders > 0 ? revenue / orders : 0;

    if (revenue > 100000) {
      insights.push({
        type: 'positive',
        message: `Strong revenue performance with ₹${revenue.toLocaleString()} generated`,
        impact: 'High'
      });
    }

    if (aov > 1000) {
      insights.push({
        type: 'positive',
        message: `Excellent average order value of ₹${aov.toFixed(0)} indicates premium customer base`,
        impact: 'Medium'
      });
    }

    // Growth insights
    if (data.growth && data.growth.revenue > 15) {
      insights.push({
        type: 'positive',
        message: `Revenue growth of ${data.growth.revenue}% shows strong business momentum`,
        impact: 'High'
      });
    } else if (data.growth && data.growth.revenue < -5) {
      insights.push({
        type: 'warning',
        message: `Revenue decline of ${Math.abs(data.growth.revenue)}% requires attention`,
        impact: 'High'
      });
    }

    // Inventory insights
    if (data.inventory && data.inventory.low_stock > 5) {
      insights.push({
        type: 'warning',
        message: `${data.inventory.low_stock} products are low in stock and need immediate restocking`,
        impact: 'Medium'
      });
    }

    return insights;
  }

  static async generateAIChat(message, context) {
    // Try OpenAI first, fallback to Google AI, then rule-based
    if (openai) {
      try {
        const systemPrompt = `You are an AI assistant for an e-commerce admin panel specializing in fireworks and crackers. 
        You help with business analytics, inventory management, customer insights, and operational decisions.
        Be professional, concise, and provide actionable insights. Current context: ${JSON.stringify(context)}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 200,
          temperature: 0.7
        });

        return completion.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `You are an AI assistant for a fireworks e-commerce business admin panel. 
        Context: ${JSON.stringify(context)}
        User question: "${message}"
        Provide a helpful, professional response with actionable insights.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error('Google AI API error:', error);
      }
    }

    // Fallback to rule-based responses
    return this.generateRuleBasedResponse(message, context);
  }

  // Utility methods
  static generateMockForecast(period) {
    const baseValue = 120000;
    const forecast = [];
    
    for (let i = 1; i <= period; i++) {
      const growth = 1 + (Math.random() * 0.2 - 0.05); // -5% to +15% random growth
      const seasonal = 1 + (Math.sin((new Date().getMonth() + i) * Math.PI / 6) * 0.3);
      const predicted = Math.round(baseValue * growth * seasonal);
      
      forecast.push({
        month: this.getMonthName(new Date().getMonth() + i),
        predicted,
        confidence: Math.max(90 - (i * 3), 60)
      });
    }
    
    return forecast;
  }

  static calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = n * (n - 1) / 2; // Sum of indices 0, 1, 2, ...
    const sumY = data.reduce((sum, point) => sum + point.value, 0);
    const sumXY = data.reduce((sum, point, index) => sum + (index * point.value), 0);
    const sumXX = n * (n - 1) * (2 * n - 1) / 6; // Sum of squares
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  static calculateSeasonality(data) {
    const monthlyAvg = new Array(12).fill(0);
    const monthlyCount = new Array(12).fill(0);
    
    data.forEach(point => {
      const month = new Date(point.date || point.createdAt).getMonth();
      monthlyAvg[month] += point.value;
      monthlyCount[month]++;
    });
    
    const overallAvg = data.reduce((sum, point) => sum + point.value, 0) / data.length;
    
    return monthlyAvg.map((sum, index) => {
      if (monthlyCount[index] === 0) return 1;
      const avg = sum / monthlyCount[index];
      return avg / overallAvg;
    });
  }

  static getMonthName(monthIndex) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex % 12];
  }

  static async analyzeMarketingChannels(orders) {
    // Mock analysis - in real implementation, track referrer sources
    return {
      organic: { orders: Math.floor(orders.length * 0.4), cost: 0, roas: 'Infinity' },
      social_media: { orders: Math.floor(orders.length * 0.3), cost: 15000, roas: 4.2 },
      email: { orders: Math.floor(orders.length * 0.2), cost: 5000, roas: 8.5 },
      paid_search: { orders: Math.floor(orders.length * 0.1), cost: 12000, roas: 3.1 }
    };
  }

  static async calculateCAC(orders, customers) {
    const totalMarketingSpend = 50000; // Mock value
    const newCustomers = customers.filter(c => {
      const joinDate = new Date(c.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return joinDate >= thirtyDaysAgo;
    }).length;

    return {
      cac: newCustomers > 0 ? (totalMarketingSpend / newCustomers).toFixed(2) : 0,
      new_customers: newCustomers,
      marketing_spend: totalMarketingSpend
    };
  }

  static async calculateCLV(orders, customers) {
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const avgClv = customers.length > 0 ? totalRevenue / customers.length : 0;
    
    return {
      avg_clv: avgClv.toFixed(2),
      total_customers: customers.length,
      total_revenue: totalRevenue
    };
  }

  static async analyzeConversionFunnel(orders, customers) {
    const totalVisitors = 10000; // Mock value - would come from analytics
    const cartCreations = Math.floor(totalVisitors * 0.3);
    const checkouts = Math.floor(cartCreations * 0.4);
    const completedOrders = orders.length;

    return {
      visitors: totalVisitors,
      cart_creations: cartCreations,
      checkouts: checkouts,
      completed_orders: completedOrders,
      cart_abandonment_rate: ((cartCreations - checkouts) / cartCreations * 100).toFixed(1),
      checkout_abandonment_rate: ((checkouts - completedOrders) / checkouts * 100).toFixed(1),
      overall_conversion_rate: (completedOrders / totalVisitors * 100).toFixed(2)
    };
  }

  static async analyzeSeasonalPatterns(orders) {
    const monthlyOrders = new Array(12).fill(0);
    
    orders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      monthlyOrders[month] += order.totalPrice;
    });

    const peakMonth = monthlyOrders.indexOf(Math.max(...monthlyOrders));
    const lowMonth = monthlyOrders.indexOf(Math.min(...monthlyOrders));

    return {
      monthly_revenue: monthlyOrders,
      peak_month: this.getMonthName(peakMonth),
      low_month: this.getMonthName(lowMonth),
      seasonality_factor: (Math.max(...monthlyOrders) / Math.min(...monthlyOrders)).toFixed(2)
    };
  }

  static async analyzeProductAffinity(orders, products) {
    const productPairs = {};
    
    orders.forEach(order => {
      const items = order.orderItems;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const pair = [items[i]._id, items[j]._id].sort().join('-');
          productPairs[pair] = (productPairs[pair] || 0) + 1;
        }
      }
    });

    const topPairs = Object.entries(productPairs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pair, count]) => {
        const [prod1, prod2] = pair.split('-');
        const product1 = products.find(p => p._id === prod1);
        const product2 = products.find(p => p._id === prod2);
        
        return {
          product1: product1?.name || 'Unknown',
          product2: product2?.name || 'Unknown',
          co_purchases: count,
          affinity_score: (count / orders.length * 100).toFixed(1)
        };
      });

    return topPairs;
  }

  static generateRuleBasedResponse(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Sales related queries
    if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
      return `Based on current data, your sales performance shows strong momentum. Total revenue is ₹${context?.totalRevenue?.toLocaleString() || '0'} with an average order value of ₹${context?.avgOrderValue || '0'}. Consider focusing on high-margin products to boost profitability.`;
    }
    
    // Inventory queries
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
      return `Your inventory analysis shows ${context?.lowStock || '0'} products with low stock levels. I recommend implementing automated reorder points and focusing on fast-moving items during peak season.`;
    }
    
    // Customer queries
    if (lowerMessage.includes('customer') || lowerMessage.includes('user')) {
      return `Customer insights reveal ${context?.totalCustomers || '0'} active customers with varying engagement levels. Focus on customer retention through personalized recommendations and loyalty programs.`;
    }
    
    // Marketing queries
    if (lowerMessage.includes('marketing') || lowerMessage.includes('promotion')) {
      return `For effective marketing, consider seasonal campaigns targeting festive periods. Email marketing shows high ROI, while social media helps with brand awareness. Focus on conversion optimization to reduce cart abandonment.`;
    }
    
    // Default response
    return `I'm here to help you optimize your e-commerce business. I can provide insights on sales performance, inventory management, customer behavior, and marketing strategies. What specific area would you like to explore?`;
  }
}

export default AIService;