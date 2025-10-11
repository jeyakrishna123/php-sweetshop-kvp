import React, { useState } from 'react';

const AdvancedSearchFilter = ({ 
  onSearch, 
  onFilter, 
  onSort, 
  searchPlaceholder = "Search...",
  filterOptions = [],
  sortOptions = [],
  onExport = null,
  onImport = null,
  showBulkActions = false,
  selectedCount = 0,
  onBulkAction = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortBy, setSortBy] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...selectedFilters, [filterKey]: value };
    if (value === '' || value === 'all') {
      delete newFilters[filterKey];
    }
    setSelectedFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSort = (value) => {
    setSortBy(value);
    onSort(value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedFilters({});
    setSortBy('');
    onSearch('');
    onFilter({});
    onSort('');
  };

  const hasActiveFilters = searchTerm || Object.keys(selectedFilters).length > 0 || sortBy;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          🔍 Search & Filter
        </h3>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear All
            </button>
          )}
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAdvanced ? 'Simple' : 'Advanced'} Search
          </button>
        </div>
      </div>

      {/* Basic Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {filterOptions.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                <select
                  value={selectedFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            
            {sortOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Default Order</option>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {showBulkActions && selectedCount > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedCount} selected
              </span>
              <button
                onClick={() => onBulkAction('delete')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => onBulkAction('feature')}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
              >
                ⭐ Feature
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onExport && (
            <button
              onClick={onExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center space-x-1"
            >
              <span>📤</span>
              <span>Export</span>
            </button>
          )}
          
          {onImport && (
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 cursor-pointer flex items-center space-x-1">
              <span>📥</span>
              <span>Import</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={onImport}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchFilter;
