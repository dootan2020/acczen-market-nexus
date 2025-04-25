import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Menu,
  X,
  LogOut,
  Home,
  Wallet,
  Settings,
  BarChart,
  ActivitySquare,
  Download
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const AdminLayout = () => {
  const { signOut, userDisplayName } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      name: 'Products', 
      href: '/admin/products', 
      icon: <Package className="h-5 w-5" /> 
    },
    { 
      name: 'Import Products', 
      href: '/admin/import-products', 
      icon: <Download className="h-5 w-5" /> 
    },
    { 
      name: 'Categories', 
      href: '/admin/categories', 
      icon: <FolderTree className="h-5 w-5" /> 
    },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: <ShoppingBag className="h-5 w-5" /> 
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      name: 'Deposits', 
      href: '/admin/deposits', 
      icon: <Wallet className="h-5 w-5" /> 
    },
    { 
      name: 'Reports', 
      href: '/admin/reports', 
      icon: <BarChart className="h-5 w-5" /> 
    },
    { 
      name: 'Integrations', 
      href: '/admin/integrations', 
      icon: <Settings className="h-5 w-5" /> 
    },
    { 
      name: 'API Monitoring', 
      href: '/admin/api-monitoring', 
      icon: <ActivitySquare className="h-5 w-5" /> 
    },
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

  return (
    <div className="flex h-screen">
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="shadow-md"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-background shadow-lg transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-center border-b px-4">
          <Link to="/admin" className="flex items-center gap-2 text-xl font-bold text-primary">
            <span>Digital Deals Hub</span>
          </Link>
        </div>
        
        <ScrollArea className="flex-1 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex flex-col gap-1 border-t p-4">
          <Link to="/" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <Home className="h-5 w-5" />
            <span>Back to Site</span>
          </Link>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start gap-2"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      <div className={cn(
        "flex flex-1 flex-col lg:pl-64",
        sidebarOpen ? "lg:ml-0" : ""
      )}>
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 w-full border-b">
          <div className="flex h-14 items-center justify-between px-4">
            {breadcrumbs && (
              <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.path}>
                      <BreadcrumbItem>
                        {crumb.isCurrentPage ? (
                          <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
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
            
            <div className="ml-auto flex items-center gap-2 md:gap-4">
              <div className="hidden md:block text-sm">
                <p className="font-medium">Admin: {userDisplayName}</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
