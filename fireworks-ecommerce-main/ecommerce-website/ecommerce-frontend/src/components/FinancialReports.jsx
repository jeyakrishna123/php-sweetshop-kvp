import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';

const FinancialReports = ({ isOpen, onClose }) => {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState('profitLoss');
  const [dateRange, setDateRange] = useState('monthly');
  const { showToast } = useToast();

  const reportTypes = [
    { id: 'profitLoss', name: 'Profit & Loss', icon: '📊' },
    { id: 'balanceSheet', name: 'Balance Sheet', icon: '⚖️' },
    { id: 'cashFlow', name: 'Cash Flow', icon: '💰' },
    { id: 'taxReport', name: 'Tax Report', icon: '📋' },
    { id: 'costAnalysis', name: 'Cost Analysis', icon: '🔍' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchFinancialData();
    }
  }, [isOpen, selectedReport, dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`/api/admin/reports/financial?type=${selectedReport}&period=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setFinancialData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      showToast('Failed to fetch financial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderProfitLoss = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${financialData?.revenue?.total || '125,430'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Costs</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${financialData?.costs?.total || '89,250'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gross Profit</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${financialData?.profit?.gross || '36,180'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${financialData?.profit?.net || '28,750'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Product Sales</span>
              <span className="text-sm font-medium">$98,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Shipping Revenue</span>
              <span className="text-sm font-medium">$12,800</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service Fees</span>
              <span className="text-sm font-medium">$8,200</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Other Income</span>
              <span className="text-sm font-medium">$5,930</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Total Revenue</span>
                <span className="text-gray-900">$125,430</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cost of Goods Sold</span>
              <span className="text-sm font-medium">$65,200</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Operating Expenses</span>
              <span className="text-sm font-medium">$15,800</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Marketing Costs</span>
              <span className="text-sm font-medium">$4,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Administrative</span>
              <span className="text-sm font-medium">$3,750</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Total Costs</span>
                <span className="text-gray-900">$89,250</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBalanceSheet = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Assets</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Assets</h4>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cash & Equivalents</span>
                  <span className="text-sm font-medium">$45,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accounts Receivable</span>
                  <span className="text-sm font-medium">$12,800</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Inventory</span>
                  <span className="text-sm font-medium">$28,500</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Fixed Assets</h4>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Equipment</span>
                  <span className="text-sm font-medium">$15,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Software</span>
                  <span className="text-sm font-medium">$8,500</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Total Assets</span>
                <span className="text-gray-900">$110,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Liabilities & Equity</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Liabilities</h4>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accounts Payable</span>
                  <span className="text-sm font-medium">$8,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accrued Expenses</span>
                  <span className="text-sm font-medium">$3,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Short-term Debt</span>
                  <span className="text-sm font-medium">$5,000</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Equity</h4>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Owner's Equity</span>
                  <span className="text-sm font-medium">$85,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Retained Earnings</span>
                  <span className="text-sm font-medium">$8,300</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Total Liabilities & Equity</span>
                <span className="text-gray-900">$110,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCashFlow = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Operating Activities</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Net Income</span>
              <span className="text-sm font-medium text-green-600">+$28,750</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Depreciation</span>
              <span className="text-sm font-medium text-green-600">+$2,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Inventory Changes</span>
              <span className="text-sm font-medium text-red-600">-$3,200</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Net Operating Cash</span>
                <span className="text-gray-900">$28,050</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Investing Activities</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Equipment Purchase</span>
              <span className="text-sm font-medium text-red-600">-$5,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Software License</span>
              <span className="text-sm font-medium text-red-600">-$2,500</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Net Investing Cash</span>
                <span className="text-gray-900">-$7,500</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Financing Activities</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Loan Proceeds</span>
              <span className="text-sm font-medium text-green-600">+$10,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Loan Payments</span>
              <span className="text-sm font-medium text-red-600">-$2,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Owner Drawings</span>
              <span className="text-sm font-medium text-red-600">-$5,000</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Net Financing Cash</span>
                <span className="text-gray-900">$3,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Cash Flow Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">$28,050</div>
            <div className="text-sm text-gray-600">Operating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">-$7,500</div>
            <div className="text-sm text-gray-600">Investing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">$3,000</div>
            <div className="text-sm text-gray-600">Financing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">$23,550</div>
            <div className="text-sm text-gray-600">Net Change</div>
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
            <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Report Type Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    selectedReport === report.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{report.icon}</span>
                  <span>{report.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Period Selection */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading financial data...</p>
            </div>
          ) : (
            <div>
              {selectedReport === 'profitLoss' && renderProfitLoss()}
              {selectedReport === 'balanceSheet' && renderBalanceSheet()}
              {selectedReport === 'cashFlow' && renderCashFlow()}
              {selectedReport === 'taxReport' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tax Report functionality coming soon...</p>
                </div>
              )}
              {selectedReport === 'costAnalysis' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cost Analysis functionality coming soon...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
