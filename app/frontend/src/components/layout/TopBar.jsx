import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { useClub } from '../../store/ClubContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Crown, 
  UserCheck, 
  Shield, 
  Building2, 
  LogOut, 
  Repeat, 
  Star,
  ChevronRight,
  User
} from 'lucide-react';

export const TopBar = () => {
  const { user, logout } = useAuth();
  const { activeClub, activeRole } = useClub();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const loginType = user?.loginType || 'user';
  const isAdmin = loginType === 'admin';
  const isClub = loginType === 'club';
  const isBaskan = activeRole === 'baskan' || activeRole === 'KULUP_BASKANI';
  const isLider = activeRole === 'EKIP_LIDERI' || activeRole === 'lider' || activeRole === 'ekip_lideri';
  const isEkipUyesi = activeRole === 'EKIP_UYESI' || activeRole === 'ekip_uyesi';

  const getBadge = () => {
    if (isAdmin) return { label: 'Sistem Admini', color: 'bg-red-50 text-red-700 border-red-100', icon: Shield };
    if (isClub) return { label: 'Kulüp Hesabı', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: Building2 };
    if (isBaskan) return { label: 'Başkan', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Crown };
    if (isLider) return { label: 'Ekip Lideri', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Star };
    if (isEkipUyesi) return { label: 'Ekip Üyesi', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: UserCheck };
    return { label: 'Üye', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: User };
  };

  const badge = getBadge();
  const BadgeIcon = badge.icon;

  const getDisplayName = () => {
    if (isClub && activeClub) return activeClub.name;
    return user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.email?.split('@')[0] || 'Kullanıcı');
  };

  // Basic breadcrumb logic
  const pathnames = location.pathname.split('/').filter(x => x);
  const breadcrumbItems = pathnames.map((name, index) => {
    const isLast = index === pathnames.length - 1;
    
    // Friendly names mapping
    const names = {
      dashboard: 'Panel',
      members: 'Üyeler',
      teams: 'Ekipler',
      projects: 'Projeler',
      events: 'Etkinlikler',
      finance: 'Finans',
      profile: 'Profil',
      tasks: 'Görevler',
      documents: 'Belgeler',
      meetings: 'Toplantılar',
      announcements: 'Duyurular',
      reports: 'Raporlar'
    };

    return (
      <React.Fragment key={name}>
        <ChevronRight size={14} className="text-gray-300 mx-1" />
        <span className={`text-sm ${isLast ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
          {names[name] || name.charAt(0).toLocaleUpperCase('tr-TR') + name.slice(1)}
        </span>
      </React.Fragment>
    );
  });

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm/5">
      {/* Left: breadcrumb */}
      <div className="flex items-center">
        <div className="flex items-center gap-1">
          <div 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors group"
          >
            <Building2 size={16} className="text-gray-400 group-hover:text-indigo-600 transition-colors mr-1" />
            <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{activeClub?.name || 'KulüpYönet'}</span>
          </div>
          {breadcrumbItems}
        </div>
      </div>

      {/* Right: user info */}
      <div className="flex items-center gap-6">
        {/* User Info */}
        <div 
          onClick={() => navigate('/dashboard/profile')}
          className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{getDisplayName()}</p>
            <p className="text-[11px] font-medium text-gray-500 leading-none">{user?.email}</p>
          </div>
          
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm transition-transform group-hover:scale-105 cursor-pointer
            ${isAdmin ? 'bg-red-500' : isClub ? 'bg-purple-600' : isBaskan ? 'bg-amber-500' : 'bg-indigo-600'}`}>
            {getDisplayName()[0]?.toLocaleUpperCase('tr-TR')}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {!isAdmin && !isClub && (
            <button
              onClick={() => navigate('/select-club')}
              title="Kulüp Değiştir"
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <Repeat size={18} />
            </button>
          )}

          <button
            onClick={handleLogout}
            title="Çıkış Yap"
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
