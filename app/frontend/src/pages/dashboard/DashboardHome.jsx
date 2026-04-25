import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Folder, DollarSign, ChevronRight,
  Crown, UserCheck, Building2, Bell, Info, ArrowRight,
  Briefcase, LayoutGrid, Star, Target, TrendingUp,
  CheckCircle2, Clock, ClipboardList, Loader2
} from 'lucide-react';
import api from '../../services/api';

// ─── Ortak Görev Bileşeni ───────────────────────────────────────────────
const TaskList = ({ tasks, loading, onUpdateStatus }) => {
  if (loading) return (
    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" /></div>
  );

  if (!tasks || tasks.length === 0) return (
    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[2rem] p-10 text-center">
       <ClipboardList size={40} className="text-gray-200 mx-auto mb-3" />
       <p className="text-gray-400 font-bold italic text-sm">Atanmış görev bulunmuyor.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task.id} className={`bg-white border rounded-[2rem] p-5 shadow-sm transition-all flex items-center justify-between ${task.status === 'completed' ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100 hover:shadow-md'}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onUpdateStatus(task)}
              className={`transition-colors ${task.status === 'completed' ? 'text-emerald-500' : 'text-gray-300 hover:text-indigo-500'}`}
            >
              <CheckCircle2 size={28} />
            </button>
            <div>
               <h4 className={`font-black text-gray-900 leading-tight ${task.status === 'completed' ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
               <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${task.event ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    {task.event ? `Etkinlik: ${task.event.name}` : `Proje: ${task.project?.name}`}
                  </span>
                  {task.dueDate && (
                    <span className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                      <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                    </span>
                  )}
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Liderlik & Başkanlık Dashboard (Yönetim Paneli) ──────────────────────
const PresidentDashboard = ({ activeClub, loginType, activeRole, activeMembershipId }) => {
  const navigate = useNavigate();
  const [myTeams, setMyTeams] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const isBaskan = activeRole === 'baskan' || loginType === 'club';

  const fetchDashboardData = useCallback(async () => {
    if (!activeClub?.id || !activeMembershipId) return;
    setLoadingTasks(true);
    try {
      const [teamsRes, tasksRes] = await Promise.all([
        api.get(`/clubs/${activeClub.id}/teams/my-teams`, { params: { membershipId: activeMembershipId } }),
        api.get(`/clubs/${activeClub.id}/members/${activeMembershipId}/tasks`)
      ]);
      setMyTeams(teamsRes.data);
      setMyTasks(tasksRes.data);
    } catch (e) {}
    setLoadingTasks(false);
  }, [activeClub?.id, activeMembershipId]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleUpdateStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const url = task.event 
      ? `/clubs/${activeClub.id}/events/${task.event.id}/tasks/${task.id}/status`
      : `/clubs/${activeClub.id}/projects/${task.project.id}/tasks/${task.id}/status`;
    
    try {
      await api.put(url, null, { params: { status: newStatus, requesterId: activeMembershipId } });
      fetchDashboardData();
    } catch (e) { alert('Hata oluştu.'); }
  };

  const cards = [
    { label: 'Üye Yönetimi', icon: Users, path: '/dashboard/members', gradient: 'from-violet-500 to-purple-600', desc: 'Topluluk üyelerini yönet', adminOnly: true },
    { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', gradient: 'from-blue-500 to-cyan-600', desc: 'Etkinlikleri takip et' },
    { label: 'Projeler', icon: Briefcase, path: '/dashboard/projects', gradient: 'from-indigo-500 to-blue-600', desc: 'Görevleri yönet' },
    { label: 'Ekipler', icon: LayoutGrid, path: '/dashboard/teams', gradient: 'from-amber-500 to-orange-600', desc: 'Ekip performansını gör' },
    { label: 'Finans', icon: DollarSign, path: '/dashboard/finance', gradient: 'from-emerald-500 to-green-600', desc: 'Bütçe takibi', adminOnly: true },
  ].filter(c => !c.adminOnly || isBaskan);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className={`bg-gradient-to-br ${isBaskan ? 'from-indigo-700 via-purple-700 to-indigo-900' : 'from-amber-600 via-orange-700 to-red-700'} rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-4">{activeClub?.name}</h1>
          <p className="text-lg opacity-70 font-medium">{isBaskan ? 'Kulüp yönetim merkezine hoş geldiniz.' : 'Ekibinizi ve görevlerinizi buradan yönetin.'}</p>
          <div className="mt-8 flex gap-4">
             <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                <p className="text-[10px] font-black uppercase opacity-60">Yetki</p>
                <p className="font-black">{isBaskan ? 'Kurucu Başkan' : 'Ekip Lideri'}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(card => (
              <button key={card.label} onClick={() => navigate(card.path)} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 text-left hover:shadow-xl transition-all group">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <card.icon size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900">{card.label}</h3>
                <p className="text-xs text-gray-500 font-medium">{card.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Öğrenci / Üye Dashboard ───────────────────────────────────────────────
const MemberDashboard = ({ activeClub, user, activeMembershipId, activeRole }) => {
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeClub?.id || !activeMembershipId) return;
    setLoadingTasks(true);
    try {
      const res = await api.get(`/clubs/${activeClub.id}/members/${activeMembershipId}/tasks`);
      setMyTasks(res.data);
    } catch (e) {}
    setLoadingTasks(false);
  }, [activeClub?.id, activeMembershipId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const url = task.event 
      ? `/clubs/${activeClub.id}/events/${task.event.id}/tasks/${task.id}/status`
      : `/clubs/${activeClub.id}/projects/${task.project.id}/tasks/${task.id}/status`;
    
    try {
      await api.put(url, null, { params: { status: newStatus, requesterId: activeMembershipId } });
      fetchData();
    } catch (e) { alert('Hata oluştu.'); }
  };

  const role = activeRole?.toLowerCase() || '';
  const isBaskan = role === 'baskan' || role === 'kulup_baskani' || user?.loginType === 'club';

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-4">{activeClub?.name}</h1>
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-[2rem] p-5 border border-white/10 w-fit">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-xl font-black">{user?.email?.[0].toUpperCase()}</div>
            <div>
                <p className="text-xl font-black leading-none">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] font-bold opacity-60 uppercase mt-1">{user?.email}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
           {[
             { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', gradient: 'from-blue-500 to-indigo-600' },
             { label: 'Görevlerim', icon: CheckCircle2, path: '/dashboard/tasks', gradient: 'from-rose-500 to-pink-600', hideIfBaskan: true },
             { label: 'Projeler', icon: Briefcase, path: '/dashboard/projects', gradient: 'from-purple-500 to-indigo-600' },
             { label: 'Belgeler', icon: Folder, path: '/dashboard/documents', gradient: 'from-emerald-500 to-teal-600' }
           ].filter(card => !card.hideIfBaskan || !isBaskan).map(card => (
             <button key={card.label} onClick={() => navigate(card.path)} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 text-left hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <card.icon size={28} />
                </div>
                <h3 className="font-black text-gray-900 text-xl">{card.label}</h3>
             </button>
           ))}
        </div>
        {!isBaskan && (
          <div className="space-y-6">
             <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-4">Görevlerim</h2>
             <TaskList tasks={myTasks} loading={loadingTasks} onUpdateStatus={handleUpdateStatus} />
          </div>
        )}
      </div>
    </div>
  );
};

export const DashboardHome = () => {
  const { activeClub, activeRole, activeMembershipId, myClubs, selectClub } = useClub();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loginType = user?.loginType || 'user';

  if (loginType === 'club') {
    return <PresidentDashboard activeClub={activeClub} loginType="club" activeRole="baskan" activeMembershipId={activeMembershipId} />;
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
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          {myClubs.map(c => (
            <button key={c.id} onClick={() => { selectClub(c); }} className="w-full px-8 py-5 bg-white border border-gray-100 rounded-[2rem] hover:border-indigo-400 hover:shadow-2xl text-lg font-black text-gray-700 transition-all flex items-center justify-between">
              {c.name} <ChevronRight size={20} className="text-indigo-500" />
            </button>
          ))}
          <button onClick={() => navigate('/select-club')} className="mt-4 text-sm font-bold text-indigo-600 hover:underline text-center">Tüm Kulüpleri Gör</button>
        </div>
      </div>
    );
  }

  const isManagement = activeRole === 'baskan' || activeRole === 'ekip_lideri' || activeRole === 'ekip-lideri';

  if (isManagement) {
    return <PresidentDashboard activeClub={activeClub} loginType={loginType} activeRole={activeRole} activeMembershipId={activeMembershipId} />;
  }

  return <MemberDashboard activeClub={activeClub} user={user} activeMembershipId={activeMembershipId} activeRole={activeRole} />;
};
