
import React from 'react';
import { Outlet } from 'react-router-dom';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin navigation would go here */}
      <main className="p-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
