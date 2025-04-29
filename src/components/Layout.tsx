
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./mobile/BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 ${isMobile ? "pb-20" : ""}`}>
        {children || <Outlet />}
      </main>
      {isMobile && <BottomNav />}
      <Footer className={isMobile ? "pb-16" : ""} />
    </div>
  );
};

export default Layout;
