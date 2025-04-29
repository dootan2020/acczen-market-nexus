
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
      console.log("AdminGuard: Loading complete, setting isReady to true");
      setIsReady(true);
    }
  }, [isLoading]);

  // Show toast when access is denied
  useEffect(() => {
    if (isReady && user && !isAdmin) {
      console.log("AdminGuard: Access denied - user exists but is not admin");
      showDeniedToast();
    }
  }, [isReady, user, isAdmin, showDeniedToast]);

  // Add detailed debug logs
  console.log("AdminGuard state:", {
    isLoading,
    isReady,
    hasUser: !!user, 
    isAdmin,
    path: location.pathname
  });

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
    console.log("AdminGuard: No user, redirecting to login");
    // Save current path so we can redirect back after login
    localStorage.setItem('previousPath', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    console.log("AdminGuard: User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("AdminGuard: Access granted, rendering admin content");
  // User is authenticated and is an admin
  return <>{children}</>;
});

AdminGuard.displayName = 'AdminGuard';

export default AdminGuard;
