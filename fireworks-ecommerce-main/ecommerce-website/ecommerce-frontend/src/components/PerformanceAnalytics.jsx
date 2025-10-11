import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';

const PerformanceAnalytics = ({ isOpen, onClose }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const { showToast } = useToast();

  const metrics = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'pageSpeed', name: 'Page Speed', icon: '⚡' },
    { id: 'userEngagement', name: 'User Engagement', icon: '👥' },
    { id: 'conversion', name: 'Conversion Funnel', icon: '🎯' },
    { id: 'seo', name: 'SEO Performance', icon: '🔍' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchPerformanceData();
    }
  }, [isOpen, selectedMetric]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`/api/admin/analytics/performance?metric=${selectedMetric}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPerformanceData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      showToast('Failed to fetch performance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Page Load Time</p>
            <p className="text-2xl font-semibold text-gray-900">
              {performanceData?.pageSpeed?.averageLoadTime || '2.3'}s
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
            <p className="text-2xl font-semibold text-gray-900">
              {performanceData?.userEngagement?.bounceRate || '35.2'}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Session Duration</p>
            <p className="text-2xl font-semibold text-gray-900">
              {performanceData?.userEngagement?.avgSessionDuration || '4:32'}m
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
            <p className="text-2xl font-semibold text-gray-900">
              {performanceData?.conversion?.overallRate || '3.8'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPageSpeed = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">LCP (Largest Contentful Paint)</span>
              <span className="text-sm font-medium text-green-600">2.1s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">FID (First Input Delay)</span>
              <span className="text-sm font-medium text-green-600">45ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CLS (Cumulative Layout Shift)</span>
              <span className="text-sm font-medium text-yellow-600">0.08</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Score</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">92</div>
            <div className="text-sm text-gray-600">Overall Performance</div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Page Load Times</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Homepage</span>
              <span className="text-sm font-medium">1.8s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Product Pages</span>
              <span className="text-sm font-medium">2.3s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Checkout</span>
              <span className="text-sm font-medium">2.1s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Admin Panel</span>
              <span className="text-sm font-medium">1.5s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserEngagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User Behavior</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Pages per Session</span>
                <span className="text-sm font-medium">4.2</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Return Visitor Rate</span>
                <span className="text-sm font-medium">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Mobile Usage</span>
                <span className="text-sm font-medium">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Homepage</span>
              <span className="text-sm font-medium">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Product Listing</span>
              <span className="text-sm font-medium">28%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Product Details</span>
              <span className="text-sm font-medium">18%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cart</span>
              <span className="text-sm font-medium">9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConversionFunnel = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          {[
            { step: 'Visitors', count: 10000, percentage: 100, color: 'bg-blue-500' },
            { step: 'Product Views', count: 7500, percentage: 75, color: 'bg-green-500' },
            { step: 'Add to Cart', count: 2500, percentage: 25, color: 'bg-yellow-500' },
            { step: 'Checkout Started', count: 1200, percentage: 12, color: 'bg-orange-500' },
            { step: 'Purchase Completed', count: 380, percentage: 3.8, color: 'bg-red-500' }
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-32 text-sm font-medium text-gray-700">{item.step}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{item.count.toLocaleString()}</span>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`${item.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSEO = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">SEO Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Organic Traffic</span>
              <span className="text-sm font-medium text-green-600">+12.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Keyword Rankings</span>
              <span className="text-sm font-medium">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Backlinks</span>
              <span className="text-sm font-medium">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Domain Authority</span>
              <span className="text-sm font-medium">42</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Keywords</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">fireworks online</span>
              <span className="text-sm font-medium">Rank #3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">buy crackers</span>
              <span className="text-sm font-medium">Rank #7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">diwali fireworks</span>
              <span className="text-sm font-medium">Rank #12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">online firework store</span>
              <span className="text-sm font-medium">Rank #15</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Metric Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {metrics.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    selectedMetric === metric.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{metric.icon}</span>
                  <span>{metric.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading performance data...</p>
            </div>
          ) : (
            <div>
              {selectedMetric === 'overview' && renderOverview()}
              {selectedMetric === 'pageSpeed' && renderPageSpeed()}
              {selectedMetric === 'userEngagement' && renderUserEngagement()}
              {selectedMetric === 'conversion' && renderConversionFunnel()}
              {selectedMetric === 'seo' && renderSEO()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
