import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import { Home, Users, Calendar, Folder, DollarSign, LogOut, ChevronRight, Briefcase, LayoutGrid } from 'lucide-react';

export const Sidebar = () => {
  const { activeClub, activeRole, myClubs, selectClub } = useClub();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const isBaskan = activeRole === 'baskan';

  const allNavItems = [
    { name: 'Genel Bakış', path: '/dashboard', icon: Home, adminOnly: false },
    { name: 'Etkinlikler', path: '/dashboard/events', icon: Calendar, adminOnly: false },
    { name: 'Projeler', path: '/dashboard/projects', icon: Briefcase, adminOnly: false },
    { name: 'Belgeler', path: '/dashboard/documents', icon: Folder, adminOnly: false },
    { name: 'Ekipler', path: '/dashboard/teams', icon: LayoutGrid, adminOnly: true },
    { name: 'Üye Yönetimi', path: '/dashboard/members', icon: Users, adminOnly: true },
    { name: 'Finans', path: '/dashboard/finance', icon: DollarSign, adminOnly: true },
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || isBaskan);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col min-h-screen">
      {/* Club Name Header */}
      <div className="h-16 flex items-center px-6 border-b border-indigo-800">
        <div>
          <div className="font-bold text-base leading-tight">{activeClub ? activeClub.name : 'KulüpYönet'}</div>
          {activeRole && (
            <div className={`text-xs mt-0.5 font-medium ${isBaskan ? 'text-yellow-300' : 'text-indigo-300'}`}>
              {isBaskan ? '👑 Başkan' : '👤 Üye'}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Switch Club */}
        {myClubs.length > 1 && (
          <div className="mt-6 px-3">
            <p className="text-xs text-indigo-400 uppercase font-semibold px-3 mb-2">Kulüp Değiştir</p>
            {myClubs.map(club => (
              club.id !== activeClub?.id && (
                <button
                  key={club.id}
                  onClick={() => { selectClub(club); navigate('/dashboard'); }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-indigo-200 hover:bg-indigo-800 rounded-md transition"
                >
                  <span className="truncate">{club.name}</span>
                  <ChevronRight size={14} />
                </button>
              )
            ))}
          </div>
        )}
      </div>

      {/* Bottom: Kulüp Seç + Logout */}
      <div className="p-4 border-t border-indigo-800 space-y-2">
        <button
          onClick={() => navigate('/select-club')}
          className="w-full text-left text-xs text-indigo-300 hover:text-white py-1 transition"
        >
          ← Kulüp Seçimine Dön
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-sm text-indigo-200 hover:text-red-300 py-1 transition"
        >
          <LogOut size={16} /> Çıkış Yap
        </button>
      </div>
    </div>
  );
};
