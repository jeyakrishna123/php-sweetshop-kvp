import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

const SecureAdminRoute = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValidAdmin, setIsValidAdmin] = useState(false);

  useEffect(() => {
    const validateAdminSession = async () => {
      if (!user || user.role !== 'admin') {
        setIsValidating(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get('http://localhost:8000/api/auth/verify-admin', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success && response.data.user.role === 'admin') {
          setIsValidAdmin(true);
        } else {
          // Invalid admin session
          await logout();
          setIsValidAdmin(false);
        }
      } catch (error) {
        console.error('Admin session validation failed:', error);
        // Session expired or invalid
        await logout();
        setIsValidAdmin(false);
      } finally {
        setIsValidating(false);
      }
    };

    if (!loading) {
      validateAdminSession();
    }
  }, [user, loading, logout]);

  // Show loading spinner while validating
  if (loading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating admin session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Redirect to home if not admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Redirect to login if admin session is invalid
  if (!isValidAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Render admin content if all checks pass
  return children;
};

export default SecureAdminRoute;
