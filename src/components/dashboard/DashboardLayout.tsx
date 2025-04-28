
import React from "react";
import { Outlet } from "react-router-dom";
import { 
  Sidebar,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <DashboardSidebar />
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
