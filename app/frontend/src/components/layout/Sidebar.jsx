import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Home, 
  Users, 
  Calendar, 
  Folder, 
  DollarSign, 
  LogOut, 
  Briefcase, 
  LayoutGrid, 
  User, 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  Settings,
  ShieldCheck,
  Megaphone,
  CheckSquare,
  Repeat
} from 'lucide-react';

export const Sidebar = () => {
  const { activeClub, activeRole, activeMembershipId } = useClub();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [myTeams, setMyTeams] = useState([]);

  const role = activeRole?.toLowerCase() || '';
  const isBaskan = role === 'baskan' || role === 'kulup_baskani' || user?.loginType === 'club';
  const isLider = role === 'ekip_lideri' || role === 'ekip-lideri' || role === 'lider';
  const isEkipUyesi = role === 'ekip_uyesi';
  const isAtLeastEkip = isBaskan || isLider || isEkipUyesi;

  const [openSections, setOpenSections] = useState({
    'GENEL': true,
    'YÖNETİM': true,
    'PROJE & EKİP': true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const memId = activeMembershipId || localStorage.getItem('activeMembershipId');
    if (activeClub?.id && memId) {
      api.get(`/clubs/${activeClub.id}/teams/my-teams`, { params: { membershipId: memId } })
        .then(r => {
          if (Array.isArray(r.data)) {
            setMyTeams(r.data);
          } else {
            setMyTeams([]);
          }
        })
        .catch(() => setMyTeams([]));
    } else {
      setMyTeams([]);
    }
  }, [activeClub?.id, activeMembershipId]);

  const sections = [
    {
      label: 'GENEL',
      color: 'text-blue-600',
      iconColor: 'text-blue-500',
      activeBg: 'bg-blue-50 text-blue-700 shadow-blue-100/50',
      items: [
        { name: 'Genel Bakış', path: '/dashboard', icon: Home, access: 'all' },
        { name: 'Profilim', path: '/dashboard/profile', icon: User, access: 'all' },
        { name: 'Tüm Görevlerim', path: '/dashboard/tasks', icon: CheckSquare, access: 'all', hideForClub: true },
      ]
    },
    {
      label: 'YÖNETİM',
      color: 'text-purple-600',
      iconColor: 'text-purple-500',
      activeBg: 'bg-purple-50 text-purple-700 shadow-purple-100/50',
      items: [
        { name: 'Üye Listesi', path: '/dashboard/members', icon: Users, access: 'management' },
        { name: 'Ekipler', path: '/dashboard/teams', icon: LayoutGrid, access: 'management' },
        { name: 'Finans Raporu', path: '/dashboard/finance', icon: DollarSign, access: 'admin' },
      ]
    },
    {
      label: 'PROJE & ETKİNLİK',
      color: 'text-amber-600',
      iconColor: 'text-amber-500',
      activeBg: 'bg-amber-50 text-amber-700 shadow-amber-100/50',
      items: [
        { name: 'Projeler', path: '/dashboard/projects', icon: Briefcase, access: 'ekip' },
        { name: 'Etkinlikler', path: '/dashboard/events', icon: Calendar, access: 'all' },
        { name: 'Toplantı Duyuruları', path: '/dashboard/meetings/announcements', icon: Megaphone, access: 'ekip' },
        { name: 'Toplantı Raporları', path: '/dashboard/meetings/reports', icon: BookOpen, access: 'ekip' },
      ]
    },
    {
      label: 'ARŞİV',
      color: 'text-emerald-600',
      iconColor: 'text-emerald-500',
      activeBg: 'bg-emerald-50 text-emerald-700 shadow-emerald-100/50',
      items: [
        { name: 'Tüm Belgeler', path: '/dashboard/documents', icon: Folder, access: 'all' },
      ]
    }
  ];

  const hasAccess = (item) => {
    if (item.hideForClub && user?.loginType === 'club') return false;
    if (item.path === '/dashboard/tasks' && isBaskan) return false;
    const access = item.access;
    if (access === 'all') return true;
    if (isBaskan) return true;
    if (access === 'management' && (isBaskan || isLider)) return true;
    if (access === 'admin' && isBaskan) return true;
    if (access === 'ekip' && isAtLeastEkip) return true;
    return false;
  };

  const getRoleLabel = () => {
    if (isBaskan) return 'Başkan';
    if (isLider) return 'Ekip Lideri';
    if (isEkipUyesi) return 'Ekip Üyesi';
    return 'Üye';
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0 h-screen shadow-sm transition-all duration-300">
      {/* Club Header */}
      <div 
        onClick={() => navigate('/dashboard')}
        className="h-16 px-6 border-b border-gray-100 flex items-center gap-3 bg-white sticky top-0 z-10 cursor-pointer hover:bg-gray-50 transition-colors group"
      >
        <div className={`w-8 h-8 rounded-lg ${isBaskan ? 'bg-indigo-600 group-hover:bg-indigo-700' : 'bg-gray-800 group-hover:bg-gray-900'} flex items-center justify-center text-white transition-colors`}>
          {isBaskan ? <ShieldCheck size={18} /> : <Settings size={18} />}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1 group-hover:text-indigo-500 transition-colors">Kulüp Yönetimi</div>
          <div className="text-sm font-bold text-gray-900 truncate leading-none group-hover:text-indigo-600 transition-colors">
            {activeClub ? activeClub.name : 'KulüpYönet'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
        {sections.map(section => {
          const visibleItems = section.items.filter(item => hasAccess(item));
          if (visibleItems.length === 0) return null;

          const isOpen = openSections[section.label] !== false;

          return (
            <div key={section.label} className="space-y-3">
              <button 
                onClick={() => toggleSection(section.label)}
                className={`w-full flex items-center justify-between px-2 py-1 transition-all duration-200 group ${section.color}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">
                  {section.label}
                </span>
                <span className="opacity-50 group-hover:opacity-100">
                  {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
              </button>
              
              {isOpen && (
                <div className="space-y-1 px-1">
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/dashboard'}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive 
                            ? `${section.activeBg} shadow-sm` 
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`
                      }
                    >
                      <item.icon className={`mr-3 h-4 w-4 transition-colors ${section.iconColor}`} />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* My Teams Section */}
        {myTeams.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              EKİPLERİM
            </div>
            <div className="space-y-2">
              {myTeams.map(team => (
                <div key={team.id} className="group flex items-center gap-3 px-3 py-2 bg-gray-50/50 rounded-lg border border-transparent hover:border-gray-100 hover:bg-white transition-all cursor-default">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-xs font-semibold text-gray-700 truncate">{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div 
          onClick={() => navigate('/dashboard/profile')}
          className="flex items-center gap-3 px-2 mb-4 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-indigo-600 group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-all">
            {user?.email?.[0].toLocaleUpperCase('tr-TR') || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{user?.email?.split('@')[0]}</div>
            <div className="text-[11px] font-medium text-gray-500">{getRoleLabel()}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {user?.loginType !== 'club' && (
            <button 
              onClick={() => navigate('/select-club')}
              title="Kulüp Değiştir"
              className="flex items-center justify-center p-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-indigo-100"
            >
              <Repeat size={18} />
            </button>
          )}
          <button 
            onClick={() => { logout(); navigate('/'); }}
            title="Çıkış Yap"
            className={`flex items-center justify-center p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100 ${user?.loginType === 'club' ? 'col-span-2' : ''}`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
