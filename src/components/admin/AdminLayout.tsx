
import React from 'react';
import { Outlet } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin navigation would go here */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
