// src/app/(dashboard)/layout.tsx
'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { useAppSelector } from '@/hooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-200"
        style={{ marginLeft: sidebarOpen ? '240px' : '0' }}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
