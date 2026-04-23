import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { Home, Users, Calendar, Folder, DollarSign, LogOut, ChevronRight, Briefcase, LayoutGrid, User, BookOpen } from 'lucide-react';

export const Sidebar = () => {
  const { activeClub, activeRole, activeMembershipId, myClubs, selectClub } = useClub();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [myTeams, setMyTeams] = useState([]);

  const isBaskan = activeRole === 'baskan';
  const isLider = activeRole === 'ekip_lideri' || activeRole === 'ekip-lideri';

  useEffect(() => {
    const memId = activeMembershipId || localStorage.getItem('activeMembershipId');
    if (activeClub?.id && memId) {
      api.get(`/clubs/${activeClub.id}/teams/my-teams`, { params: { membershipId: memId } })
        .then(r => setMyTeams(r.data))
        .catch(() => setMyTeams([]));
    } else {
      setMyTeams([]);
    }
  }, [activeClub?.id, activeMembershipId]);

  const allNavItems = [
    { name: 'Genel Bakış', path: '/dashboard', icon: Home, access: 'all' },
    { name: 'Profilim', path: '/dashboard/profile', icon: User, access: 'all' },
    { name: 'Etkinlikler', path: '/dashboard/events', icon: Calendar, access: 'all' },
    { name: 'Toplantı Raporları', path: '/dashboard/meetings', icon: BookOpen, access: 'all' },
    { name: 'Projeler', path: '/dashboard/projects', icon: Briefcase, access: 'all' },
    { name: 'Belgeler', path: '/dashboard/documents', icon: Folder, access: 'all' },
    { name: 'Ekipler', path: '/dashboard/teams', icon: LayoutGrid, access: 'management' },
    { name: 'Üye Yönetimi', path: '/dashboard/members', icon: Users, access: 'admin' },
    { name: 'Finans', path: '/dashboard/finance', icon: DollarSign, access: 'admin' },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.access === 'all') return true;
    if (isBaskan) return true;
    if (item.access === 'management' && (isBaskan || isLider)) return true;
    return false;
  });

  const roleLabel = (role) => {
    const r = (role || '').toLowerCase().replace('-', '_');
    if (r === 'baskan') return '👑 Başkan';
    if (r === 'ekip_lideri') return '⭐ Ekip Lideri';
    if (r === 'ekip_uyesi') return '🛡️ Ekip Üyesi';
    return '👤 Üye';
  };

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-indigo-800">
        <div>
          <div className="font-bold text-base leading-tight">{activeClub ? activeClub.name : 'KulüpYönet'}</div>
          {activeRole && (
            <div className={`text-[10px] mt-0.5 font-black uppercase tracking-wider ${isBaskan ? 'text-yellow-300' : isLider ? 'text-amber-300' : 'text-indigo-300'}`}>
              {roleLabel(activeRole)}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 py-6 overflow-y-auto scrollbar-hide">
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

        {myTeams.length > 0 && (
          <div className="mt-8 px-3">
            <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest px-3 mb-3">Ekiplerim</p>
            <div className="space-y-1">
              {myTeams.map(team => (
                <div key={team.id} className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-indigo-200 hover:text-white hover:bg-indigo-800/50 rounded-lg transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  <span className="truncate">{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-indigo-800 space-y-2">
        <button onClick={() => navigate('/select-club')} className="w-full text-left text-xs text-indigo-300 hover:text-white py-1">← Kulüp Değiştir</button>
        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2 text-sm text-indigo-200 hover:text-red-300 py-1"><LogOut size={16} /> Çıkış Yap</button>
      </div>
    </div>
  );
};
