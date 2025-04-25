
import React from "react";
import { useLocation } from "react-router-dom";
import { 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  History, 
  Settings 
} from "lucide-react";

export function DashboardSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      <SidebarHeader className="border-b p-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Overview" isActive={currentPath === "/dashboard"}>
              <a href="/dashboard">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Purchases" isActive={currentPath === "/dashboard/purchases"}>
              <a href="/dashboard/purchases">
                <ShoppingCart className="w-4 h-4" />
                <span>Purchases</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Deposit History" isActive={currentPath === "/dashboard/history"}>
              <a href="/dashboard/history">
                <History className="w-4 h-4" />
                <span>Deposit History</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings" isActive={currentPath === "/dashboard/settings"}>
              <a href="/dashboard/settings">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
