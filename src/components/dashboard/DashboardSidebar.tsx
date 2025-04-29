
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  CreditCard, 
  ReceiptText, 
  Settings, 
  LogOut, 
  BellRing
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      exact: true,
    },
    {
      href: "/dashboard/deposits",
      label: "Deposits",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/purchases",
      label: "Purchases",
      icon: <ReceiptText className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: <BellRing className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">
            Dashboard
          </h2>
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={pathname === route.href && route.exact || 
                           !route.exact && pathname.startsWith(route.href) 
                           ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={route.href}>
                    {route.icon}
                    {route.label}
                  </Link>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
