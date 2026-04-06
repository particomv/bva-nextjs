'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner text="Loading academy..." /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
