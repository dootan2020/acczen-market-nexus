
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export interface PrivateRouteProps {
  element: React.ReactElement;
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  element, 
  redirectTo = '/login' 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    // Show loading spinner while checking auth status
    return <div>Loading...</div>;
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to={redirectTo} replace />;
  }
  
  // Render the protected component if authenticated
  return element;
};

export default PrivateRoute;
