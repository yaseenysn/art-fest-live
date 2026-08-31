import React from 'react';
import { Bell } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-sidebar/90 backdrop-blur-xl border-b border-border-subtle lg:px-8">
      <div className="flex items-center flex-1">
        <h2 className="lg:hidden text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-purple to-primary-pink tracking-tight">
          MADRASA LIVE
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-muted hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-purple rounded-full animate-pulse" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-purple to-primary-pink" />
      </div>
    </header>
  );
}
