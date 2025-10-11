import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

const ReportBuilder = ({ isOpen, onClose, onSaveTemplate }) => {
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    sections: [],
    filters: [],
    charts: [],
    format: 'pdf'
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const { showToast } = useToast();

  const availableSections = [
    { id: 'summary', name: 'Executive Summary', icon: '📊', description: 'Key metrics and overview' },
    { id: 'revenue', name: 'Revenue Analysis', icon: '💰', description: 'Revenue trends and breakdown' },
    { id: 'orders', name: 'Order Analysis', icon: '📦', description: 'Order statistics and trends' },
    { id: 'customers', name: 'Customer Analysis', icon: '👥', description: 'Customer demographics and behavior' },
    { id: 'products', name: 'Product Performance', icon: '🛍️', description: 'Product sales and inventory' },
    { id: 'categories', name: 'Category Analysis', icon: '📂', description: 'Category performance metrics' },
    { id: 'inventory', name: 'Inventory Status', icon: '📋', description: 'Stock levels and alerts' },
    { id: 'financial', name: 'Financial Summary', icon: '💳', description: 'P&L and financial metrics' }
  ];

  const availableCharts = [
    { id: 'line', name: 'Line Chart', icon: '📈', description: 'Trend analysis over time' },
    { id: 'bar', name: 'Bar Chart', icon: '📊', description: 'Comparative data visualization' },
    { id: 'pie', name: 'Pie Chart', icon: '🥧', description: 'Proportional data breakdown' },
    { id: 'doughnut', name: 'Doughnut Chart', icon: '🍩', description: 'Circular data representation' },
    { id: 'area', name: 'Area Chart', icon: '📉', description: 'Filled trend visualization' }
  ];

  const availableFilters = [
    { id: 'dateRange', name: 'Date Range', type: 'date' },
    { id: 'categories', name: 'Categories', type: 'multi-select' },
    { id: 'customerSegments', name: 'Customer Segments', type: 'multi-select' },
    { id: 'orderStatus', name: 'Order Status', type: 'multi-select' },
    { id: 'priceRange', name: 'Price Range', type: 'range' },
    { id: 'regions', name: 'Regions', type: 'multi-select' }
  ];

  const handleDragStart = (e, item, type) => {
    setDraggedItem({ ...item, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetType) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (targetType === 'sections' && draggedItem.type === 'section') {
      setTemplate(prev => ({
        ...prev,
        sections: [...prev.sections, draggedItem]
      }));
    } else if (targetType === 'charts' && draggedItem.type === 'chart') {
      setTemplate(prev => ({
        ...prev,
        charts: [...prev.charts, draggedItem]
      }));
    } else if (targetType === 'filters' && draggedItem.type === 'filter') {
      setTemplate(prev => ({
        ...prev,
        filters: [...prev.filters, draggedItem]
      }));
    }

    setDraggedItem(null);
  };

  const removeItem = (type, index) => {
    setTemplate(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const saveTemplate = () => {
    if (!template.name.trim()) {
      showToast('Please enter a template name', 'error');
      return;
    }

    if (template.sections.length === 0) {
      showToast('Please add at least one section to the template', 'error');
      return;
    }

    onSaveTemplate(template);
    showToast('Report template saved successfully', 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Report Builder</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Configuration */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Template Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                      <input
                        type="text"
                        value={template.name}
                        onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter template name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={template.description}
                        onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter template description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Format</label>
                      <select
                        value={template.format}
                        onChange={(e) => setTemplate(prev => ({ ...prev, format: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Available Components */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Available Components</h3>
                  
                  {/* Sections */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sections</h4>
                    <div className="space-y-2">
                      {availableSections.map(section => (
                        <div
                          key={section.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, section, 'section')}
                          className="flex items-center p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
                        >
                          <span className="text-lg mr-2">{section.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{section.name}</div>
                            <div className="text-xs text-gray-500">{section.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Charts</h4>
                    <div className="space-y-2">
                      {availableCharts.map(chart => (
                        <div
                          key={chart.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, chart, 'chart')}
                          className="flex items-center p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
                        >
                          <span className="text-lg mr-2">{chart.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{chart.name}</div>
                            <div className="text-xs text-gray-500">{chart.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Filters</h4>
                    <div className="space-y-2">
                      {availableFilters.map(filter => (
                        <div
                          key={filter.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, filter, 'filter')}
                          className="flex items-center p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
                        >
                          <span className="text-lg mr-2">🔍</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{filter.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{filter.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Preview */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Report Preview</h3>
              
              <div className="space-y-4">
                {/* Sections */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'sections')}
                  className="min-h-32 p-4 border-2 border-dashed border-gray-300 rounded-lg"
                >
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sections</h4>
                  {template.sections.length === 0 ? (
                    <p className="text-sm text-gray-500">Drag sections here</p>
                  ) : (
                    <div className="space-y-2">
                      {template.sections.map((section, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{section.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{section.name}</span>
                          </div>
                          <button
                            onClick={() => removeItem('sections', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Charts */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'charts')}
                  className="min-h-24 p-4 border-2 border-dashed border-gray-300 rounded-lg"
                >
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Charts</h4>
                  {template.charts.length === 0 ? (
                    <p className="text-sm text-gray-500">Drag charts here</p>
                  ) : (
                    <div className="space-y-2">
                      {template.charts.map((chart, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{chart.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{chart.name}</span>
                          </div>
                          <button
                            onClick={() => removeItem('charts', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filters */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'filters')}
                  className="min-h-24 p-4 border-2 border-dashed border-gray-300 rounded-lg"
                >
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Filters</h4>
                  {template.filters.length === 0 ? (
                    <p className="text-sm text-gray-500">Drag filters here</p>
                  ) : (
                    <div className="space-y-2">
                      {template.filters.map((filter, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">🔍</span>
                            <span className="text-sm font-medium text-gray-900">{filter.name}</span>
                          </div>
                          <button
                            onClick={() => removeItem('filters', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={saveTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
