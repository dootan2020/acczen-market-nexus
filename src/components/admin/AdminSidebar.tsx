
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  DollarSign,
  Puzzle,
} from 'lucide-react';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminSidebar = ({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
  const { logout } = useAuth();
  const location = useLocation();
  
  // Menu items grouped by category
  const navGroups = [
    {
      name: "Dashboard",
      items: [
        { 
          name: 'Dashboard', 
          href: '/admin', 
          icon: <LayoutDashboard className="h-5 w-5" /> 
        },
      ]
    },
    {
      name: "Content Management",
      items: [
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
      ]
    },
    {
      name: "User Management",
      items: [
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
      ]
    },
    {
      name: "Analytics & Monitoring",
      items: [
        { 
          name: 'Reports', 
          href: '/admin/reports', 
          icon: <BarChart className="h-5 w-5" /> 
        },
        { 
          name: 'API Monitoring', 
          href: '/admin/api-monitoring', 
          icon: <ActivitySquare className="h-5 w-5" /> 
        },
        { 
          name: 'Exchange Rates', 
          href: '/admin/exchange-rates', 
          icon: <DollarSign className="h-5 w-5" /> 
        },
        { 
          name: 'Transactions', 
          href: '/admin/transactions', 
          icon: <DollarSign className="h-5 w-5" /> 
        },
      ]
    },
    {
      name: "System",
      items: [
        { 
          name: 'Integrations', 
          href: '/admin/integrations', 
          icon: <Puzzle className="h-5 w-5" /> 
        },
        { 
          name: 'Settings', 
          href: '/admin/settings', 
          icon: <Settings className="h-5 w-5" /> 
        },
      ]
    }
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
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-white dark:bg-[#202123] shadow-lg transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center px-6 border-b">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#19C37D] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-[#19C37D]">AccZen.net</span>
          </Link>
        </div>
        
        <ScrollArea className="flex-1 py-4 h-[calc(100vh-4rem)]">
          <div className="px-3 py-2">
            {navGroups.map((group, groupIndex) => (
              <div key={group.name} className="mb-4">
                <div className="px-3 mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  {group.name}
                </div>
                
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-[#F7F7F8] dark:hover:bg-[#343541] transition-colors",
                        location.pathname === item.href ? "bg-[#F7F7F8] dark:bg-[#343541] text-[#19C37D]" : "text-foreground"
                      )}
                    >
                      <div className={cn(
                        "mr-3 flex-shrink-0",
                        location.pathname === item.href ? "text-[#19C37D]" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {item.icon}
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
                
                {groupIndex < navGroups.length - 1 && (
                  <Separator className="my-4 mx-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex flex-col gap-1 border-t p-4">
          <Link to="/" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-[#F7F7F8] dark:hover:bg-[#343541]">
            <Home className="h-5 w-5" />
            <span>Back to Site</span>
          </Link>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start gap-2 text-sm font-medium"
            onClick={() => logout()}
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
