import React, { useState } from 'react';

const DateFilter = ({ 
  dateFilter, 
  onDateFilterChange, 
  className = "",
  showCustomRange = true,
  showQuickFilters = true 
}) => {
  const [showCustom, setShowCustom] = useState(false);

  const handleDateFilterChange = (type) => {
    console.log('📅 Date filter changing to:', type);
    onDateFilterChange({ ...dateFilter, type });
    if (type === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
    }
  };

  const handleCustomDateChange = (field, value) => {
    onDateFilterChange({ ...dateFilter, [field]: value });
  };

  const clearCustomDates = () => {
    onDateFilterChange({ ...dateFilter, startDate: "", endDate: "" });
  };

  const getDateRangeLabel = () => {
    switch (dateFilter.type) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "custom":
        if (dateFilter.startDate && dateFilter.endDate) {
          return `${new Date(dateFilter.startDate).toLocaleDateString()} - ${new Date(dateFilter.endDate).toLocaleDateString()}`;
        }
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  const getDateIcon = (iconType) => {
    const iconClass = "w-4 h-4 mr-1";
    
    switch (iconType) {
      case "all":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "today":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "week":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "month":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "custom":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Filter by Date
        </h3>
        {dateFilter.type !== "all" && (
          <button
            onClick={() => onDateFilterChange({ type: "all", startDate: "", endDate: "" })}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Quick Filter Buttons */}
      {showQuickFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: "all", label: "All Time", icon: "all" },
            { value: "today", label: "Today", icon: "today" },
            { value: "week", label: "This Week", icon: "week" },
            { value: "month", label: "This Month", icon: "month" },
            ...(showCustomRange ? [{ value: "custom", label: "Custom Range", icon: "custom" }] : [])
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleDateFilterChange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                dateFilter.type === option.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {getDateIcon(option.icon)}
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Current Filter Display */}
      {dateFilter.type !== "all" && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {getDateRangeLabel()}
            </span>
            <div className="text-xs text-blue-600">
              {dateFilter.type === "custom" && dateFilter.startDate && dateFilter.endDate
                ? `${Math.ceil((new Date(dateFilter.endDate) - new Date(dateFilter.startDate)) / (1000 * 60 * 60 * 24))} days`
                : ""}
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Range */}
      {showCustomRange && dateFilter.type === "custom" && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Custom Date Range
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={clearCustomDates}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Clear Dates
            </button>
            <span className="text-sm text-gray-600">
              {dateFilter.startDate && dateFilter.endDate && 
                `Range: ${new Date(dateFilter.startDate).toLocaleDateString()} - ${new Date(dateFilter.endDate).toLocaleDateString()}`
              }
            </span>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {dateFilter.type !== "all" && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-800">
              Filtering data for: <strong>{getDateRangeLabel()}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
