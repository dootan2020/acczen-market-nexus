
import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardHeader() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  const { user } = useAuth();
  
  const getPageTitle = () => {
    if (paths.length === 1 && paths[0] === 'dashboard') return 'Account Overview';
    if (paths.length > 1) {
      const section = paths[1];
      switch (section) {
        case 'purchases': return 'Purchases';
        case 'history': return 'Deposit History';
        case 'settings': return 'Account Settings';
        default: return section.charAt(0).toUpperCase() + section.slice(1);
      }
    }
    return 'Dashboard';
  };
  
  return (
    <div className="border-b">
      <div className="container flex items-center gap-4 h-16">
        <SidebarTrigger />
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {paths.length > 1 && (
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {getPageTitle()}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="hidden md:flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {user ? `Logged in as ${user.email}` : 'Welcome'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
