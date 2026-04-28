import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, 
  Calendar, 
  Folder, 
  DollarSign, 
  ChevronRight,
  Shield, 
  ArrowRight,
  Briefcase, 
  LayoutGrid, 
  CheckCircle2, 
  Clock, 
  ClipboardList, 
  Loader2,
  AlertCircle,
  Plus,
  Building2
} from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

// ─── Task Item Component ───────────────────────────────────────────────
const TaskItem = ({ task, onUpdateStatus }) => {
  const isCompleted = task.status === 'completed';
  
  return (
    <div className={`
      group flex items-center justify-between p-4 bg-white border rounded-xl transition-all duration-200
      ${isCompleted ? 'bg-gray-50/50 border-gray-100 opacity-75' : 'border-gray-200 hover:border-indigo-200 hover:shadow-sm'}
    `}>
      <div className="flex items-center gap-4 min-w-0">
        <button 
          onClick={() => onUpdateStatus(task)}
          className={`
            shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${isCompleted 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-gray-300 text-transparent hover:border-indigo-400'
            }
          `}
        >
          <CheckCircle2 size={14} />
        </button>
        <div className="min-w-0">
          <h4 className={`text-sm font-bold text-gray-900 truncate ${isCompleted ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
              task.event ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
            }`}>
              {task.event ? `Etkinlik: ${task.event.name}` : `Proje: ${task.project?.name}`}
            </span>
            {task.dueDate && (
              <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString('tr-TR')}
              </span>
            )}
          </div>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
    </div>
  );
};

// ─── Task List Section ───────────────────────────────────────────────
const TaskList = ({ tasks, loading, onUpdateStatus }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Görevler yükleniyor...</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
          <ClipboardList size={24} className="text-gray-300" />
        </div>
        <p className="text-sm font-bold text-gray-900 mb-1">Atanmış görev bulunmuyor</p>
        <p className="text-xs text-gray-500">Harika! Şu an için yapman gereken bir görev görünmüyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onUpdateStatus={onUpdateStatus} />
      ))}
    </div>
  );
};

