
import React, { useState } from 'react';
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

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation items for breadcrumb generation
  const navItems = [
    { name: 'Dashboard', href: '/admin', },
    { name: 'Products', href: '/admin/products', },
    { name: 'Import Products', href: '/admin/products-import', },
    { name: 'Categories', href: '/admin/categories', },
    { name: 'Orders', href: '/admin/orders', },
    { name: 'Users', href: '/admin/users', },
    { name: 'Deposits', href: '/admin/deposits', },
    { name: 'Reports', href: '/admin/reports', },
    { name: 'Integrations', href: '/admin/integrations', },
    { name: 'API Monitoring', href: '/admin/api-monitoring', },
    { name: 'Exchange Rates', href: '/admin/exchange-rates', },
  ];

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) return null;
    
    if (pathSegments[0] !== 'admin') return null;

    const breadcrumbs = [];
    let currentPath = '';
    
    breadcrumbs.push({
      name: 'Admin',
      path: '/admin',
      isCurrentPage: pathSegments.length === 1
    });
    
    for (let i = 1; i < pathSegments.length; i++) {
      currentPath = `/${pathSegments.slice(0, i + 1).join('/')}`;
      const navItem = navItems.find(item => item.href === currentPath);
      
      if (navItem) {
        breadcrumbs.push({
          name: navItem.name,
          path: currentPath,
          isCurrentPage: i === pathSegments.length - 1
        });
      }
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();

  // Get the current page title
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const navItem = navItems.find(item => item.href === currentPath);
    return navItem ? navItem.name : 'Dashboard';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className={cn("flex flex-1 flex-col lg:pl-64")}>
        {/* Admin Navbar */}
        <AdminNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        {/* Breadcrumbs and Page Title */}
        <div className="bg-background py-4 px-6 border-b">
          {breadcrumbs && (
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.path}>
                    <BreadcrumbItem>
                      {crumb.isCurrentPage ? (
                        <BreadcrumbPage className="font-medium">{crumb.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.path} className="cursor-pointer" asChild>
                          <Link to={crumb.path}>{crumb.name}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{getCurrentPageTitle()} {location.pathname === '/admin/products' && 'Management'}</h1>
        </div>
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
