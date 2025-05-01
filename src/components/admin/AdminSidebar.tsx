
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  CurrencyIcon
} from 'lucide-react';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminSidebar = ({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
  const { signOut } = useAuth();
  const location = useLocation();
  
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
  
  return (
    <>
      {/* Mobile sidebar toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
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
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-background shadow-lg transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-chatgpt-primary">Digital Deals Hub</span>
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
                    location.pathname === item.href ? "bg-chatgpt-primary bg-opacity-10 text-chatgpt-primary" : "text-foreground"
                  )}
                >
                  <div className={cn(
                    "mr-3 flex-shrink-0",
                    location.pathname === item.href ? "text-chatgpt-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
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
            className="flex w-full items-center justify-start gap-2 text-sm font-medium"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
          <div className="mt-3 text-center text-xs text-muted-foreground">
            Version 1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
