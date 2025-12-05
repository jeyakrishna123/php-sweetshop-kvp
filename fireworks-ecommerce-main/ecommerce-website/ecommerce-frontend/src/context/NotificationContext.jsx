import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { getApiConfig } from '../config/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Skip Socket.IO connection - PHP backend doesn't support WebSockets
    // Real-time notifications can be implemented with polling or server-sent events if needed
    console.log('🔌 Socket.IO disabled - PHP backend does not support WebSockets');
    console.log('💡 Use polling or refresh for real-time updates');
    return;

    // Initialize Socket.IO connection with retry logic
    const connectSocket = () => {
      const apiConfig = getApiConfig();
      console.log('🔌 Connecting to Socket.IO server at:', apiConfig.BASE_URL);
      const newSocket = io(apiConfig.BASE_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to server');
        setIsConnected(true);
        
        // Join admin room
        newSocket.emit('join_admin');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason);
        setIsConnected(false);
      });

      newSocket.on('new_order', (orderData) => {
        console.log('🔔 New order notification received:', orderData);
        
        // Add to notifications list
        const notification = {
          id: Date.now(),
          type: 'new_order',
          title: 'New Order Received',
          message: `Order #${orderData.orderNumber} from ${orderData.customerName}`,
          data: orderData,
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [notification, ...prev]);
        setNewOrderCount(prev => prev + 1);
        
        // Show toast notification
        toast.success(`New Order #${orderData.orderNumber} from ${orderData.customerName}`, {
          duration: 5000,
          position: 'top-right',
          icon: '🔔'
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔌 Reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);
      return newSocket;
    };

    // Connect with a small delay to ensure backend is ready
    const timeoutId = setTimeout(() => {
      const newSocket = connectSocket();
      
      // Cleanup on unmount
      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setNewOrderCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setNewOrderCount(0);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const value = {
    socket,
    isConnected,
    newOrderCount,
    notifications,
    markNotificationAsRead,
    markAllAsRead,
    clearNotifications,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
