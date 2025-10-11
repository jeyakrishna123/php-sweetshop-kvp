import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios'; // Added axios import

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  // Simple admin access check
  const validateAdminAccess = useCallback(() => {
    if (!isAuthenticated || !user) {
      navigate('/admin/login', { state: { from: location } });
      return false;
    }

    if (!isAdmin) {
      navigate('/admin/login', { state: { from: location } });
      return false;
    }

    setIsValidating(false);
    return true;
  }, [isAuthenticated, isAdmin, user, navigate, location]);

  useEffect(() => {
    if (!loading) {
      validateAdminAccess();
    }
  }, [loading, validateAdminAccess]);

  // Show loading while validating
  if (loading || isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating admin access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, redirect is handled by validateAdminAccess
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // Render children if validation passes
  return children;
};

export default AdminRoute;
