import React from 'react';
import { NavLink } from 'react-router-dom';
import { useClub } from '../../store/ClubContext';
import { Home, Users, Calendar, Folder, DollarSign } from 'lucide-react';

export const Sidebar = () => {
  const { activeClub } = useClub();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Members', path: '/dashboard/members', icon: Users },
    { name: 'Events', path: '/dashboard/events', icon: Calendar },
    { name: 'Documents', path: '/dashboard/documents', icon: Folder },
    { name: 'Finance', path: '/dashboard/finance', icon: DollarSign },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-indigo-800 font-bold text-lg">
        {activeClub ? activeClub.name : 'KulüpYönet'}
      </div>
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-indigo-800">
        <div className="flex items-center text-sm font-medium text-indigo-100">
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center mr-3">
            U
          </div>
          <div>
            <p>Profilim</p>
          </div>
        </div>
      </div>
    </div>
  );
};
