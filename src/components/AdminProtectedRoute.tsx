
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminProtectedRouteProps {
  element: React.ReactElement;
  redirectTo?: string;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  element, 
  redirectTo = '/login' 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    // Show loading spinner while checking auth status
    return <div>Loading...</div>;
  }
  
  if (!user || user.role !== 'admin') {
    // Redirect if not authenticated or not an admin
    return <Navigate to={redirectTo} replace />;
  }
  
  // Render the protected component if authenticated and admin
  return element;
};

export default AdminProtectedRoute;
