
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface AdminNavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  currentPageTitle?: string;
}

export const AdminNavbar = ({ 
  searchQuery, 
  setSearchQuery, 
  sidebarOpen, 
  setSidebarOpen,
  currentPageTitle
}: AdminNavbarProps) => {
  const { userDisplayName } = useAuth();
  const location = useLocation();
  
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
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b shadow-sm">
      <div className="px-4 h-16 flex items-center">
        {/* Left side - Mobile menu button and brand */}
        <div className="flex items-center">
          {setSidebarOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Only show logo on mobile or when sidebar is closed */}
          <Link to="/admin" className="flex items-center gap-2 mr-6 lg:hidden">
            <div className="w-8 h-8 bg-[#19C37D] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-[#19C37D]">AccZen.net</span>
          </Link>
        </div>
        
        {/* Breadcrumb Navigation */}
        {breadcrumbs && (
          <div className="hidden lg:flex items-center flex-1">
            <Breadcrumb className="admin-breadcrumb">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, idx) => (
                  <BreadcrumbItem key={crumb.path} className="admin-breadcrumb-item">
                    {crumb.isCurrentPage ? (
                      <BreadcrumbPage className="admin-breadcrumb-active">
                        {crumb.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link 
                          to={crumb.path} 
                          className="text-[#343541] hover:text-[#19C37D] transition-colors"
                        >
                          {crumb.name}
                        </Link>
                      </BreadcrumbLink>
                    )}
                    {idx < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="admin-breadcrumb-separator">
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
        
        {/* Center - Search bar */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search in admin..."
              className="pl-8 h-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Right side - Notification, theme toggle and user menu */}
        <div className="flex items-center gap-3 ml-auto">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#19C37D] text-[10px] font-medium flex items-center justify-center text-white">
              2
            </span>
          </Button>
          
          <ModeToggle />
          
          <div className="flex items-center gap-3 border-l pl-4 ml-2">
            <Avatar className="h-8 w-8 bg-[#19C37D]/10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-[#19C37D] font-medium">
                {userDisplayName?.slice(0, 2) || 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Admin: {userDisplayName || 'Administrator'}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Using CSS classes directly instead of <style jsx> */}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-breadcrumb {
          display: flex;
          align-items: center;
          margin-left: 1rem;
          font-size: 0.875rem;
          font-family: Inter, sans-serif;
        }
        .admin-breadcrumb-item {
          display: flex;
          align-items: center;
        }
        .admin-breadcrumb-separator {
          margin: 0 0.5rem;
          color: #8E8EA0;
          display: flex;
          align-items: center;
        }
        .admin-breadcrumb-active {
          color: #19C37D;
          font-weight: 500;
        }
      `}} />
    </header>
  );
};

export default AdminNavbar;
