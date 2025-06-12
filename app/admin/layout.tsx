'use client';

import { useState } from 'react';
import { AdminGuard } from '@/components/providers/AdminGuard';
import { AdminSidebar } from '@/components/ui/admin-sidebar';
import { AdminHeader } from '@/components/ui/admin-header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        
        {/* Main Content Area */}
        <div className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}