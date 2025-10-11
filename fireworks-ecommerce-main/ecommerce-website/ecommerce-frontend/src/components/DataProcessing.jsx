import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const DataProcessing = ({ isOpen, onClose }) => {
  const [processingData, setProcessingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('etl');
  const [pipelines, setPipelines] = useState([]);
  const { showToast } = useToast();

  const processingTypes = [
    { id: 'etl', name: 'ETL Pipelines', icon: '🔄', description: 'Extract, Transform, Load processes' },
    { id: 'warehouse', name: 'Data Warehouse', icon: '🏪', description: 'Centralized data storage' },
    { id: 'streaming', name: 'Real-time Streaming', icon: '⚡', description: 'Live data processing' },
    { id: 'quality', name: 'Data Quality', icon: '✅', description: 'Data validation and cleansing' },
    { id: 'backup', name: 'Backup & Recovery', icon: '💾', description: 'Automated data backup' },
    { id: 'lineage', name: 'Data Lineage', icon: '🔗', description: 'Data source tracking' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchProcessingData();
    }
  }, [isOpen, activeTab]);

  const fetchProcessingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`/api/admin/data-processing?type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProcessingData(response.data.data);
      } else {
        generateMockData();
      }
    } catch (error) {
      console.error('Error fetching processing data:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockData = {
      etl: {
        pipelines: [
          { id: 1, name: 'Sales Data Pipeline', status: 'running', lastRun: '2 hours ago', nextRun: 'in 4 hours', records: 15420 },
          { id: 2, name: 'Customer Data Pipeline', status: 'completed', lastRun: '1 hour ago', nextRun: 'in 5 hours', records: 8930 },
          { id: 3, name: 'Inventory Pipeline', status: 'failed', lastRun: '3 hours ago', nextRun: 'in 1 hour', records: 0 },
          { id: 4, name: 'Analytics Pipeline', status: 'scheduled', lastRun: '6 hours ago', nextRun: 'in 2 hours', records: 25680 }
        ]
      },
      warehouse: {
        tables: [
          { name: 'sales_fact', records: 125000, size: '2.3 GB', lastUpdated: '1 hour ago' },
          { name: 'customers_dim', records: 15000, size: '450 MB', lastUpdated: '2 hours ago' },
          { name: 'products_dim', records: 2500, size: '120 MB', lastUpdated: '3 hours ago' },
          { name: 'orders_fact', records: 89000, size: '1.8 GB', lastUpdated: '30 minutes ago' }
        ],
        totalSize: '4.67 GB',
        totalRecords: 231500
      },
      streaming: {
        streams: [
          { name: 'Order Events', status: 'active', throughput: '150 events/min', latency: '2ms' },
          { name: 'User Activity', status: 'active', throughput: '320 events/min', latency: '1ms' },
          { name: 'Payment Events', status: 'paused', throughput: '0 events/min', latency: 'N/A' }
        ]
      },
      quality: {
        checks: [
          { name: 'Email Validation', status: 'passed', issues: 0, lastRun: '1 hour ago' },
          { name: 'Phone Number Format', status: 'failed', issues: 12, lastRun: '1 hour ago' },
          { name: 'Duplicate Detection', status: 'passed', issues: 0, lastRun: '2 hours ago' },
          { name: 'Data Completeness', status: 'warning', issues: 5, lastRun: '1 hour ago' }
        ]
      },
      backup: {
        backups: [
          { name: 'Daily Backup', status: 'completed', size: '4.2 GB', date: 'Today 2:00 AM' },
          { name: 'Weekly Backup', status: 'completed', size: '28.5 GB', date: 'Sunday 3:00 AM' },
          { name: 'Monthly Backup', status: 'scheduled', size: 'N/A', date: 'Next Sunday' }
        ]
      },
      lineage: {
        flows: [
          { source: 'Orders API', target: 'Sales Fact Table', transformations: ['Data cleaning', 'Aggregation'] },
          { source: 'Customer API', target: 'Customer Dim Table', transformations: ['Deduplication', 'Enrichment'] },
          { source: 'Product API', target: 'Product Dim Table', transformations: ['Standardization', 'Validation'] }
        ]
      }
    };

    setProcessingData(mockData[activeTab]);
  };

  const runPipeline = async (pipelineId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(`/api/admin/data-processing/pipelines/${pipelineId}/run`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showToast('Pipeline started successfully', 'success');
        fetchProcessingData();
      }
    } catch (error) {
      console.error('Error running pipeline:', error);
      showToast('Failed to start pipeline', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'passed': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderETLPipelines = () => (
    <div className="space-y-4">
      {processingData?.pipelines?.map((pipeline) => (
        <motion.div
          key={pipeline.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow border"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold">{pipeline.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pipeline.status)}`}>
                  {pipeline.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Last Run:</span> {pipeline.lastRun}
                </div>
                <div>
                  <span className="font-medium">Next Run:</span> {pipeline.nextRun}
                </div>
                <div>
                  <span className="font-medium">Records:</span> {pipeline.records.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {pipeline.status}
                </div>
              </div>
            </div>
            <div className="ml-4">
              <button
                onClick={() => runPipeline(pipeline.id)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Run Now
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDataWarehouse = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Data Warehouse Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{processingData?.totalSize}</div>
            <div className="text-sm text-gray-600">Total Size</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{processingData?.totalRecords?.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{processingData?.tables?.length}</div>
            <div className="text-sm text-gray-600">Tables</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Tables</h3>
        {processingData?.tables?.map((table, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{table.name}</h4>
                <div className="text-sm text-gray-600">
                  {table.records.toLocaleString()} records • {table.size} • Updated {table.lastUpdated}
                </div>
              </div>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderStreaming = () => (
    <div className="space-y-4">
      {processingData?.streams?.map((stream, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-lg shadow border"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold">{stream.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(stream.status)}`}>
                  {stream.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Throughput:</span> {stream.throughput}
                </div>
                <div>
                  <span className="font-medium">Latency:</span> {stream.latency}
                </div>
              </div>
            </div>
            <div className="ml-4">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                {stream.status === 'active' ? 'Pause' : 'Start'}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDataQuality = () => (
    <div className="space-y-4">
      {processingData?.checks?.map((check, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-lg shadow border"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold">{check.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(check.status)}`}>
                  {check.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Issues:</span> {check.issues} • 
                <span className="font-medium ml-2">Last Run:</span> {check.lastRun}
              </div>
            </div>
            <div className="ml-4">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                Run Check
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-4">
      {processingData?.backups?.map((backup, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-lg shadow border"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold">{backup.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                  {backup.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Size:</span> {backup.size} • 
                <span className="font-medium ml-2">Date:</span> {backup.date}
              </div>
            </div>
            <div className="ml-4">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                {backup.status === 'completed' ? 'Download' : 'Schedule'}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderLineage = () => (
    <div className="space-y-4">
      {processingData?.flows?.map((flow, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-lg shadow border"
        >
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-blue-600">{flow.source}</div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="text-sm font-medium text-green-600">{flow.target}</div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Transformations:</span> {flow.transformations.join(', ')}
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Advanced Data Processing</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Processing Type Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {processingTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveTab(type.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === type.id
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
              <p className="mt-2 text-sm text-gray-500">Loading data processing information...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'etl' && renderETLPipelines()}
                {activeTab === 'warehouse' && renderDataWarehouse()}
                {activeTab === 'streaming' && renderStreaming()}
                {activeTab === 'quality' && renderDataQuality()}
                {activeTab === 'backup' && renderBackup()}
                {activeTab === 'lineage' && renderLineage()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataProcessing;
