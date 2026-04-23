import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Folder, DollarSign, ChevronRight,
  Crown, UserCheck, Building2, Bell, Info, ArrowRight,
  Briefcase, LayoutGrid, Star, Target, TrendingUp
} from 'lucide-react';
import api from '../../services/api';

// ─── Liderlik & Başkanlık Dashboard (Yönetim Paneli) ──────────────────────
const PresidentDashboard = ({ activeClub, loginType, activeRole, activeMembershipId }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const isBaskan = activeRole === 'baskan' || loginType === 'club';

  useEffect(() => {
    if (!activeClub?.id) return;
    setLoading(true);

    const memId = activeMembershipId || localStorage.getItem('activeMembershipId');
    const requests = [api.get(`/clubs/${activeClub.id}/members`)];
    
    if (memId) {
        requests.push(api.get(`/clubs/${activeClub.id}/teams/my-teams`, { params: { membershipId: memId } }));
    }

    Promise.all(requests)
      .then(([membersRes, teamsRes]) => {
        setMembers(membersRes.data);
        if (teamsRes) setMyTeams(teamsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeClub, activeMembershipId]);

  const allCards = [
    { label: 'Üye Yönetimi', icon: Users, path: '/dashboard/members', gradient: 'from-violet-500 to-purple-600', desc: 'Topluluk üyelerini yönet', role: 'admin' },
    { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', gradient: 'from-blue-500 to-cyan-600', desc: 'Etkinlikleri takip et', role: 'all' },
    { label: 'Projeler', icon: Briefcase, path: '/dashboard/projects', gradient: 'from-indigo-500 to-blue-600', desc: 'Görevleri yönet', role: 'all' },
    { label: 'Ekipler', icon: LayoutGrid, path: '/dashboard/teams', gradient: 'from-amber-500 to-orange-600', desc: 'Ekip performansını gör', role: 'all' },
    { label: 'Finans', icon: DollarSign, path: '/dashboard/finance', gradient: 'from-emerald-500 to-green-600', desc: 'Bütçe takibi', role: 'admin' },
  ];

  const cards = allCards.filter(c => c.role === 'all' || (c.role === 'admin' && isBaskan));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className={`bg-gradient-to-br ${isBaskan ? 'from-indigo-700 via-purple-700 to-indigo-900' : 'from-amber-600 via-orange-700 to-red-700'} rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl">
                {isBaskan ? <Crown size={20} className="text-yellow-300" /> : <Star size={20} className="text-amber-200" />}
            </div>
            <span className="text-xs font-black uppercase tracking-widest opacity-80">
              {isBaskan ? 'Yönetim Merkezi' : 'Liderlik Paneli'}
            </span>
          </div>
          
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-4">{activeClub?.name}</h1>
            <p className="text-lg opacity-70 font-medium">{isBaskan ? 'Kulübünüzü ve tüm operasyonları buradan kontrol edin.' : 'Ekibinizin performansını ve projelerini yönetin.'}</p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl px-6 py-4 border border-white/10">
                <p className="text-xs font-bold uppercase opacity-60 mb-1">Durum</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <p className="text-lg font-black">{activeClub?.status === 'APPROVED' ? 'Aktif Kulüp' : 'Onay Bekliyor'}</p>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl px-6 py-4 border border-white/10">
                <p className="text-xs font-bold uppercase opacity-60 mb-1">Yetkiniz</p>
                <p className="text-lg font-black">{isBaskan ? 'Kurucu Başkan' : 'Ekip Lideri'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sorumlu Olduğu Ekipler (Sadece Lider Görür ve Varsa) */}
      {!isBaskan && myTeams.length > 0 && (
        <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-4">Lideri Olduğunuz Ekipler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTeams.map(team => (
                    <div key={team.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <LayoutGrid size={24} />
                        </div>
                        <h3 className="font-black text-gray-900 text-xl mb-1">{team.name}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sorumlu Lider</p>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Yönetim Araçları Grid */}
      <div>
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 ml-4">Erişim Araçları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
              <button
                key={card.label}
                onClick={() => navigate(card.path)}
                className="bg-white border border-gray-100 rounded-[2.5rem] p-7 text-left hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden"
              >
                <div className="relative z-10">
                    <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform`}>
                        <card.icon size={28} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{card.label}</h3>
                    <p className="text-sm text-gray-500 font-medium mb-4">{card.desc}</p>
                    <div className="flex items-center text-indigo-600 text-xs font-black uppercase tracking-widest gap-2">
                        Hemen Aç <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
              </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Öğrenci / Üye Dashboard ───────────────────────────────────────────────
const MemberDashboard = ({ activeClub, user }) => {
  const navigate = useNavigate();
  const [myTeams, setMyTeams] = useState([]);
  const { activeMembershipId } = useClub();

  useEffect(() => {
    const memId = activeMembershipId || localStorage.getItem('activeMembershipId');
    if (!activeClub?.id || !memId) return;
    api.get(`/clubs/${activeClub.id}/teams/my-teams`, { params: { membershipId: memId } })
      .then(r => setMyTeams(r.data))
      .catch(() => {});
  }, [activeClub, activeMembershipId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Üye Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl">
                    <UserCheck size={20} className="text-blue-300" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-80">Üye Paneli</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-8">{activeClub?.name}</h1>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 w-fit">
                <div className="w-16 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-2xl font-black shadow-lg">
                    {(user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                    <p className="text-2xl font-black leading-none">{user?.email?.split('@')[0]}</p>
                    <p className="text-xs font-bold opacity-60 tracking-wider uppercase mt-1">{user?.email}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Üyenin Ekipleri */}
      {myTeams.length > 0 && (
        <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-4">Dahil Olduğunuz Ekipler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTeams.map(team => (
                    <div key={team.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center">
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-lg leading-tight">{team.name}</h3>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Aktif Üye</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Menü Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', desc: 'Kulüp etkinliklerine katıl', gradient: 'from-blue-500 to-indigo-600' },
          { label: 'Belgeler', icon: Folder, path: '/dashboard/documents', desc: 'Dosyalara eriş', gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Projeler', icon: Briefcase, path: '/dashboard/projects', desc: 'Görevlerini izle', gradient: 'from-purple-500 to-indigo-600' }
        ].map(card => (
            <button key={card.label} onClick={() => navigate(card.path)} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 text-left hover:shadow-2xl transition-all group">
                <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-50`}>
                    <card.icon size={28} />
                </div>
                <h3 className="font-black text-gray-900 text-xl mb-1">{card.label}</h3>
                <p className="text-sm text-gray-400 font-medium">{card.desc}</p>
            </button>
        ))}
      </div>
    </div>
  );
};

// ─── Ana Export ────────────────────────────────────────────────────────────
export const DashboardHome = () => {
  const { activeClub, activeRole, activeMembershipId, myClubs, selectClub } = useClub();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loginType = user?.loginType || 'user';

  if (loginType === 'club') {
    return <PresidentDashboard activeClub={activeClub} loginType="club" activeRole="baskan" />;
  }

  if (!activeClub) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200">
            <Building2 size={64} />
        </div>
        <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900">Hoş Geldiniz</h2>
            <p className="text-gray-500 text-lg font-medium">Başlamak için kulübünüzü seçin.</p>
        </div>
        {myClubs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            {myClubs.map(c => (
              <button
                key={c.id}
                onClick={() => { selectClub(c); }}
                className="w-full px-8 py-5 bg-white border border-gray-100 rounded-[2rem] hover:border-indigo-400 hover:shadow-2xl text-lg font-black text-gray-700 transition-all flex items-center justify-between"
              >
                {c.name}
                <ChevronRight size={20} className="text-indigo-500" />
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => navigate('/select-club')}
            className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] hover:bg-indigo-700 transition-all text-lg font-black shadow-2xl shadow-indigo-200"
          >
            Kulüp Bul / Katıl
          </button>
        )}
      </div>
    );
  }

  const isManagement = activeRole === 'baskan' || activeRole === 'ekip_lideri' || activeRole === 'ekip-lideri';

  if (isManagement) {
    return <PresidentDashboard activeClub={activeClub} loginType={loginType} activeRole={activeRole} activeMembershipId={activeMembershipId} />;
  }

  return <MemberDashboard activeClub={activeClub} user={user} />;
};
