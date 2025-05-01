
import React, { useState, memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from 'react-router-dom';
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
  
  // Navigation items for breadcrumbs
  const navItems = [
    { name: 'AccZen.net', href: '/' },
    { name: 'Admin', href: '/admin' },
    { name: 'Dashboard', href: '/admin' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Import Products', href: '/admin/products-import' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Deposits', href: '/admin/deposits' },
    { name: 'Reports', href: '/admin/reports' },
    { name: 'Integrations', href: '/admin/integrations' },
    { name: 'API Monitoring', href: '/admin/api-monitoring' },
    { name: 'Exchange Rates', href: '/admin/exchange-rates' },
    { name: 'Transactions', href: '/admin/transactions' },
    { name: 'Settings', href: '/admin/settings' },
  ];

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) return null;
    
    const breadcrumbs = [];
    let currentPath = '';
    
    // Add AccZen.net as first item
    breadcrumbs.push({
      name: 'AccZen.net',
      path: '/',
      isCurrentPage: false
    });
    
    // Add Admin as second item if we're in admin section
    if (pathSegments[0] === 'admin') {
      currentPath = `/${pathSegments[0]}`;
      breadcrumbs.push({
        name: 'Admin',
        path: currentPath,
        isCurrentPage: pathSegments.length === 1
      });
      
      // Add additional path segments
      for (let i = 1; i < pathSegments.length; i++) {
        currentPath = `/${pathSegments.slice(0, i + 1).join('/')}`;
        const navItem = navItems.find(item => item.href === currentPath);
        
        if (navItem) {
          breadcrumbs.push({
            name: navItem.name,
            path: currentPath,
            isCurrentPage: i === pathSegments.length - 1
          });
        } else {
          // Handle special cases or dynamic paths
          const segment = pathSegments[i];
          breadcrumbs.push({
            name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            path: currentPath,
            isCurrentPage: i === pathSegments.length - 1
          });
        }
      }
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={cn("flex flex-1 flex-col lg:pl-64")}>
        <AdminNavbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        {/* Breadcrumbs section */}
        <div className="border-b">
          {breadcrumbs && (
            <Breadcrumb className="py-4 px-6">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.path}>
                    <BreadcrumbItem>
                      {crumb.isCurrentPage ? (
                        <BreadcrumbPage className="font-medium text-[#19C37D]">{crumb.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.path} className="text-[#343541] hover:text-[#19C37D] transition-colors">{crumb.name}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
        
        {/* Page title section */}
        <div className="bg-background py-3 px-6 border-b">
          <h1 className="text-2xl font-bold tracking-tight">{getCurrentPageTitle(location.pathname)}</h1>
        </div>
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
});

AdminLayout.displayName = 'AdminLayout';

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
  };

  return titles[pathname as keyof typeof titles] || 'Dashboard';
};

export default AdminLayout;
