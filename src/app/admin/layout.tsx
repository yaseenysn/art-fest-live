"use client";

import { Sidebar } from '@/components/ui/Sidebar';
import { Navbar } from '@/components/ui/Navbar';
import { MobileNav } from '@/components/ui/MobileNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-app text-text-primary overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
