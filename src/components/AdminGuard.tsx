
import React, { useEffect, useState, useCallback, memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = memo(({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  // Use useCallback to avoid recreating the function on each render
  const showDeniedToast = useCallback(() => {
    toast.error("Truy cập bị từ chối", {
      description: "Bạn không có quyền truy cập vào trang quản trị",
    });
  }, []);

  useEffect(() => {
    // Only mark as ready when we have completed loading and have determined user state
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  // Show toast when access is denied - only run once when state changes
  useEffect(() => {
    if (isReady && user && !isAdmin) {
      showDeniedToast();
    }
  }, [isReady, user, isAdmin, showDeniedToast]);

  // Show loading state while determining authentication
  if (isLoading || !isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    // Save current path so we can redirect back after login
    localStorage.setItem('previousPath', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is an admin
  return <>{children}</>;
});

AdminGuard.displayName = 'AdminGuard';

export default AdminGuard;
