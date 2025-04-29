
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  // Add an effect to prevent premature redirects
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        setIsReady(true);
      }, 100);
    }
  }, [isLoading]);
  
  // Show loading state while determining authentication
  if (isLoading || !isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
