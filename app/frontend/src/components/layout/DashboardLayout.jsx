import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans antialiased selection:bg-indigo-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin">
          <div className="animate-fade-in max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
