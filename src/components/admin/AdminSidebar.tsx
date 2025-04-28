
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
  CurrencyIcon,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  subItems?: { name: string; href: string }[];
}

const NavItem = ({ href, icon, children, isActive, subItems }: NavItemProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const hasSubItems = subItems && subItems.length > 0;
  
  return (
    <div className="space-y-1">
      <Link
        to={href}
        className={cn(
          "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
          isActive && !hasSubItems ? "bg-accent text-accent-foreground" : "text-foreground"
        )}
        onClick={(e) => {
          if (hasSubItems) {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="flex items-center">
          <span className="mr-3">{icon}</span>
          <span>{children}</span>
        </div>
        {hasSubItems && (
          <span>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </Link>
      
      {hasSubItems && expanded && (
        <div className="pl-10 space-y-1">
          {subItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                location.pathname === item.href ? "bg-accent/70 text-accent-foreground" : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
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
      icon: <Package className="h-5 w-5" />,
      subItems: [
        { name: 'All Products', href: '/admin/products' },
        { name: 'Import Products', href: '/admin/products-import' }
      ]
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
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r shadow-lg transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Digital Deals</span>
          </Link>
        </div>
        
        <ScrollArea className="flex-1 py-4 h-[calc(100vh-4rem)]">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  isActive={
                    item.subItems 
                      ? location.pathname === item.href || item.subItems.some(sub => location.pathname === sub.href)
                      : location.pathname === item.href
                  }
                  subItems={item.subItems}
                >
                  {item.name}
                </NavItem>
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
    </>
  );
};

export default AdminSidebar;
