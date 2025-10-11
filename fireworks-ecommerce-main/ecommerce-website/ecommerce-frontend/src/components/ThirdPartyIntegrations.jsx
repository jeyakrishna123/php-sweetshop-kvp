import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThirdPartyIntegrations = ({ isOpen, onClose }) => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const { showToast } = useToast();

  const integrationTypes = [
    { id: 'analytics', name: 'Analytics', icon: '📊', description: 'Google Analytics, Facebook Pixel' },
    { id: 'marketing', name: 'Marketing', icon: '📢', description: 'Facebook Ads, Google Ads' },
    { id: 'crm', name: 'CRM', icon: '👥', description: 'HubSpot, Salesforce' },
    { id: 'email', name: 'Email Marketing', icon: '📧', description: 'Mailchimp, SendGrid' },
    { id: 'social', name: 'Social Media', icon: '📱', description: 'Instagram, Twitter API' },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛒', description: 'Shopify, WooCommerce' }
  ];

  const availableIntegrations = {
    analytics: [
      { id: 'google-analytics', name: 'Google Analytics', status: 'connected', description: 'Website traffic and user behavior tracking' },
      { id: 'facebook-pixel', name: 'Facebook Pixel', status: 'disconnected', description: 'Facebook conversion tracking' },
      { id: 'hotjar', name: 'Hotjar', status: 'disconnected', description: 'User session recordings and heatmaps' }
    ],
    marketing: [
      { id: 'facebook-ads', name: 'Facebook Ads', status: 'connected', description: 'Social media advertising campaigns' },
      { id: 'google-ads', name: 'Google Ads', status: 'disconnected', description: 'Search and display advertising' },
      { id: 'tiktok-ads', name: 'TikTok Ads', status: 'disconnected', description: 'Short-form video advertising' }
    ],
    crm: [
      { id: 'hubspot', name: 'HubSpot', status: 'disconnected', description: 'Customer relationship management' },
      { id: 'salesforce', name: 'Salesforce', status: 'disconnected', description: 'Enterprise CRM platform' },
      { id: 'pipedrive', name: 'Pipedrive', status: 'disconnected', description: 'Sales pipeline management' }
    ],
    email: [
      { id: 'mailchimp', name: 'Mailchimp', status: 'connected', description: 'Email marketing automation' },
      { id: 'sendgrid', name: 'SendGrid', status: 'connected', description: 'Transactional email service' },
      { id: 'constant-contact', name: 'Constant Contact', status: 'disconnected', description: 'Email marketing platform' }
    ],
    social: [
      { id: 'instagram', name: 'Instagram API', status: 'disconnected', description: 'Instagram content and insights' },
      { id: 'twitter', name: 'Twitter API', status: 'disconnected', description: 'Twitter social media management' },
      { id: 'linkedin', name: 'LinkedIn API', status: 'disconnected', description: 'Professional networking platform' }
    ],
    ecommerce: [
      { id: 'shopify', name: 'Shopify', status: 'disconnected', description: 'E-commerce platform integration' },
      { id: 'woocommerce', name: 'WooCommerce', status: 'disconnected', description: 'WordPress e-commerce plugin' },
      { id: 'magento', name: 'Magento', status: 'disconnected', description: 'Enterprise e-commerce platform' }
    ]
  };

  useEffect(() => {
    if (isOpen) {
      fetchIntegrations();
    }
  }, [isOpen, activeTab]);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`/api/admin/integrations?type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setIntegrations(response.data.data);
      } else {
        // Use mock data if API fails
        setIntegrations(availableIntegrations[activeTab] || []);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setIntegrations(availableIntegrations[activeTab] || []);
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (integrationId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(`/api/admin/integrations/${integrationId}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showToast('Integration connected successfully', 'success');
        fetchIntegrations();
      }
    } catch (error) {
      console.error('Error connecting integration:', error);
      showToast('Failed to connect integration', 'error');
    }
  };

  const disconnectIntegration = async (integrationId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(`/api/admin/integrations/${integrationId}/disconnect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showToast('Integration disconnected successfully', 'success');
        fetchIntegrations();
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      showToast('Failed to disconnect integration', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderIntegrations = () => (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <motion.div
          key={integration.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow border"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold">{integration.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                  {integration.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
              
              {integration.status === 'connected' && (
                <div className="space-y-2">
                  <div className="text-sm text-green-600">✓ Connected</div>
                  <div className="text-xs text-gray-500">
                    Last sync: {new Date().toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="ml-4">
              {integration.status === 'connected' ? (
                <button
                  onClick={() => disconnectIntegration(integration.id)}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => connectIntegration(integration.id)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Connect
                </button>
              )}
            </div>
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
            <h2 className="text-xl font-semibold text-gray-900">Third-Party Integrations</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Integration Type Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {integrationTypes.map((type) => (
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
              <p className="mt-2 text-sm text-gray-500">Loading integrations...</p>
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
                {renderIntegrations()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThirdPartyIntegrations;
