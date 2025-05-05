
import React from "react";
import { Outlet } from "react-router-dom";
import { 
  Sidebar,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import Header from "@/components/Header";

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="flex-1 flex w-full">
        <SidebarProvider defaultOpen>
          <div className="flex flex-1 w-full">
            <Sidebar>
              <DashboardSidebar />
            </Sidebar>
            
            <main className="flex-1 min-w-0 bg-background">
              <DashboardHeader />
              <div className="container p-6">
                {children || <Outlet />}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
