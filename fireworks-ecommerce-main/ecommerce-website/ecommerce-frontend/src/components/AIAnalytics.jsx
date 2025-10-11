import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const AIAnalytics = ({ isOpen, onClose }) => {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState('predictions');
  const [predictions, setPredictions] = useState(null);
  const { showToast } = useToast();

  const analysisTypes = [
    { id: 'predictions', name: 'Predictive Analytics', icon: '🔮', description: 'Future trend predictions' },
    { id: 'anomalies', name: 'Anomaly Detection', icon: '🚨', description: 'Unusual pattern detection' },
    { id: 'recommendations', name: 'AI Recommendations', icon: '💡', description: 'Smart suggestions' },
    { id: 'sentiment', name: 'Sentiment Analysis', icon: '😊', description: 'Customer feedback analysis' },
    { id: 'forecasting', name: 'Demand Forecasting', icon: '📈', description: 'Inventory predictions' },
    { id: 'optimization', name: 'Price Optimization', icon: '💰', description: 'Dynamic pricing' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchAIData();
    }
  }, [isOpen, selectedAnalysis]);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`/api/admin/ai/analytics?type=${selectedAnalysis}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAiData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching AI data:', error);
      // Generate mock data for demonstration
      generateMockAIData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockAIData = () => {
    const mockData = {
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

    setAiData(mockData[selectedAnalysis]);
  };

  const renderPredictions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Sales Forecast</h3>
          <div className="space-y-3">
            {aiData?.salesForecast?.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="text-right">
                  <div className="text-sm font-medium">${item.predicted?.toLocaleString()}</div>
                  {item.actual && (
                    <div className="text-xs text-gray-500">Actual: ${item.actual.toLocaleString()}</div>
                  )}
                  <div className="text-xs text-blue-600">{item.confidence}% confidence</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Customer Growth</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {aiData?.customerGrowth?.predicted}
            </div>
            <div className="text-sm text-gray-600 mb-2">Predicted Customers</div>
            <div className="text-sm text-blue-600">
              +{aiData?.customerGrowth?.growthRate}% growth
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {aiData?.customerGrowth?.confidence}% confidence
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Inventory Recommendations</h3>
          <div className="space-y-3">
            {aiData?.inventoryNeeds?.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium">{item.product}</div>
                <div className="text-xs text-gray-600">
                  Current: {item.currentStock} | Needed: {item.predictedDemand}
                </div>
                <div className={`text-xs font-medium mt-1 ${
                  item.recommendation === 'Increase Stock' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderAnomalies = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Detected Anomalies</h3>
          <div className="space-y-4">
            {aiData?.detected?.map((anomaly, index) => (
              <div key={index} className="p-4 border-l-4 border-red-500 bg-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-red-800">{anomaly.type}</div>
                    <div className="text-sm text-red-600">{anomaly.date}</div>
                    <div className="text-sm text-gray-600">
                      Value: {anomaly.value} (Normal: {anomaly.normal})
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    anomaly.severity === 'High' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {anomaly.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Pattern Recognition</h3>
          <div className="space-y-4">
            {aiData?.patterns?.map((pattern, index) => (
              <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <div className="font-medium text-blue-800">{pattern.pattern}</div>
                <div className="text-sm text-blue-600">{pattern.frequency}</div>
                <div className={`text-sm font-medium ${
                  pattern.impact === 'Positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  Impact: {pattern.impact}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Product Recommendations</h3>
          <div className="space-y-3">
            {aiData?.products?.map((item, index) => (
              <div key={index} className="p-3 bg-green-50 rounded">
                <div className="font-medium text-green-800">{item.product}</div>
                <div className="text-sm text-green-600">{item.reason}</div>
                <div className={`text-xs font-medium mt-1 ${
                  item.priority === 'High' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  Priority: {item.priority}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Marketing Strategies</h3>
          <div className="space-y-3">
            {aiData?.marketing?.map((item, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded">
                <div className="font-medium text-blue-800">{item.strategy}</div>
                <div className="text-sm text-blue-600">{item.reason}</div>
                <div className={`text-xs font-medium mt-1 ${
                  item.priority === 'High' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  Priority: {item.priority}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Operations</h3>
          <div className="space-y-3">
            {aiData?.operations?.map((item, index) => (
              <div key={index} className="p-3 bg-purple-50 rounded">
                <div className="font-medium text-purple-800">{item.action}</div>
                <div className="text-sm text-purple-600">{item.reason}</div>
                <div className={`text-xs font-medium mt-1 ${
                  item.priority === 'High' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  Priority: {item.priority}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderSentiment = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Overall Sentiment</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-green-600">Positive</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${aiData?.overall?.positive}%` }}></div>
                </div>
                <span className="text-sm font-medium">{aiData?.overall?.positive}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Neutral</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${aiData?.overall?.neutral}%` }}></div>
                </div>
                <span className="text-sm font-medium">{aiData?.overall?.neutral}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-600">Negative</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${aiData?.overall?.negative}%` }}></div>
                </div>
                <span className="text-sm font-medium">{aiData?.overall?.negative}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Top Keywords</h3>
          <div className="space-y-3">
            {aiData?.keywords?.map((keyword, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{keyword.word}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    keyword.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    keyword.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {keyword.sentiment}
                  </span>
                  <span className="text-sm text-gray-600">{keyword.count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">AI-Powered Analytics</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Analysis Type Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {analysisTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedAnalysis(type.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    selectedAnalysis === type.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Analyzing data with AI...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAnalysis}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedAnalysis === 'predictions' && renderPredictions()}
                {selectedAnalysis === 'anomalies' && renderAnomalies()}
                {selectedAnalysis === 'recommendations' && renderRecommendations()}
                {selectedAnalysis === 'sentiment' && renderSentiment()}
                {selectedAnalysis === 'forecasting' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Demand Forecasting functionality coming soon...</p>
                  </div>
                )}
                {selectedAnalysis === 'optimization' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Price Optimization functionality coming soon...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;
