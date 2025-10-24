import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import ChatbotToggle from './components/ChatbotToggle';
import MobileFooter from './components/MobileFooter';
import AppRoutes from './routes.jsx';

function App() {
  console.log('🚀 App component is rendering!');
  
  // Add mobile footer spacing
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile footer spacing */
      @media (max-width: 1024px) {
        body {
          padding-bottom: 80px;
        }
        
        .mobile-content {
          padding-bottom: 80px;
        }
      }
      
      /* Ensure footer is above other elements */
      .mobile-footer {
        z-index: 1000;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ErrorBoundary>
              <ToastProvider>
                <NotificationProvider>
                  <AppRoutes />
                  <ChatbotToggle />
                  <MobileFooter />
                </NotificationProvider>
              </ToastProvider>
            </ErrorBoundary>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

