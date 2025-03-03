import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  isAdmin?: boolean;
  requireAdmin?: boolean;
  children: React.ReactNode;
}

function ProtectedRoute({ 
  isAuthenticated, 
  isAdmin = false, 
  requireAdmin = false, 
  children 
}: ProtectedRouteProps): React.ReactElement {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

export default ProtectedRoute; 