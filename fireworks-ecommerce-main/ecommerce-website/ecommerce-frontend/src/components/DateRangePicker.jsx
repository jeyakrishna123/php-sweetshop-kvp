import React, { useState } from 'react';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';

const DateRangePicker = ({ onDateRangeChange, initialRange = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(initialRange?.startDate || subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(initialRange?.endDate || new Date());
  const [selectedPreset, setSelectedPreset] = useState('');

  const presets = [
    { label: 'Last 7 days', value: '7d', getDates: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
    { label: 'Last 30 days', value: '30d', getDates: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
    { label: 'Last 90 days', value: '90d', getDates: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
    { label: 'Last 6 months', value: '6m', getDates: () => ({ start: subMonths(new Date(), 6), end: new Date() }) },
    { label: 'Last year', value: '1y', getDates: () => ({ start: subYears(new Date(), 1), end: new Date() }) },
    { label: 'This month', value: 'thismonth', getDates: () => ({ start: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), end: endOfDay(new Date()) }) },
    { label: 'Last month', value: 'lastmonth', getDates: () => ({ start: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)), end: endOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 0)) }) }
  ];

  const handlePresetSelect = (preset) => {
    const dates = preset.getDates();
    setStartDate(dates.start);
    setEndDate(dates.end);
    setSelectedPreset(preset.value);
    onDateRangeChange({
      startDate: dates.start,
      endDate: dates.end,
      preset: preset.value
    });
    setIsOpen(false);
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate && startDate <= endDate) {
      setSelectedPreset('');
      onDateRangeChange({
        startDate,
        endDate,
        preset: 'custom'
      });
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (selectedPreset) {
      const preset = presets.find(p => p.value === selectedPreset);
      return preset ? preset.label : 'Custom Range';
    }
    return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDateRange()}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select Date Range</h3>
            
            {/* Preset Options */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick Select</h4>
              <div className="grid grid-cols-2 gap-1">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset)}
                    className={`text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      selectedPreset === preset.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="border-t pt-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Custom Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={format(endDate, 'yyyy-MM-dd')}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleCustomDateChange}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Apply Custom Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
