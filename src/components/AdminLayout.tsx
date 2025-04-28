
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
  Import,
  CurrencyIcon,
  BellIcon,
  Search
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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from '@/components/mode-toggle';

const AdminLayout = () => {
  const { signOut, userDisplayName } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      href: '/admin/products-import', 
      icon: <Import className="h-5 w-5" /> 
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
    { 
      name: 'Exchange Rates', 
      href: '/admin/exchange-rates', 
      icon: <CurrencyIcon className="h-5 w-5" /> 
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

  // Get the current page title
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const navItem = navItems.find(item => item.href === currentPath);
    return navItem ? navItem.name : 'Dashboard';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar toggle button */}
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
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-background shadow-lg transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Digital Deals Hub</span>
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
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                    location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
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

      {/* Main content */}
      <div className={cn(
        "flex flex-1 flex-col lg:pl-64",
      )}>
        {/* Admin Navbar */}
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 w-full border-b shadow-sm">
          <div className="px-4 h-16 flex items-center justify-between">
            {/* Left side - Breadcrumbs and page title */}
            <div className="flex items-center space-x-4">
              <div className="font-semibold text-lg hidden md:block">Admin</div>
              {breadcrumbs && (
                <Breadcrumb className="hidden md:flex">
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
            </div>
            
            {/* Right side - Search bar, notification and user menu */}
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search in admin..."
                  className="pl-8 h-9 md:w-[200px] lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium flex items-center justify-center text-white">
                  2
                </span>
              </Button>
              
              <ModeToggle />
              
              <div className="flex items-center gap-3 border-l pl-4 ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Admin: {userDisplayName || 'Administrator'}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page header with title */}
        <div className="border-b bg-background py-4 px-6">
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
