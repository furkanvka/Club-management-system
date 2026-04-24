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
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { activeClub, activeRole, activeMembershipId } = useClub();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [myTeams, setMyTeams] = useState([]);

  // Role identification
  const isBaskan = activeRole === 'baskan' || activeRole === 'KULUP_BASKANI';
  const isLider = activeRole === 'EKIP_LIDERI' || activeRole === 'lider' || activeRole === 'ekip_lideri';
  const isEkipUyesi = activeRole === 'EKIP_UYESI' || activeRole === 'ekip_uyesi';
  const isAtLeastEkip = isBaskan || isLider || isEkipUyesi;

  const [openSections, setOpenSections] = useState({
    'GENEL': true,
    'PROFİL': true,
    'YÖNETİM': true,
    'PROJE & EKİP': true,
    'ETKİNLİK': true,
    'ARŞİV': true,
    'FİNANS': true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  // Grouped items with precise access control
  const sections = [
    {
      label: 'GENEL',
      color: 'text-blue-500',
      items: [
        { name: 'Genel Bakış', path: '/dashboard', icon: Home, access: 'all', iconColor: 'text-blue-500' },
      ]
    },
    {
      label: 'PROFİL',
      color: 'text-indigo-500',
      items: [
        { name: 'Profilim', path: '/dashboard/profile', icon: User, access: 'all', iconColor: 'text-indigo-500' },
      ]
    },
    {
      label: 'YÖNETİM',
      color: 'text-rose-500',
      items: [
        { name: 'Üye Listesi', path: '/dashboard/members', icon: Users, access: 'management', iconColor: 'text-rose-500' },
        { name: 'Ekipler', path: '/dashboard/teams', icon: LayoutGrid, access: 'management', iconColor: 'text-orange-500' },
      ]
    },
    {
      label: 'PROJE & EKİP',
      color: 'text-emerald-500',
      items: [
        { name: 'Projeler', path: '/dashboard/projects', icon: Briefcase, access: 'ekip', iconColor: 'text-emerald-500' },
        { name: 'Toplantı Raporları', path: '/dashboard/meetings', icon: BookOpen, access: 'ekip', iconColor: 'text-teal-500' },
      ]
    },
    {
      label: 'ETKİNLİK',
      color: 'text-amber-500',
      items: [
        { name: 'Etkinlikler', path: '/dashboard/events', icon: Calendar, access: 'all', iconColor: 'text-amber-500' },
      ]
    },
    {
      label: 'ARŞİV',
      color: 'text-purple-500',
      items: [
        { name: 'Tüm Belgeler', path: '/dashboard/documents', icon: Folder, access: 'all', iconColor: 'text-purple-500' },
      ]
    },
    {
      label: 'FİNANS',
      color: 'text-green-600',
      items: [
        { name: 'Finans Raporu', path: '/dashboard/finance', icon: DollarSign, access: 'admin', iconColor: 'text-green-600' },
      ]
    }
  ];

  const hasAccess = (access) => {
    if (access === 'all') return true;
    if (isBaskan) return true;
    if (access === 'management' && (isBaskan || isLider)) return true;
    if (access === 'admin' && isBaskan) return true;
    if (access === 'ekip' && isAtLeastEkip) return true;
    return false;
  };

  const roleLabel = (role) => {
    if (!role) return '';
    const r = role.toLowerCase().replace('-', '_');
    if (r === 'baskan' || r === 'kulup_baskani') return 'Başkan';
    if (r === 'ekip_lideri' || r === 'lider') return 'Ekip Lideri';
    if (r === 'ekip_uyesi') return 'Ekip Üyesi';
    return 'Üye';
  };

  const roleTheme = () => {
    if (isBaskan) return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' };
    if (isLider) return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
    if (isEkipUyesi) return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
    return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
  };

  const theme = roleTheme();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0 font-sans overflow-hidden h-screen shadow-sm">
      {/* Club Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${isBaskan ? 'bg-rose-600' : 'bg-indigo-600'} flex items-center justify-center text-white shadow-lg shadow-indigo-100`}>
          {isBaskan ? <ShieldCheck size={20} /> : <Settings size={20} />}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Kulüp Yönetimi</div>
          <div className="text-sm font-black text-gray-800 truncate uppercase tracking-tight">
            {activeClub ? activeClub.name : 'KulüpYönet'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide space-y-4">
        {sections.map(section => {
          const visibleItems = section.items.filter(item => hasAccess(item.access));
          if (visibleItems.length === 0) return null;

          const isOpen = openSections[section.label];

          return (
            <div key={section.label} className="space-y-1">
              <button 
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-3 py-1 text-gray-400 hover:text-gray-600 transition-colors group"
              >
                <span className={`flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] ${section.color}`}>
                  {section.label}
                  <div className={`h-px flex-1 w-12 bg-gray-100 group-hover:bg-gray-200 transition-all`} />
                </span>
                <span>
                  {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
              </button>
              
              {isOpen && (
                <div className="space-y-0.5">
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/dashboard'}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                          isActive 
                            ? "bg-gray-900 text-white shadow-md shadow-gray-200" 
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`
                      }
                    >
                      <item.icon className={`mr-3 h-4 w-4 transition-colors ${item.iconColor}`} />
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
          <div className="pt-2">
            <div className="px-3 py-1 font-bold text-gray-400 uppercase tracking-widest text-[10px] flex items-center gap-2">
              EKİPLERİM <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="mt-2 px-1 space-y-1">
              {myTeams.map(team => (
                <div key={team.id} className="px-3 py-1.5 text-[12px] text-gray-600 flex items-center gap-3 bg-gray-50 rounded-md border border-gray-100 truncate font-medium">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  {team.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className={`p-3 rounded-xl border ${theme.border} ${theme.bg} flex items-center gap-3 mb-3`}>
          <div className={`w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center font-black ${theme.text} text-sm`}>
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-gray-800 truncate">{user?.email?.split('@')[0]}</div>
            <div className={`text-[9px] font-bold uppercase tracking-wider ${theme.text}`}>{roleLabel(activeRole)}</div>
          </div>
        </div>
        
        <div className="space-y-1">
          <button 
            onClick={() => navigate('/select-club')}
            className="w-full text-left px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-indigo-100"
          >
            KULÜP DEĞİŞTİR
          </button>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg transition-all font-bold border border-transparent hover:border-rose-100"
          >
            <LogOut size={14} /> ÇIKIŞ YAP
          </button>
        </div>
      </div>
    </aside>
  );
};
