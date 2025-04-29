
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Show toast when access is denied
    if (!isLoading && user && !isAdmin) {
      toast.error("Truy cập bị từ chối", {
        description: "Bạn không có quyền truy cập vào trang quản trị",
      });
    }
  }, [isLoading, user, isAdmin]);

  // Add debug logs
  console.log("AdminGuard: isLoading =", isLoading, "user =", !!user, "isAdmin =", isAdmin);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save current path so we can redirect back after login
    localStorage.setItem('previousPath', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