// ─── President Dashboard ───────────────────────────────────────────────
const PresidentDashboard = ({ activeClub, loginType, activeRole }) => {
  const navigate = useNavigate();
  const isBaskan = activeRole === 'baskan' || loginType === 'club';

  const quickActions = [
    { label: 'Üye Yönetimi', icon: Users, path: '/dashboard/members', color: 'bg-indigo-600', desc: 'Üyeleri görüntüle ve yönet', adminOnly: true },
    { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', color: 'bg-amber-500', desc: 'Yeni etkinlik planla' },
    { label: 'Projeler', icon: Briefcase, path: '/dashboard/projects', color: 'bg-blue-600', desc: 'Proje süreçlerini takip et' },
    { label: 'Finans', icon: DollarSign, path: '/dashboard/finance', color: 'bg-emerald-600', desc: 'Gelir ve gider raporları', adminOnly: true },
  ].filter(c => !c.adminOnly || isBaskan);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Hoş Geldiniz, {isBaskan ? 'Başkan' : 'Lider'}</h1>
          <p className="text-gray-500 font-medium">
            {activeClub?.name} yönetim panelinde bugün neler oluyor?
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loginType !== 'club' && !isBaskan && (
            <Button variant="secondary" onClick={() => navigate('/dashboard/tasks')} icon={ClipboardList}>
              Görevleri Gör
            </Button>
          )}
          <Button variant="primary" onClick={() => navigate('/dashboard/events')} icon={Plus}>
            Yeni Etkinlik
          </Button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Access Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Hızlı Erişim</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map(action => (
                <button 
                  key={action.label} 
                  onClick={() => navigate(action.path)}
                  className="group p-6 bg-white border border-gray-200 rounded-2xl text-left hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{action.label}</h3>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card title="Kulüp Bilgileri" noPadding>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Durum</p>
                  <p className="text-sm font-bold text-gray-900">Aktif Yönetim</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rolünüz</p>
                  <p className="text-sm font-bold text-gray-900">{isBaskan ? 'Kulüp Başkanı' : 'Ekip Lideri'}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
               <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/dashboard/profile')}>
                 Profili Düzenle <ArrowRight size={14} className="ml-2" />
               </Button>
            </div>
          </Card>

          <Card title="Son Bildirimler">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AlertCircle size={32} className="text-gray-200 mb-3" />
              <p className="text-xs font-medium text-gray-400">Yeni bildirim bulunmuyor.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── Member Dashboard ───────────────────────────────────────────────
const MemberDashboard = ({ activeClub, user, activeMembershipId }) => {
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
    } catch (e) { 
      // Simple alert for errors as we don't have a toast system yet
      alert('İşlem sırasında bir hata oluştu.'); 
    }
  };

  const menuItems = [
    { label: 'Etkinlikler', icon: Calendar, path: '/dashboard/events', color: 'bg-blue-500' },
    { label: 'Görevlerim', icon: ClipboardList, path: '/dashboard/tasks', color: 'bg-rose-500' },
    { label: 'Projeler', icon: Briefcase, path: '/dashboard/projects', color: 'bg-indigo-600' },
    { label: 'Belgeler', icon: Folder, path: '/dashboard/documents', color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-100">
            {user?.firstName?.[0]?.toLocaleUpperCase('tr-TR') || user?.email?.[0]?.toLocaleUpperCase('tr-TR')}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Merhaba, {user?.firstName || user?.email?.split('@')[0]}
            </h1>
            <p className="text-gray-500 font-medium">{activeClub?.name} üye panelindesin.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Menu */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {menuItems.map(item => (
              <button 
                key={item.label} 
                onClick={() => navigate(item.path)}
                className="group flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <span className="text-sm font-bold text-gray-900">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Activity Section Placeholder */}
          <Card title="Kulüp Duyuruları">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">Henüz duyuru yok</p>
              <p className="text-xs text-gray-500">Kulüp yöneticileri duyuru paylaştığında burada görünecek.</p>
            </div>
          </Card>
        </div>

        {/* Tasks Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bekleyen Görevlerim</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/tasks')}>
              Tümü
            </Button>
          </div>
          <TaskList 
            tasks={myTasks.filter(t => t.status !== 'completed').slice(0, 5)} 
            loading={loadingTasks} 
            onUpdateStatus={handleUpdateStatus} 
          />
          {myTasks.length > 5 && (
            <button 
              onClick={() => navigate('/dashboard/tasks')}
              className="w-full py-3 text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Daha Fazla Göster
            </button>
          )}
        </div>
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
    return <PresidentDashboard activeClub={activeClub} loginType="club" activeRole="baskan" />;
  }

  if (!activeClub) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 max-w-md mx-auto">
        <div className="relative">
          <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-500 animate-pulse">
            <Building2 size={64} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-100">
            <Shield size={24} className="text-emerald-500" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Kulüp Seçin</h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Yönetim paneline erişmek için bir kulüp seçmeniz gerekiyor.
          </p>
        </div>
        <div className="w-full space-y-3">
          {myClubs.map(c => (
            <button 
              key={c.id} 
              onClick={() => { selectClub(c); }} 
              className="group w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors font-bold">
                  {c.name[0]}
                </div>
                <span className="font-bold text-gray-700 group-hover:text-gray-900">{c.name}</span>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full mt-4"
            onClick={() => navigate('/select-club')}
            icon={Plus}
          >
            Yeni Kulübe Katıl
          </Button>
        </div>
      </div>
    );
  }

  const isManagement = activeRole === 'baskan' || activeRole === 'ekip_lideri' || activeRole === 'ekip-lideri';

  if (isManagement) {
    return <PresidentDashboard activeClub={activeClub} loginType={loginType} activeRole={activeRole} />;
  }

  return <MemberDashboard activeClub={activeClub} user={user} activeMembershipId={activeMembershipId} />;
};
