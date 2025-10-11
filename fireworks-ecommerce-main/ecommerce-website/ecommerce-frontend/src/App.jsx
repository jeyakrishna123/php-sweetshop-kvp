import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import ChatbotToggle from './components/ChatbotToggle';
import AppRoutes from './routes.jsx';

function App() {
  console.log('🚀 App component is rendering!');
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

