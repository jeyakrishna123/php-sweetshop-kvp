import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';

const RealTimeUpdates = ({ onDataUpdate }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // In a real application, you would connect to your WebSocket server
      // For now, we'll simulate real-time updates with polling
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.warn('No authentication token found for WebSocket connection');
        return;
      }

      // Simulate WebSocket connection
      setIsConnected(true);
      startPolling();
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      scheduleReconnect();
    }
  };

  const startPolling = () => {
    // Poll for updates every 30 seconds
    const pollInterval = setInterval(async () => {
      try {
        await fetchRealTimeData();
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
        setIsConnected(false);
        scheduleReconnect();
      }
    }, 30000);

    // Store interval ID for cleanup
    wsRef.current = { close: () => clearInterval(pollInterval) };
  };

  const fetchRealTimeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/admin/reports/realtime', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.hasUpdates) {
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
          
          // Notify parent component of data updates
          if (onDataUpdate) {
            onDataUpdate(data.updates);
          }

          // Show toast notification for important updates
          if (data.updates.newOrders > 0) {
            showToast(`${data.updates.newOrders} new order(s) received`, 'info');
          }
          if (data.updates.lowStock > 0) {
            showToast(`${data.updates.lowStock} product(s) running low on stock`, 'warning');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect...');
      connectWebSocket();
    }, 5000);
  };

  const handleManualRefresh = async () => {
    try {
      await fetchRealTimeData();
      showToast('Data refreshed successfully', 'success');
    } catch (error) {
      showToast('Failed to refresh data', 'error');
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600">
          {isConnected ? 'Live' : 'Disconnected'}
        </span>
      </div>

      {/* Last Update Time */}
      {lastUpdate && (
        <div className="text-sm text-gray-500">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Update Counter */}
      {updateCount > 0 && (
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm text-gray-600">{updateCount} updates</span>
        </div>
      )}

      {/* Manual Refresh Button */}
      <button
        onClick={handleManualRefresh}
        className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title="Refresh data"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Refresh</span>
      </button>

      {/* Auto-refresh Toggle */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isConnected}
          onChange={(e) => {
            if (e.target.checked) {
              connectWebSocket();
            } else {
              if (wsRef.current) {
                wsRef.current.close();
              }
              setIsConnected(false);
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">Auto-refresh</span>
      </label>
    </div>
  );
};

export default RealTimeUpdates;
