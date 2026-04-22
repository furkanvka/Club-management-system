import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Folder, DollarSign, ChevronRight,
  Crown, UserCheck, Building2, Bell, Info, ArrowRight
} from 'lucide-react';
import api from '../../services/api';

// ─── Kulüp Başkanı & Club-Login Dashboard ─────────────────────────────────
const PresidentDashboard = ({ activeClub, loginType }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    if (!activeClub?.id) return;
    api.get(`/clubs/${activeClub.id}/members`)
      .then(r => { setMembers(r.data); setLoadingMembers(false); })
      .catch(() => setLoadingMembers(false));
  }, [activeClub]);

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const isClubAccount = loginType === 'club';

  const cards = [
    { label: 'Üye Yönetimi', icon: Users, path: '/dashboard/members', gradient: 'from-violet-500 to-purple-600', desc: `${totalMembers} üye kayıtlı` },
    { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', gradient: 'from-blue-500 to-cyan-600', desc: 'Etkinlik planla ve takip et' },
    { label: 'Belgeler', icon: Folder, path: '/dashboard/documents', gradient: 'from-emerald-500 to-green-600', desc: 'Tüzük ve dokümanlar' },
    { label: 'Finans', icon: DollarSign, path: '/dashboard/finance', gradient: 'from-amber-500 to-orange-600', desc: 'Bütçe ve harcama takibi' },
  ];

  const bannerGradient = isClubAccount
    ? 'from-violet-700 via-purple-700 to-indigo-800'
    : 'from-purple-600 via-indigo-700 to-blue-800';

  return (
    <div className="space-y-6">
      {/* Onay bekliyor uyarısı */}
      {activeClub?.status === 'PENDING' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <Bell size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Kulüp Onay Bekliyor</p>
            <p className="text-xs text-amber-700 mt-0.5">Başvurunuz sistem yöneticisi tarafından inceleniyor. Onaylanınca üyeler kulübünüzü görebilecek.</p>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className={`bg-gradient-to-br ${bannerGradient} rounded-2xl p-6 text-white relative overflow-hidden`}>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-12 -left-6 w-36 h-36 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            {isClubAccount
              ? <Building2 size={18} className="text-violet-300" />
              : <Crown size={18} className="text-yellow-300" />}
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">
              {isClubAccount ? 'Kulüp Yönetim Girişi' : 'Başkan Paneli'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">{activeClub?.name}</h1>
          <p className="text-sm opacity-60 mt-1">{activeClub?.category}</p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Toplam Üye', value: loadingMembers ? '—' : totalMembers },
              { label: 'Aktif Üye', value: loadingMembers ? '—' : activeMembers },
              {
                label: 'Durum', value: activeClub?.status === 'APPROVED' ? 'Onaylı ✓'
                  : activeClub?.status === 'PENDING' ? 'Beklemede' : 'Reddedildi'
              },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-xl font-extrabold">{s.value}</p>
                <p className="text-xs opacity-60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Son üyeler preview */}
      {!loadingMembers && members.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">Son Eklenen Üyeler</span>
            <button onClick={() => navigate('/dashboard/members')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              Tümünü Gör <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {members.slice(0, 4).map(m => (
              <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {(m.user?.email?.[0] || '?').toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 flex-1 truncate">{m.user?.email || 'Bilinmiyor'}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.role === 'baskan' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {m.role === 'baskan' ? 'Başkan' : 'Üye'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick access cards */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Yönetim Araçları</h2>
        <div className="grid grid-cols-2 gap-3">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={() => navigate(card.path)}
                className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:shadow-md hover:border-indigo-200 transition-all group flex items-center gap-3"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">{card.label}</div>
                  <div className="text-xs text-gray-400 truncate">{card.desc}</div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400 ml-auto shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Öğrenci / Üye Dashboard ───────────────────────────────────────────────
const MemberDashboard = ({ activeClub, user }) => {
  const navigate = useNavigate();
  const [clubInfo, setClubInfo] = useState(activeClub);
  const [memberCount, setMemberCount] = useState(null);

  useEffect(() => {
    if (!activeClub?.id) return;
    api.get(`/clubs/${activeClub.id}/members`)
      .then(r => setMemberCount(r.data.length))
      .catch(() => {});
  }, [activeClub]);

  const cards = [
    { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', gradient: 'from-blue-500 to-cyan-600', desc: 'Yaklaşan etkinlikleri gör' },
    { label: 'Belgeler', icon: Folder, path: '/dashboard/documents', gradient: 'from-emerald-500 to-green-600', desc: 'Kulüp belgelerine eriş' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck size={18} className="text-blue-300" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Üye Paneli</span>
          </div>
          <h1 className="text-3xl font-extrabold">{activeClub?.name}</h1>
          <p className="text-sm opacity-60 mt-1">{activeClub?.category}</p>

          <div className="mt-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xl font-extrabold">
              {(user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <p className="font-bold">{user?.email?.split('@')[0]}</p>
              <p className="text-xs opacity-60">{user?.email}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-lg font-extrabold">{memberCount ?? '—'}</p>
              <p className="text-xs opacity-60">Toplam Üye</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className={`text-sm font-bold ${activeClub?.status === 'APPROVED' ? 'text-green-300' : 'text-yellow-300'}`}>
                {activeClub?.status === 'APPROVED' ? '✓ Aktif' : '⏳ Bekliyor'}
              </p>
              <p className="text-xs opacity-60">Kulüp Durumu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-700">
          Bu kulüpte <strong>üye</strong> olarak görüntülüyorsunuz. Üye yönetimi ve finans bölümlerine erişmek için başkan yetkisi gerekir.
        </p>
      </div>

      {/* Cards */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Erişebileceğiniz Bölümler</h2>
        <div className="grid grid-cols-2 gap-3">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={() => navigate(card.path)}
                className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:shadow-md hover:border-blue-200 transition-all group flex items-center gap-3"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{card.label}</div>
                  <div className="text-xs text-gray-400 truncate">{card.desc}</div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 ml-auto shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Switch club */}
      <div className="text-center">
        <button onClick={() => navigate('/select-club')} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition">
          ← Başka bir kulüp seç
        </button>
      </div>
    </div>
  );
};

// ─── Ana Export ────────────────────────────────────────────────────────────
export const DashboardHome = () => {
  const { activeClub, activeRole, myClubs, selectClub } = useClub();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loginType = user?.loginType || 'user';

  // Kulüp hesabıyla giriş → her zaman başkan paneli
  if (loginType === 'club') {
    return <PresidentDashboard activeClub={activeClub} loginType="club" />;
  }

  // Aktif kulüp seçilmemiş → seçim ekranı
  if (!activeClub) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Building2 size={48} className="text-gray-200" />
        <p className="text-gray-500 font-medium text-lg">Bir kulüp seçmediniz.</p>
        {myClubs.length > 0 ? (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {myClubs.map(c => (
              <button
                key={c.id}
                onClick={() => { selectClub(c, 'uye'); }}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 text-sm font-medium text-gray-700 transition"
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => navigate('/select-club')}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold"
          >
            Kulüp Seç / Katıl
          </button>
        )}
      </div>
    );
  }

  // Başkan ise başkan paneli, üye ise üye paneli
  if (activeRole === 'baskan') {
    return <PresidentDashboard activeClub={activeClub} loginType="user" />;
  }

  return <MemberDashboard activeClub={activeClub} user={user} />;
};
