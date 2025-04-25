
import React from "react";
import { Outlet } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
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
import { DashboardHeader } from "./DashboardHeader";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <h2 className="text-lg font-semibold">Dashboard</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Overview">
                  <a href="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Overview</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Purchases">
                  <a href="/dashboard/purchases">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Purchases</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Deposit History">
                  <a href="/dashboard/history">
                    <History className="w-4 h-4" />
                    <span>Deposit History</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <a href="/dashboard/settings">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 min-w-0">
          <DashboardHeader />
          <div className="container p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
