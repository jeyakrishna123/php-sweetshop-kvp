import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import axios from '../axios';

const InactiveCategories = ({ categories, onRefresh }) => {
  const { showToast } = useToast();
  const [requestingReactivation, setRequestingReactivation] = useState({});

  const inactiveCategories = categories.filter(category => !category.isActive);

  const handleRequestReactivation = async (categoryId, categoryName) => {
    try {
      setRequestingReactivation(prev => ({ ...prev, [categoryId]: true }));
      
      const response = await axios.post(`/api/categories/${categoryId}/request-reactivation`);
      
      if (response.data.success) {
        showToast(response.data.message, 'success');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(response.data.message || 'Failed to submit reactivation request');
      }
    } catch (error) {
      console.error('Failed to request category reactivation:', error);
      showToast(error.response?.data?.message || 'Failed to submit reactivation request', 'error');
    } finally {
      setRequestingReactivation(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  if (inactiveCategories.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-yellow-800">
            Temporarily Unavailable Categories
          </h3>
          <p className="text-sm text-yellow-700">
            Some categories are currently unavailable. You can request to reactivate them.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inactiveCategories.map((category) => (
          <div
            key={category._id}
            className="bg-white border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {category.name}
                </h4>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {category.description}
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Inactive
                </span>
              </div>
            </div>
            
            <div className="mt-3">
              <button
                onClick={() => handleRequestReactivation(category._id, category.name)}
                disabled={requestingReactivation[category._id]}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                {requestingReactivation[category._id] ? (
                  <>
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Requesting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Request Reactivation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InactiveCategories;
