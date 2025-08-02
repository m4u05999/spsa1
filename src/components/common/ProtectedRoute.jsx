// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/index.jsx';

// ProtectedRoute component to handle authentication and role-based access
const ProtectedRoute = ({ requiredRole, requiredPermission }) => {
  const { user, isAuthenticated, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If a specific role is required but user doesn't have it
  if (requiredRole && !hasRole(requiredRole)) {
    // Admin should have access to everything
    if (user.role === 'admin') {
      // Allow admin to access all routes
      return <Outlet />;
    }
    
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'staff') {
      return <Navigate to="/dashboard/staff" replace />;
    } else {
      return <Navigate to="/dashboard/member" replace />;
    }
  }

  // If a specific permission is required but user doesn't have it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Admin already handled in hasPermission function
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'staff') {
      return <Navigate to="/dashboard/staff" replace />;
    } else {
      return <Navigate to="/dashboard/member" replace />;
    }
  }

  // If all checks pass, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;