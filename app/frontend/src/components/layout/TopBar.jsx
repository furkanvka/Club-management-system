import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { useClub } from '../../store/ClubContext';
import { useNavigate } from 'react-router-dom';
import { Crown, UserCheck, Shield, Building2, LogOut, ArrowLeftRight, Star } from 'lucide-react';

export const TopBar = () => {
  const { user, logout } = useAuth();
  const { activeClub, activeRole } = useClub();
  const navigate = useNavigate();

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
    if (isAdmin) return { label: 'Sistem Admini', color: 'bg-red-100 text-red-700', icon: Shield };
    if (isClub) return { label: 'Kulüp Girişi', color: 'bg-purple-100 text-purple-700', icon: Building2 };
    if (isBaskan) return { label: 'Başkan', color: 'bg-yellow-100 text-yellow-700', icon: Crown };
    if (isLider) return { label: 'Ekip Lideri', color: 'bg-amber-100 text-amber-700', icon: Star };
    if (isEkipUyesi) return { label: 'Ekip Üyesi', color: 'bg-emerald-100 text-emerald-700', icon: UserCheck };
    return { label: 'Üye', color: 'bg-blue-100 text-blue-700', icon: UserCheck };
  };

  const badge = getBadge();
  const BadgeIcon = badge.icon;

  const getDisplayName = () => {
    if (isClub && activeClub) return activeClub.name;
    return user?.email?.split('@')[0] || 'Kullanıcı';
  };

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 shadow-sm shrink-0">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {activeClub && (
          <>
            <span className="font-semibold text-gray-800">{activeClub.name}</span>
            <span className="text-gray-300">/</span>
          </>
        )}
        <span>Dashboard</span>
      </div>

      {/* Right: user info */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${badge.color}`}>
          <BadgeIcon size={12} />
          {badge.label}
        </span>

        {/* Avatar + Name */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm
            ${isAdmin ? 'bg-red-500' : isClub ? 'bg-purple-600' : isBaskan ? 'bg-yellow-500' : 'bg-indigo-500'}`}>
            {getDisplayName()[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{getDisplayName()}</p>
            <p className="text-xs text-gray-400 leading-tight">{user?.email}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Switch Club button (if user) */}
        {!isAdmin && !isClub && (
          <button
            onClick={() => navigate('/select-club')}
            title="Kulüp Değiştir"
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          >
            <ArrowLeftRight size={16} />
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Çıkış Yap"
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
