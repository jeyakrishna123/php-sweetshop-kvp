import React, { useState } from 'react';

const ScheduledReports = ({ isOpen, onClose }) => {
  const [scheduledReports] = useState([
    {
      id: 'sched-1',
      name: 'Daily Sales Summary',
      type: 'sales',
      frequency: 'daily',
      time: '09:00',
      email: 'admin@example.com',
      format: 'pdf',
      enabled: true
    },
    {
      id: 'sched-2',
      name: 'Weekly Inventory Report',
      type: 'inventory',
      frequency: 'weekly',
      time: '08:00',
      email: 'manager@example.com',
      format: 'excel',
      enabled: true
    }
  ]);

  const toggleReport = (id) => {
    // In a real app, this would update the database
    console.log('Toggling report:', id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Scheduled Reports</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {report.type}</span>
                      <span>Frequency: {report.frequency}</span>
                      <span>Time: {report.time}</span>
                      <span>Email: {report.email}</span>
                      <span>Format: {report.format}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={report.enabled}
                        onChange={() => toggleReport(report.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enabled</span>
                    </label>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Add New Scheduled Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledReports;