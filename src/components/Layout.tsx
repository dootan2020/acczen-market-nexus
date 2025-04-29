
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./mobile/BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Check if we're on a page that has its own mobile header
  const hasCustomMobileHeader = ['/cart', '/checkout', '/products'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {(!isMobile || !hasCustomMobileHeader) && <Header />}
      <main className={`flex-1 ${isMobile ? "pb-20" : ""}`}>
        {children || <Outlet />}
      </main>
      {isMobile && <BottomNav />}
      <Footer className={isMobile ? "pb-16" : ""} />
    </div>
  );
};

export default Layout;
