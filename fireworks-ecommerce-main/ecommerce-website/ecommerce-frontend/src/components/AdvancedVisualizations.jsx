import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const AdvancedVisualizations = ({ isOpen, onClose }) => {
  const [vizData, setVizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedViz, setSelectedViz] = useState('heatmap');
  const { showToast } = useToast();

  const visualizationTypes = [
    { id: 'heatmap', name: 'Heat Map', icon: '🔥', description: 'Geographic sales distribution' },
    { id: 'sankey', name: 'Sankey Diagram', icon: '🌊', description: 'Customer journey flow' },
    { id: 'treemap', name: 'Tree Map', icon: '🌳', description: 'Hierarchical data visualization' },
    { id: 'network', name: 'Network Graph', icon: '🕸️', description: 'Customer relationship mapping' },
    { id: 'waterfall', name: 'Waterfall Chart', icon: '💧', description: 'Financial flow analysis' },
    { id: 'radar', name: 'Radar Chart', icon: '🕸️', description: 'Multi-metric performance' },
    { id: '3d', name: '3D Charts', icon: '📊', description: 'Three-dimensional visualization' },
    { id: 'gantt', name: 'Gantt Chart', icon: '📅', description: 'Project timeline visualization' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchVizData();
    }
  }, [isOpen, selectedViz]);

  const fetchVizData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`/api/admin/visualizations?type=${selectedViz}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setVizData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching visualization data:', error);
      generateMockVizData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockVizData = () => {
    const mockData = {
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
      },
      network: {
        title: 'Customer Relationship Network',
        nodes: [
          { id: 1, name: 'Customer A', group: 1, connections: 5 },
          { id: 2, name: 'Customer B', group: 1, connections: 3 },
          { id: 3, name: 'Customer C', group: 2, connections: 4 },
          { id: 4, name: 'Customer D', group: 2, connections: 2 },
          { id: 5, name: 'Customer E', group: 3, connections: 6 }
        ],
        links: [
          { source: 1, target: 2, strength: 0.8 },
          { source: 1, target: 3, strength: 0.6 },
          { source: 2, target: 4, strength: 0.4 },
          { source: 3, target: 5, strength: 0.7 },
          { source: 4, target: 5, strength: 0.5 }
        ]
      },
      waterfall: {
        title: 'Revenue Flow Analysis',
        data: [
          { name: 'Starting Revenue', value: 100000, type: 'start' },
          { name: 'New Customers', value: 25000, type: 'positive' },
          { name: 'Price Increase', value: 15000, type: 'positive' },
          { name: 'Seasonal Boost', value: 35000, type: 'positive' },
          { name: 'Customer Churn', value: -8000, type: 'negative' },
          { name: 'Competition', value: -5000, type: 'negative' },
          { name: 'Final Revenue', value: 162000, type: 'end' }
        ]
      },
      radar: {
        title: 'Multi-Metric Performance',
        data: [
          { metric: 'Sales', value: 85, fullMark: 100 },
          { metric: 'Customer Satisfaction', value: 92, fullMark: 100 },
          { metric: 'Inventory Turnover', value: 78, fullMark: 100 },
          { metric: 'Marketing ROI', value: 88, fullMark: 100 },
          { metric: 'Operational Efficiency', value: 82, fullMark: 100 },
          { metric: 'Profit Margin', value: 75, fullMark: 100 }
        ]
      },
      gantt: {
        title: 'Project Timeline',
        tasks: [
          { name: 'Market Research', start: '2024-01-01', end: '2024-01-15', progress: 100 },
          { name: 'Product Development', start: '2024-01-10', end: '2024-02-28', progress: 75 },
          { name: 'Marketing Campaign', start: '2024-02-01', end: '2024-03-15', progress: 60 },
          { name: 'Launch Preparation', start: '2024-03-01', end: '2024-03-31', progress: 30 },
          { name: 'Product Launch', start: '2024-04-01', end: '2024-04-15', progress: 0 }
        ]
      }
    };

    setVizData(mockData[selectedViz]);
  };

  const renderHeatMap = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <h3 className="text-lg font-semibold mb-4">{vizData?.title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Region</th>
              <th className="text-center p-2">Jan</th>
              <th className="text-center p-2">Feb</th>
              <th className="text-center p-2">Mar</th>
              <th className="text-center p-2">Apr</th>
              <th className="text-center p-2">May</th>
            </tr>
          </thead>
          <tbody>
            {vizData?.data?.map((row, index) => (
              <tr key={index}>
                <td className="p-2 font-medium">{row.region}</td>
                {['jan', 'feb', 'mar', 'apr', 'may'].map((month) => (
                  <td key={month} className="p-2 text-center">
                    <div 
                      className="p-2 rounded text-white font-medium"
                      style={{ 
                        backgroundColor: `rgba(59, 130, 246, ${row[month] / 35000})`,
                        minWidth: '60px'
                      }}
                    >
                      ${row[month].toLocaleString()}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderSankey = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <h3 className="text-lg font-semibold mb-4">{vizData?.title}</h3>
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌊</div>
          <p className="text-gray-600">Sankey Diagram Visualization</p>
          <p className="text-sm text-gray-500 mt-2">
            Customer Journey: Website → Product View → Cart → Checkout → Purchase
          </p>
          <div className="mt-4 space-y-2">
            {vizData?.links?.map((link, index) => (
              <div key={index} className="text-sm text-gray-600">
                {vizData.nodes[link.source].name} → {vizData.nodes[link.target].name}: {link.value} users
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTreeMap = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <h3 className="text-lg font-semibold mb-4">{vizData?.title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {vizData?.data?.map((category, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="font-semibold text-lg mb-2">{category.name}</div>
            <div className="text-2xl font-bold text-blue-600 mb-2">${category.value.toLocaleString()}</div>
            <div className="space-y-2">
              {category.children?.map((child, childIndex) => (
                <div key={childIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{child.name}</span>
                  <span className="text-sm font-medium">${child.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderNetwork = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <h3 className="text-lg font-semibold mb-4">{vizData?.title}</h3>
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🕸️</div>
          <p className="text-gray-600">Network Graph Visualization</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {vizData?.nodes?.map((node, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium">{node.name}</div>
                <div className="text-sm text-gray-600">{node.connections} connections</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderWaterfall = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <h3 className="text-lg font-semibold mb-4">{vizData?.title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={vizData?.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
          <Bar 
            dataKey="value" 
            fill={(entry) => {
              if (entry.type === 'positive') return '#10B981';
              if (entry.type === 'negative') return '#EF4444';
              if (entry.type === 'start' || entry.type === 'end') return '#3B82F6';
              return '#6B7280';
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );

  const renderRadar = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <h3 className="text-lg font-semibold mb-4">{vizData?.title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={vizData?.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );

  const renderGantt = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <h3 className="text-lg font-semibold mb-4">{vizData?.title}</h3>
      <div className="space-y-4">
        {vizData?.tasks?.map((task, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-32 text-sm font-medium">{task.name}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${task.progress}%` }}
              >
                <span className="text-white text-xs font-medium">{task.progress}%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 w-24">{task.start}</div>
            <div className="text-sm text-gray-600 w-24">{task.end}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Advanced Visualizations</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Visualization Type Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {visualizationTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedViz(type.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    selectedViz === type.id
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
              <p className="mt-2 text-sm text-gray-500">Generating visualization...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedViz}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedViz === 'heatmap' && renderHeatMap()}
                {selectedViz === 'sankey' && renderSankey()}
                {selectedViz === 'treemap' && renderTreeMap()}
                {selectedViz === 'network' && renderNetwork()}
                {selectedViz === 'waterfall' && renderWaterfall()}
                {selectedViz === 'radar' && renderRadar()}
                {selectedViz === 'gantt' && renderGantt()}
                {selectedViz === '3d' && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-gray-500">3D Charts functionality coming soon...</p>
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

export default AdvancedVisualizations;
