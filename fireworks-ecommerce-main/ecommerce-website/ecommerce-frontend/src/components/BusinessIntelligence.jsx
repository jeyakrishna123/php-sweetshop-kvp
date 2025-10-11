import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

const BusinessIntelligence = ({ isOpen, onClose }) => {
  const [biData, setBiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState('cohort');
  const { showToast } = useToast();

  const analysisTypes = [
    { id: 'cohort', name: 'Cohort Analysis', icon: '👥', description: 'Customer retention and lifetime value' },
    { id: 'funnel', name: 'Funnel Analysis', icon: '🔄', description: 'Conversion path optimization' },
    { id: 'abtesting', name: 'A/B Testing', icon: '🧪', description: 'Campaign effectiveness testing' },
    { id: 'attribution', name: 'Attribution Modeling', icon: '📊', description: 'Marketing channel effectiveness' },
    { id: 'clv', name: 'Customer Lifetime Value', icon: '💰', description: 'CLV prediction and analysis' },
    { id: 'rfm', name: 'RFM Analysis', icon: '🎯', description: 'Customer segmentation' },
    { id: 'marketbasket', name: 'Market Basket Analysis', icon: '🛒', description: 'Product association rules' },
    { id: 'comparative', name: 'Comparative Analysis', icon: '📈', description: 'YoY, MoM comparisons' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchBIData();
    }
  }, [isOpen, selectedAnalysis]);

  const fetchBIData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`/api/admin/bi/analysis?type=${selectedAnalysis}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBiData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching BI data:', error);
      generateMockBIData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockBIData = () => {
    const mockData = {
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
          },
          {
            name: 'Checkout Flow Test',
            variantA: { name: 'Single Page', conversions: 800, visitors: 2000, rate: 40 },
            variantB: { name: 'Multi Step', conversions: 720, visitors: 2000, rate: 36 },
            winner: 'A',
            confidence: 88,
            improvement: 11
          }
        ]
      },
      attribution: {
        title: 'Marketing Attribution Analysis',
        channels: [
          { channel: 'Google Ads', firstTouch: 35, lastTouch: 25, linear: 30, timeDecay: 28 },
          { channel: 'Facebook Ads', firstTouch: 20, lastTouch: 30, linear: 25, timeDecay: 27 },
          { channel: 'Email Marketing', firstTouch: 15, lastTouch: 20, linear: 18, timeDecay: 19 },
          { channel: 'Organic Search', firstTouch: 20, lastTouch: 15, linear: 17, timeDecay: 16 },
          { channel: 'Direct', firstTouch: 10, lastTouch: 10, linear: 10, timeDecay: 10 }
        ],
        insights: [
          'Google Ads drives initial awareness',
          'Facebook Ads converts better in final stages',
          'Email marketing has strong middle-funnel impact'
        ]
      },
      clv: {
        title: 'Customer Lifetime Value Analysis',
        segments: [
          { segment: 'Premium', clv: 2500, customers: 150, revenue: 375000 },
          { segment: 'Standard', clv: 800, customers: 800, revenue: 640000 },
          { segment: 'Basic', clv: 300, customers: 1200, revenue: 360000 }
        ],
        predictions: [
          { month: 'Jan', predicted: 1200, actual: 1180 },
          { month: 'Feb', predicted: 1250, actual: 1300 },
          { month: 'Mar', predicted: 1300, actual: null },
          { month: 'Apr', predicted: 1350, actual: null }
        ],
        factors: [
          { factor: 'Purchase Frequency', impact: 0.45 },
          { factor: 'Average Order Value', impact: 0.35 },
          { factor: 'Customer Lifespan', impact: 0.20 }
        ]
      },
      rfm: {
        title: 'RFM Customer Segmentation',
        segments: [
          { segment: 'Champions', recency: 1, frequency: 5, monetary: 5, customers: 120, description: 'Best customers' },
          { segment: 'Loyal Customers', recency: 2, frequency: 4, monetary: 4, customers: 200, description: 'Regular buyers' },
          { segment: 'Potential Loyalists', recency: 3, frequency: 3, monetary: 3, customers: 300, description: 'Need engagement' },
          { segment: 'New Customers', recency: 1, frequency: 2, monetary: 2, customers: 150, description: 'Recent first-time buyers' },
          { segment: 'At Risk', recency: 4, frequency: 3, monetary: 3, customers: 180, description: 'Declining engagement' },
          { segment: 'Cannot Lose Them', recency: 5, frequency: 5, monetary: 5, customers: 80, description: 'High value, at risk' }
        ]
      },
      marketbasket: {
        title: 'Market Basket Analysis',
        rules: [
          { antecedent: 'Diwali Crackers', consequent: 'Sparklers', confidence: 0.75, support: 0.45, lift: 1.8 },
          { antecedent: 'Rockets', consequent: 'Fountains', confidence: 0.68, support: 0.32, lift: 1.5 },
          { antecedent: 'Premium Crackers', consequent: 'Gold Sparklers', confidence: 0.82, support: 0.28, lift: 2.1 },
          { antecedent: 'Ground Fountains', consequent: 'Aerial Fountains', confidence: 0.71, support: 0.35, lift: 1.6 }
        ],
        recommendations: [
          'Bundle Diwali Crackers with Sparklers for 15% discount',
          'Cross-sell Rockets when customers buy Fountains',
          'Create premium bundles for high-value customers'
        ]
      },
      comparative: {
        title: 'Comparative Analysis',
        comparisons: {
          yearOverYear: [
            { metric: 'Revenue', current: 1500000, previous: 1200000, change: 25 },
            { metric: 'Orders', current: 5000, previous: 4000, change: 25 },
            { metric: 'Customers', current: 2000, previous: 1600, change: 25 },
            { metric: 'AOV', current: 300, previous: 300, change: 0 }
          ],
          monthOverMonth: [
            { metric: 'Revenue', current: 180000, previous: 150000, change: 20 },
            { metric: 'Orders', current: 600, previous: 500, change: 20 },
            { metric: 'Customers', current: 250, previous: 200, change: 25 },
            { metric: 'AOV', current: 300, previous: 300, change: 0 }
          ]
        }
      }
    };

    setBiData(mockData[selectedAnalysis]);
  };

  const renderCohortAnalysis = () => (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">{biData?.title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Cohort</th>
                <th className="text-center p-2">Customers</th>
                <th className="text-center p-2">Month 1</th>
                <th className="text-center p-2">Month 2</th>
                <th className="text-center p-2">Month 3</th>
                <th className="text-center p-2">Month 4</th>
                <th className="text-center p-2">Month 5</th>
                <th className="text-center p-2">Month 6</th>
              </tr>
            </thead>
            <tbody>
              {biData?.cohorts?.map((cohort, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 font-medium">{cohort.cohort}</td>
                  <td className="p-2 text-center">{cohort.customers}</td>
                  {[cohort.month1, cohort.month2, cohort.month3, cohort.month4, cohort.month5, cohort.month6].map((value, i) => (
                    <td key={i} className="p-2 text-center">
                      {value > 0 ? (
                        <span className={`px-2 py-1 rounded text-xs ${
                          value >= 80 ? 'bg-green-100 text-green-800' :
                          value >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {value}
                        </span>
                      ) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">Retention Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{biData?.retention?.average}%</div>
            <div className="text-sm text-gray-600">Average Retention</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 capitalize">{biData?.retention?.trend}</div>
            <div className="text-sm text-gray-600">Trend</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">2</div>
            <div className="text-sm text-gray-600">Key Insights</div>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="font-medium mb-2">Key Insights:</h4>
          <ul className="space-y-1">
            {biData?.retention?.insights?.map((insight, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );

  const renderFunnelAnalysis = () => (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">{biData?.title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={biData?.stages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip formatter={(value) => [value.toLocaleString(), 'Visitors']} />
            <Bar dataKey="visitors" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">Conversion Drop-off Analysis</h3>
        <div className="space-y-4">
          {biData?.dropoff?.map((item, index) => (
            <div key={index} className="p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-red-800">{item.stage}</div>
                  <div className="text-sm text-red-600">{item.reason}</div>
                </div>
                <span className="text-lg font-bold text-red-600">{item.rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderABTesting = () => (
    <div className="space-y-6">
      {biData?.tests?.map((test, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">{test.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Variant A: {test.variantA.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversions:</span>
                  <span className="font-medium">{test.variantA.conversions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Visitors:</span>
                  <span className="font-medium">{test.variantA.visitors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rate:</span>
                  <span className="font-medium">{test.variantA.rate}%</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Variant B: {test.variantB.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversions:</span>
                  <span className="font-medium">{test.variantB.conversions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Visitors:</span>
                  <span className="font-medium">{test.variantB.visitors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rate:</span>
                  <span className="font-medium">{test.variantB.rate}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-green-800">Winner: Variant {test.winner}</div>
                <div className="text-sm text-green-600">+{test.improvement}% improvement</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Confidence</div>
                <div className="text-lg font-bold text-green-600">{test.confidence}%</div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderAttribution = () => (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">{biData?.title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={biData?.channels}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="firstTouch" fill="#3B82F6" name="First Touch" />
            <Bar dataKey="lastTouch" fill="#10B981" name="Last Touch" />
            <Bar dataKey="linear" fill="#F59E0B" name="Linear" />
            <Bar dataKey="timeDecay" fill="#EF4444" name="Time Decay" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">Attribution Insights</h3>
        <div className="space-y-3">
          {biData?.insights?.map((insight, index) => (
            <div key={index} className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                <span className="text-sm text-blue-800">{insight}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderCLV = () => (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">{biData?.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {biData?.segments?.map((segment, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">{segment.segment}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CLV:</span>
                  <span className="font-medium">${segment.clv}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customers:</span>
                  <span className="font-medium">{segment.customers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="font-medium">${segment.revenue.toLocaleString()}</span>
                </div>
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
        <h3 className="text-lg font-semibold mb-4">CLV Prediction Factors</h3>
        <div className="space-y-3">
          {biData?.factors?.map((factor, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">{factor.factor}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${factor.impact * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{(factor.impact * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderRFM = () => (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">{biData?.title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Segment</th>
                <th className="text-center p-2">Recency</th>
                <th className="text-center p-2">Frequency</th>
                <th className="text-center p-2">Monetary</th>
                <th className="text-center p-2">Customers</th>
                <th className="text-left p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {biData?.segments?.map((segment, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 font-medium">{segment.segment}</td>
                  <td className="p-2 text-center">{segment.recency}</td>
                  <td className="p-2 text-center">{segment.frequency}</td>
                  <td className="p-2 text-center">{segment.monetary}</td>
                  <td className="p-2 text-center">{segment.customers}</td>
                  <td className="p-2 text-sm text-gray-600">{segment.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );

  const renderMarketBasket = () => (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">{biData?.title}</h3>
        <div className="space-y-4">
          {biData?.rules?.map((rule, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">
                    {rule.antecedent} → {rule.consequent}
                  </div>
                  <div className="text-sm text-gray-600">
                    When customers buy {rule.antecedent}, they also buy {rule.consequent}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Confidence</div>
                  <div className="text-lg font-bold text-blue-600">{(rule.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Support: {(rule.support * 100).toFixed(1)}%</span>
                <span>Lift: {rule.lift}</span>
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
        <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
        <div className="space-y-3">
          {biData?.recommendations?.map((rec, index) => (
            <div key={index} className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                <span className="text-sm text-green-800">{rec}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderComparative = () => (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">Year-over-Year Comparison</h3>
        <div className="space-y-4">
          {biData?.comparisons?.yearOverYear?.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">{item.metric}</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">${item.previous.toLocaleString()}</span>
                <span className="text-sm text-gray-400">→</span>
                <span className="font-medium">${item.current.toLocaleString()}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.change > 0 ? 'bg-green-100 text-green-800' : 
                  item.change < 0 ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
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
        <h3 className="text-lg font-semibold mb-4">Month-over-Month Comparison</h3>
        <div className="space-y-4">
          {biData?.comparisons?.monthOverMonth?.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">{item.metric}</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">${item.previous.toLocaleString()}</span>
                <span className="text-sm text-gray-400">→</span>
                <span className="font-medium">${item.current.toLocaleString()}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.change > 0 ? 'bg-green-100 text-green-800' : 
                  item.change < 0 ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Business Intelligence</h2>
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
              <p className="mt-2 text-sm text-gray-500">Analyzing business intelligence data...</p>
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
                {selectedAnalysis === 'cohort' && renderCohortAnalysis()}
                {selectedAnalysis === 'funnel' && renderFunnelAnalysis()}
                {selectedAnalysis === 'abtesting' && renderABTesting()}
                {selectedAnalysis === 'attribution' && renderAttribution()}
                {selectedAnalysis === 'clv' && renderCLV()}
                {selectedAnalysis === 'rfm' && renderRFM()}
                {selectedAnalysis === 'marketbasket' && renderMarketBasket()}
                {selectedAnalysis === 'comparative' && renderComparative()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;
