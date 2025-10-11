import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const SmartAlertSystem = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState([]);
  const [alertRules, setAlertRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');
  const [newRule, setNewRule] = useState({
    name: '',
    condition: '',
    threshold: '',
    channel: 'email',
    frequency: 'immediate',
    enabled: true
  });
  const { showToast } = useToast();

  const alertTypes = [
    { id: 'alerts', name: 'Active Alerts', icon: '🚨', description: 'Current alert notifications' },
    { id: 'rules', name: 'Alert Rules', icon: '⚙️', description: 'Configure alert conditions' },
    { id: 'history', name: 'Alert History', icon: '📜', description: 'Past alert notifications' },
    { id: 'channels', name: 'Notification Channels', icon: '📱', description: 'Configure delivery methods' }
  ];

  const notificationChannels = [
    { id: 'email', name: 'Email', icon: '📧', enabled: true },
    { id: 'sms', name: 'SMS', icon: '📱', enabled: false },
    { id: 'push', name: 'Push Notification', icon: '🔔', enabled: true },
    { id: 'slack', name: 'Slack', icon: '💬', enabled: false },
    { id: 'teams', name: 'Microsoft Teams', icon: '👥', enabled: false },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', enabled: true }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
      fetchAlertRules();
    }
  }, [isOpen]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get('/api/admin/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      generateMockAlerts();
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertRules = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.get('/api/admin/alert-rules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAlertRules(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching alert rules:', error);
      generateMockAlertRules();
    }
  };

  const generateMockAlerts = () => {
    const mockAlerts = [
      {
        id: 1,
        type: 'High Sales Volume',
        message: 'Sales exceeded $50,000 in the last hour',
        severity: 'high',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'active',
        channel: 'email',
        acknowledged: false
      },
      {
        id: 2,
        type: 'Low Inventory',
        message: 'Diwali Crackers stock below 10 units',
        severity: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'active',
        channel: 'push',
        acknowledged: false
      },
      {
        id: 3,
        type: 'Customer Churn',
        message: '15 customers cancelled orders in the last 2 hours',
        severity: 'high',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'active',
        channel: 'whatsapp',
        acknowledged: true
      },
      {
        id: 4,
        type: 'Payment Failure',
        message: 'Payment gateway error rate above 5%',
        severity: 'critical',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'resolved',
        channel: 'email',
        acknowledged: true
      }
    ];
    setAlerts(mockAlerts);
  };

  const generateMockAlertRules = () => {
    const mockRules = [
      {
        id: 1,
        name: 'High Sales Alert',
        condition: 'sales > 50000',
        threshold: '50000',
        channel: 'email',
        frequency: 'immediate',
        enabled: true,
        lastTriggered: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 2,
        name: 'Low Stock Alert',
        condition: 'inventory < 10',
        threshold: '10',
        channel: 'push',
        frequency: 'hourly',
        enabled: true,
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 3,
        name: 'Customer Churn Alert',
        condition: 'cancellations > 10',
        threshold: '10',
        channel: 'whatsapp',
        frequency: 'immediate',
        enabled: true,
        lastTriggered: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];
    setAlertRules(mockRules);
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(`/api/admin/alerts/${alertId}/acknowledge`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      
      showToast('Alert acknowledged successfully', 'success');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      showToast('Failed to acknowledge alert', 'error');
    }
  };

  const createAlertRule = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post('/api/admin/alert-rules', newRule, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAlertRules([...alertRules, response.data.data]);
        setNewRule({
          name: '',
          condition: '',
          threshold: '',
          channel: 'email',
          frequency: 'immediate',
          enabled: true
        });
        showToast('Alert rule created successfully', 'success');
      }
    } catch (error) {
      console.error('Error creating alert rule:', error);
      showToast('Failed to create alert rule', 'error');
    }
  };

  const toggleRule = async (ruleId) => {
    try {
      const token = localStorage.getItem("token");
      const rule = alertRules.find(r => r.id === ruleId);
      
      await axios.patch(`/api/admin/alert-rules/${ruleId}`, {
        enabled: !rule.enabled
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAlertRules(alertRules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ));
      
      showToast(`Alert rule ${!rule.enabled ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling rule:', error);
      showToast('Failed to update alert rule', 'error');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border-l-4 ${
            alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
            alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
            alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
            'border-blue-500 bg-blue-50'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span className="text-sm text-gray-600">{alert.type}</span>
                <span className="text-xs text-gray-500">
                  {alert.timestamp.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-800 mb-2">{alert.message}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>Channel: {alert.channel}</span>
                <span>Status: {alert.status}</span>
                {alert.acknowledged && <span className="text-green-600">✓ Acknowledged</span>}
              </div>
            </div>
            {!alert.acknowledged && alert.status === 'active' && (
              <button
                onClick={() => acknowledgeAlert(alert.id)}
                className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Acknowledge
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderAlertRules = () => (
    <div className="space-y-6">
      {/* Create New Rule */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Create New Alert Rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
            <input
              type="text"
              value={newRule.name}
              onChange={(e) => setNewRule({...newRule, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., High Sales Alert"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              value={newRule.condition}
              onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select condition</option>
              <option value="sales >">Sales greater than</option>
              <option value="inventory <">Inventory less than</option>
              <option value="cancellations >">Cancellations greater than</option>
              <option value="payment_failures >">Payment failures greater than</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
            <input
              type="number"
              value={newRule.threshold}
              onChange={(e) => setNewRule({...newRule, threshold: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
            <select
              value={newRule.channel}
              onChange={(e) => setNewRule({...newRule, channel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {notificationChannels.filter(ch => ch.enabled).map(channel => (
                <option key={channel.id} value={channel.id}>{channel.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={newRule.frequency}
              onChange={(e) => setNewRule({...newRule, frequency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immediate</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={createAlertRule}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Rule
            </button>
          </div>
        </div>
      </div>

      {/* Existing Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Alert Rules</h3>
        {alertRules.map((rule) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium">{rule.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {rule.condition} {rule.threshold}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Channel: {rule.channel}</span>
                  <span>Frequency: {rule.frequency}</span>
                  {rule.lastTriggered && (
                    <span>Last triggered: {rule.lastTriggered.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleRule(rule.id)}
                className={`ml-4 px-3 py-1 text-xs rounded ${
                  rule.enabled 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {rule.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderNotificationChannels = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Channels</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notificationChannels.map((channel) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg border-2 ${
              channel.enabled 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{channel.icon}</span>
                <div>
                  <h4 className="font-medium">{channel.name}</h4>
                  <p className={`text-sm ${
                    channel.enabled ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {channel.enabled ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <button
                className={`px-3 py-1 text-xs rounded ${
                  channel.enabled 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-white'
                }`}
              >
                {channel.enabled ? 'Configure' : 'Setup'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Smart Alert System</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {alertTypes.map((type) => (
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
              <p className="mt-2 text-sm text-gray-500">Loading alerts...</p>
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
                {activeTab === 'alerts' && renderAlerts()}
                {activeTab === 'rules' && renderAlertRules()}
                {activeTab === 'channels' && renderNotificationChannels()}
                {activeTab === 'history' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Alert history functionality coming soon...</p>
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

export default SmartAlertSystem;
