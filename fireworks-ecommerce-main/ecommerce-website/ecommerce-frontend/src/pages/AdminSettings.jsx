import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminSettings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Display Settings
    theme: 'light', // light, dark, auto
    primaryColor: 'blue',
    accentColor: 'purple',
    fontSize: 'medium', // small, medium, large
    sidebarCollapsed: false,
    showNotifications: true,
    
    // Dashboard Settings
    dashboardLayout: 'grid', // grid, list, compact
    showQuickStats: true,
    showRecentOrders: true,
    showTopProducts: true,
    showAnalytics: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    orderNotifications: true,
    productNotifications: true,
    systemNotifications: true,
    
    // System Settings
    autoRefresh: true,
    refreshInterval: 30, // seconds
    showTooltips: true,
    confirmActions: true,
    showDebugInfo: false,
    
    // Security Settings
    sessionTimeout: 30, // minutes
    requirePasswordChange: false,
    twoFactorAuth: false,
    loginNotifications: true,
    
    // Data Settings
    itemsPerPage: 10,
    defaultSortOrder: 'newest',
    showInactiveItems: false,
    autoSave: true,
    
    // Advanced Settings
    enableLogging: true,
    logLevel: 'info', // debug, info, warn, error
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true
  });

  // Color themes
  const colorThemes = {
    blue: { name: 'Blue', primary: 'blue-600', accent: 'blue-500' },
    purple: { name: 'Purple', primary: 'purple-600', accent: 'purple-500' },
    green: { name: 'Green', primary: 'green-600', accent: 'green-500' },
    red: { name: 'Red', primary: 'red-600', accent: 'red-500' },
    orange: { name: 'Orange', primary: 'orange-600', accent: 'orange-500' },
    pink: { name: 'Pink', primary: 'pink-600', accent: 'pink-500' },
    indigo: { name: 'Indigo', primary: 'indigo-600', accent: 'indigo-500' },
    teal: { name: 'Teal', primary: 'teal-600', accent: 'teal-500' }
  };

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('adminSettings', JSON.stringify(newSettings));
    showToast('Settings saved successfully!', 'success');
  };

  // Handle setting change
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply primary color
    const primaryColor = colorThemes[settings.primaryColor];
    if (primaryColor) {
      root.style.setProperty('--primary-color', `var(--${primaryColor.primary})`);
      root.style.setProperty('--accent-color', `var(--${primaryColor.accent})`);
    }
    
    // Apply font size
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);
    
  }, [settings.theme, settings.primaryColor, settings.fontSize]);

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultSettings = {
      theme: 'light',
      primaryColor: 'blue',
      accentColor: 'purple',
      fontSize: 'medium',
      sidebarCollapsed: false,
      showNotifications: true,
      dashboardLayout: 'grid',
      showQuickStats: true,
      showRecentOrders: true,
      showTopProducts: true,
      showAnalytics: true,
      emailNotifications: true,
      pushNotifications: true,
      orderNotifications: true,
      productNotifications: true,
      systemNotifications: true,
      autoRefresh: true,
      refreshInterval: 30,
      showTooltips: true,
      confirmActions: true,
      showDebugInfo: false,
      sessionTimeout: 30,
      requirePasswordChange: false,
      twoFactorAuth: false,
      loginNotifications: true,
      itemsPerPage: 10,
      defaultSortOrder: 'newest',
      showInactiveItems: false,
      autoSave: true,
      enableLogging: true,
      logLevel: 'info',
      enableAnalytics: true,
      enableErrorReporting: true,
      enablePerformanceMonitoring: true
    };
    saveSettings(defaultSettings);
  };

  // Export settings
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'admin-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Settings exported successfully!', 'success');
  };

  // Import settings
  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          saveSettings(importedSettings);
          showToast('Settings imported successfully!', 'success');
        } catch (error) {
          showToast('Invalid settings file!', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Customize your admin panel experience with these settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings Categories</h2>
                <nav className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    Display & Theme
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    Dashboard
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    Notifications
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    System
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    Security
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    Data
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    Advanced
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Display & Theme Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Display & Theme</h3>
                
                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: '☀️' },
                        { value: 'dark', label: 'Dark', icon: '🌙' },
                        { value: 'auto', label: 'Auto', icon: '🔄' }
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => handleSettingChange('theme', theme.value)}
                          className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                            settings.theme === theme.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="text-2xl mb-2">{theme.icon}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{theme.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Primary Color
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(colorThemes).map(([key, theme]) => (
                        <button
                          key={key}
                          onClick={() => handleSettingChange('primaryColor', key)}
                          className={`p-3 border-2 rounded-lg text-center transition-all duration-200 ${
                            settings.primaryColor === key
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-${theme.primary}`}></div>
                          <div className="text-xs font-medium text-gray-900 dark:text-white">{theme.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Font Size
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'small', label: 'Small', size: '14px' },
                        { value: 'medium', label: 'Medium', size: '16px' },
                        { value: 'large', label: 'Large', size: '18px' }
                      ].map((size) => (
                        <button
                          key={size.value}
                          onClick={() => handleSettingChange('fontSize', size.value)}
                          className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                            settings.fontSize === size.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{size.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{size.size}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Show Notifications
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Display notification badges and alerts
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showNotifications}
                          onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Show Tooltips
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Display helpful tooltips on hover
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showTooltips}
                          onChange={(e) => handleSettingChange('showTooltips', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dashboard</h3>
                
                <div className="space-y-6">
                  {/* Layout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Dashboard Layout
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'grid', label: 'Grid', icon: '⊞' },
                        { value: 'list', label: 'List', icon: '☰' },
                        { value: 'compact', label: 'Compact', icon: '⊡' }
                      ].map((layout) => (
                        <button
                          key={layout.value}
                          onClick={() => handleSettingChange('dashboardLayout', layout.value)}
                          className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                            settings.dashboardLayout === layout.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="text-2xl mb-2">{layout.icon}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{layout.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dashboard Components */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard Components</h4>
                    
                    {[
                      { key: 'showQuickStats', label: 'Quick Stats', description: 'Show key metrics and statistics' },
                      { key: 'showRecentOrders', label: 'Recent Orders', description: 'Display latest orders' },
                      { key: 'showTopProducts', label: 'Top Products', description: 'Show best-selling products' },
                      { key: 'showAnalytics', label: 'Analytics', description: 'Display charts and graphs' }
                    ].map((component) => (
                      <div key={component.key} className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {component.label}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {component.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[component.key]}
                            onChange={(e) => handleSettingChange(component.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notifications</h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications' },
                    { key: 'orderNotifications', label: 'Order Notifications', description: 'New order alerts' },
                    { key: 'productNotifications', label: 'Product Notifications', description: 'Product updates and alerts' },
                    { key: 'systemNotifications', label: 'System Notifications', description: 'System updates and maintenance' }
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {notification.label}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {notification.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[notification.key]}
                          onChange={(e) => handleSettingChange(notification.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System</h3>
                
                <div className="space-y-6">
                  {/* Auto Refresh */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto Refresh
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Automatically refresh data
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoRefresh}
                        onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Refresh Interval */}
                  {settings.autoRefresh && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Refresh Interval (seconds)
                      </label>
                      <select
                        value={settings.refreshInterval}
                        onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value={10}>10 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>1 minute</option>
                        <option value={300}>5 minutes</option>
                      </select>
                    </div>
                  )}

                  {/* Items Per Page */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Items Per Page
                    </label>
                    <select
                      value={settings.itemsPerPage}
                      onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={5}>5 items</option>
                      <option value={10}>10 items</option>
                      <option value={25}>25 items</option>
                      <option value={50}>50 items</option>
                      <option value={100}>100 items</option>
                    </select>
                  </div>

                  {/* Other System Options */}
                  <div className="space-y-4">
                    {[
                      { key: 'confirmActions', label: 'Confirm Actions', description: 'Ask for confirmation before destructive actions' },
                      { key: 'showDebugInfo', label: 'Show Debug Info', description: 'Display debugging information' },
                      { key: 'autoSave', label: 'Auto Save', description: 'Automatically save changes' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {option.label}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {option.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[option.key]}
                            onChange={(e) => handleSettingChange(option.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Settings Management</h3>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={resetToDefaults}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                  
                  <button
                    onClick={exportSettings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Export Settings
                  </button>
                  
                  <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                    Import Settings
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
