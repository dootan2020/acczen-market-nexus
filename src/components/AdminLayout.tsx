
import React, { useState, memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminLayout = memo(() => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoading } = useAuth();
  
  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#19C37D]" />
          <p className="text-muted-foreground">Đang tải trang quản trị...</p>
        </div>
      </div>
    );
  }
  
  const getCurrentPageTitle = (pathname: string) => {
    const titles = {
      '/admin': 'Dashboard',
      '/admin/products': 'Products Management',
      '/admin/products-import': 'Import Products',
      '/admin/categories': 'Categories Management',
      '/admin/orders': 'Orders Management',
      '/admin/users': 'Users Management',
      '/admin/deposits': 'Deposits Management',
      '/admin/reports': 'Reports & Analytics',
      '/admin/integrations': 'Integrations',
      '/admin/api-monitoring': 'API Monitoring',
      '/admin/exchange-rates': 'Exchange Rates Management',
      '/admin/transactions': 'Transactions Management',
      '/admin/settings': 'System Settings',
      '/admin/discount-analytics': 'Discount Analytics',
    };
  
    // Handle dynamic routes
    if (pathname.match(/^\/admin\/products\/edit\/[^/]+$/)) {
      return 'Edit Product';
    }
    if (pathname.match(/^\/admin\/categories\/edit\/[^/]+$/)) {
      return 'Edit Category';
    }
    if (pathname.match(/^\/admin\/orders\/[^/]+$/)) {
      return 'Order Details';
    }
    if (pathname.match(/^\/admin\/deposits\/[^/]+$/)) {
      return 'Deposit Details';
    }

    return titles[pathname as keyof typeof titles] || 'Dashboard';
  };

  const currentPageTitle = getCurrentPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={cn("flex flex-1 flex-col lg:pl-64")}>
        <AdminNavbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentPageTitle={currentPageTitle}
        />
        
        {/* Main content with improved spacing and styling */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-background rounded-lg shadow-sm p-6 mt-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;
