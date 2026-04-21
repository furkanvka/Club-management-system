import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Folder, DollarSign, ChevronRight,
  Crown, UserCheck, Building2, Bell, Info, Shield
} from 'lucide-react';
import api from '../../services/api';

// ─── Kulüp Başkanı Dashboard ───────────────────────────────────────────────
const ClubPresidentDashboard = ({ activeClub }) => {
  const navigate = useNavigate();
  const [memberCount, setMemberCount] = useState('—');
  const [clubStatus, setClubStatus] = useState(activeClub?.status);

  useEffect(() => {
    if (activeClub?.id) {
      api.get(`/clubs/${activeClub.id}/members`)
        .then(r => setMemberCount(r.data.length))
        .catch(() => { });
    }
    setClubStatus(activeClub?.status);
  }, [activeClub]);

  const cards = [
    { label: 'Üye Yönetimi', icon: Users, path: '/dashboard/members', color: 'from-purple-500 to-indigo-600', desc: 'Üyeleri görüntüle ve yönet' },
    { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', color: 'from-blue-500 to-cyan-600', desc: 'Etkinlik oluştur ve takip et' },
    { label: 'Belgeler', icon: Folder, path: '/dashboard/documents', color: 'from-green-500 to-emerald-600', desc: 'Kulüp belgelerini yönet' },
    { label: 'Finans', icon: DollarSign, path: '/dashboard/finance', color: 'from-yellow-500 to-orange-600', desc: 'Gelir / gider takibi' },
  ];

  return (
    <div className="space-y-6">
      {/* Status uyarısı */}
      {clubStatus === 'PENDING' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <Bell size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Kulüp Onay Bekliyor</p>
            <p className="text-xs text-amber-700 mt-0.5">Başvurunuz sistem yöneticisi tarafından inceleniyor. Onaylandığında üyeler kulübünüzü görebilecek.</p>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Crown size={20} className="text-yellow-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-200">Başkan Paneli</span>
          </div>
          <h1 className="text-3xl font-extrabold">{activeClub?.name}</h1>
          <p className="text-purple-200 text-sm mt-1">{activeClub?.category}</p>

          <div className="mt-5 flex gap-6">
            <div>
              <p className="text-3xl font-bold">{memberCount}</p>
              <p className="text-xs text-purple-200">Toplam Üye</p>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div>
              <p className={`text-sm font-bold mt-1 px-2 py-1 rounded-lg inline-block ${clubStatus === 'APPROVED' ? 'bg-green-500/30 text-green-200' :
                  clubStatus === 'PENDING' ? 'bg-yellow-500/30 text-yellow-200' : 'bg-red-500/30 text-red-200'
                }`}>
                {clubStatus === 'APPROVED' ? '✓ Onaylandı' : clubStatus === 'PENDING' ? '⏳ Onay Bekliyor' : '✗ Reddedildi'}
              </p>
              <p className="text-xs text-purple-200 mt-1">Kulüp Durumu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Yönetim Araçları</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={() => navigate(card.path)}
                className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-lg hover:border-indigo-200 transition-all group flex items-center gap-4"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-indigo-700">{card.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{card.desc}</div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Öğrenci/Üye Dashboard ────────────────────────────────────────────────
const MemberDashboard = ({ activeClub, user }) => {
  const navigate = useNavigate();

  const cards = [
    { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', color: 'from-blue-500 to-cyan-600', desc: 'Yaklaşan etkinlikleri gör' },
    { label: 'Belgeler', icon: Folder, path: '/dashboard/documents', color: 'from-green-500 to-emerald-600', desc: 'Kulüp belgelerine eriş' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck size={20} className="text-blue-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Üye Paneli</span>
          </div>
          <h1 className="text-3xl font-extrabold">{activeClub?.name || 'Kulübüm'}</h1>
          <p className="text-blue-200 text-sm mt-1">{activeClub?.category}</p>

          <div className="mt-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-sm">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-blue-200">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Bu kulüpte <strong>üye</strong> olarak görüntülüyorsunuz. Yönetim araçlarına erişmek için kulüp başkanı yetkisi gerekir.
        </p>
      </div>

      {/* Cards */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Erişilebilir Bölümler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={() => navigate(card.path)}
                className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-lg hover:border-blue-200 transition-all group flex items-center gap-4"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-blue-700">{card.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{card.desc}</div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Switch club */}
      <div className="text-center pt-2">
        <button
          onClick={() => navigate('/select-club')}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2 transition"
        >
          ← Başka bir kulüp seç
        </button>
      </div>
    </div>
  );
};

// ─── Kulüp Login Dashboard (club girişi) ──────────────────────────────────
const ClubLoginDashboard = ({ activeClub, user }) => {
  const navigate = useNavigate();
  const [memberCount, setMemberCount] = useState('—');

  useEffect(() => {
    if (activeClub?.id) {
      api.get(`/clubs/${activeClub.id}/members`)
        .then(r => setMemberCount(r.data.length))
        .catch(() => { });
    }
  }, [activeClub]);

  const cards = [
    { label: 'Üye Listesi', icon: Users, path: '/dashboard/members', color: 'from-violet-500 to-purple-600', desc: 'Tüm kulüp üyelerini gör' },
    { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', color: 'from-blue-500 to-cyan-600', desc: 'Etkinlik planla ve takip et' },
    { label: 'Belgeler', icon: Folder, path: '/dashboard/documents', color: 'from-green-500 to-emerald-600', desc: 'Tüzük ve belgeler' },
    { label: 'Finans', icon: DollarSign, path: '/dashboard/finance', color: 'from-yellow-500 to-orange-600', desc: 'Bütçe ve harcama takibi' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={20} className="text-violet-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-200">Kulüp Yönetim Girişi</span>
          </div>
          <h1 className="text-3xl font-extrabold">{activeClub?.name || 'Kulübüm'}</h1>
          <p className="text-violet-200 text-sm mt-1">{activeClub?.category}</p>

          <div className="mt-5 flex gap-6">
            <div>
              <p className="text-3xl font-bold">{memberCount}</p>
              <p className="text-xs text-violet-200">Üye Sayısı</p>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div>
              <p className={`text-sm font-bold mt-1 px-2 py-1 rounded-lg inline-block ${activeClub?.status === 'APPROVED' ? 'bg-green-500/30 text-green-200' :
                  'bg-yellow-500/30 text-yellow-200'
                }`}>
                {activeClub?.status === 'APPROVED' ? '✓ Onaylandı' : '⏳ Onay Bekliyor'}
              </p>
              <p className="text-xs text-violet-200 mt-1">Durum</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kulüp Araçları</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={() => navigate(card.path)}
                className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-lg hover:border-violet-200 transition-all group flex items-center gap-4"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-violet-700">{card.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{card.desc}</div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-violet-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Ana DashboardHome ─────────────────────────────────────────────────────
export const DashboardHome = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loginType = user?.loginType || 'user';

  if (!activeClub) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Building2 size={48} className="text-gray-300" />
        <p className="text-gray-500 font-medium">Bir kulüp seçmediniz.</p>
        <button
          onClick={() => navigate('/select-club')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          Kulüp Seç
        </button>
      </div>
    );
  }

  // Kulüp hesabıyla giriş yapıldı → ClubLoginDashboard
  if (loginType === 'club') {
    return <ClubLoginDashboard activeClub={activeClub} user={user} />;
  }

  // Öğrenci girişi + başkan rolü → ClubPresidentDashboard
  if (activeRole === 'baskan') {
    return <ClubPresidentDashboard activeClub={activeClub} />;
  }

  // Öğrenci girişi + üye rolü → MemberDashboard
  return <MemberDashboard activeClub={activeClub} user={user} />;
};
