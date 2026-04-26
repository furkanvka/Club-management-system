import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Folder, Plus, CheckCircle2, 
  ChevronRight, 
  ListTodo, User2, ArrowLeft,
  Flag,
  Loader2,
  Clock,
  Info,
  ClipboardList
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const PRIORITY = {
  low: { label: 'DÜŞÜK', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  normal: { label: 'ORTA', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  high: { label: 'YÜKSEK', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  critical: { label: 'KRİTİK', cls: 'bg-rose-50 text-rose-600 border-rose-100' },
};

export const Projects = () => {
  const { activeClub, activeRole, activeMembershipId } = useClub();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  // Project Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  
  // Task Form States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('normal');
  const [taskAssignedToId, setTaskAssignedToId] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  const isAdmin = activeRole === 'baskan' || user?.loginType === 'club';
  const isLider = activeRole === 'ekip_lideri' || activeRole === 'ekip-lideri';

  const fetchTeams = useCallback(() => {
    if (!activeClub?.id) return;
    api.get(`/clubs/${activeClub.id}/teams`)
      .then(r => setTeams(r.data))
      .catch(() => setTeams([]));
  }, [activeClub?.id]);

  const fetchProjects = useCallback(() => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/projects`, {
      params: { requesterId: activeMembershipId }
    })
      .then(r => { 
        setProjects(r.data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [activeClub?.id, activeMembershipId]);

  const fetchTasks = (projectId) => {
    setLoadingTasks(true);
    api.get(`/clubs/${activeClub.id}/projects/${projectId}/tasks`)
      .then(r => { setTasks(r.data); setLoadingTasks(false); })
      .catch(() => setLoadingTasks(false));
  };

  const fetchTeamMembers = (teamId) => {
    api.get(`/clubs/${activeClub.id}/teams/${teamId}/members`).then(r => setTeamMembers(r.data));
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (teams.length >= 0) {
      fetchProjects();
    }
  }, [teams, fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedTeamId) return;
    try {
      await api.post(`/clubs/${activeClub.id}/projects`, { 
        name, 
        description, 
        team: { id: selectedTeamId },
        status: 'planning', 
        priority: 'normal' 
      }, {
        params: { requesterId: activeMembershipId }
      });
      setName('');
      setDescription('');
      setSelectedTeamId('');
      setShowForm(false);
      fetchProjects();
    } catch (e) {
      alert(e.response?.data?.message || 'Proje oluşturulamadı.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate || !selectedProject) return;
    try {
      await api.post(`/clubs/${activeClub.id}/projects/${selectedProject.id}/tasks`, {
        title: taskTitle,
        dueDate: taskDueDate,
        priority: taskPriority,
        assignedTo: taskAssignedToId ? { id: taskAssignedToId } : null,
        project: { id: selectedProject.id },
        status: 'pending'
      }, {
        params: { requesterId: activeMembershipId }
      });
      setTaskTitle('');
      setTaskDueDate('');
      setTaskPriority('normal');
      setTaskAssignedToId('');
      fetchTasks(selectedProject.id);
    } catch (e) {
      alert(e.response?.data?.message || 'Görev eklenemedi.');
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.put(`/clubs/${activeClub.id}/projects/${selectedProject.id}/tasks/${task.id}/status`, null, {
        params: { 
            status: newStatus,
            requesterId: activeMembershipId 
        }
      });
      fetchTasks(selectedProject.id);
    } catch (e) {
      alert('Durum güncellenemedi.');
    }
  };

  const isLeaderOfSelectedProject = Number(selectedProject?.team?.leader?.id) === Number(activeMembershipId);

  const selectableTeams = isAdmin 
    ? teams 
    : teams.filter(t => Number(t.leader?.id) === Number(activeMembershipId));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Projeler & Görevler</h1>
          <p className="text-gray-500 font-medium">
            Ekiplerinizin çalışmalarını ve görev dağılımını yönetin
          </p>
        </div>
        <div className="flex gap-3">
          {selectedProject && (
            <Button variant="secondary" onClick={() => setSelectedProject(null)} icon={ArrowLeft}>
              PROJELERE DÖN
            </Button>
          )}
          {isLider && !selectedProject && (
            <Button variant="primary" onClick={() => setShowForm(true)} icon={Plus}>
              YENİ PROJE
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Project List / Selection */}
        <div className={`${selectedProject ? 'hidden lg:block lg:col-span-4' : 'lg:col-span-12'} space-y-6`}>
          {showForm && (
            <Card className="animate-in fade-in slide-in-from-top-4 duration-300 border-indigo-200" title="Yeni Proje Başlat">
              <form onSubmit={handleCreateProject} className="space-y-4">
                <Input 
                  label="Proje Adı"
                  placeholder="Örn: Web Sitesi Yenileme" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Açıklama</label>
                  <textarea 
                    placeholder="Proje hedeflerini kısaca açıklayın..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={3} 
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Sorumlu Ekip</label>
                  <select 
                    required
                    value={selectedTeamId}
                    onChange={e => setSelectedTeamId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Ekip Seçiniz...</option>
                    {selectableTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setShowForm(false)} className="flex-1">İPTAL</Button>
                  <Button variant="primary" type="submit" disabled={selectableTeams.length === 0} className="flex-1">OLUŞTUR</Button>
                </div>
              </form>
            </Card>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-gray-500">Projeler yükleniyor...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
               <Folder size={48} className="text-gray-200 mx-auto mb-4" />
               <p className="text-sm font-bold text-gray-900 mb-1">Henüz proje bulunmuyor</p>
               <p className="text-xs text-gray-500 italic">Ekipleriniz için yeni projeler başlatın.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedProject ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              {projects.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => { setSelectedProject(p); fetchTasks(p.id); fetchTeamMembers(p.team.id); }}
                  className={`w-full text-left bg-white border rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden ${
                    selectedProject?.id === p.id 
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' 
                    : 'border-gray-100 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl transition-colors ${selectedProject?.id === p.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                      <Folder size={20} />
                    </div>
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-100">
                      {p.team?.name}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 h-8 leading-relaxed">{p.description}</p>
                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GÖREVLERİ GÖR</span>
                    <ChevronRight size={16} className={`transition-transform duration-300 ${selectedProject?.id === p.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Task Detail Panel */}
        {selectedProject && (
          <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card noPadding className="overflow-hidden shadow-xl shadow-indigo-900/5 border-indigo-100">
              {/* Project Header */}
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 relative">
                <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-3">
                    <Flag size={14} /> {selectedProject.team?.name} PROJESİ
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedProject.name}</h2>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                        <User2 size={14} className="text-gray-400" />
                        <span className="font-bold">Lider:</span> {selectedProject.team?.leader?.user?.firstName ? `${selectedProject.team.leader.user.firstName} ${selectedProject.team.leader.user.lastName}` : selectedProject.team?.leader?.user?.email?.split('@')[0]}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                        <Info size={14} className="text-gray-400" />
                        <span className="font-bold">Durum:</span> {selectedProject.status?.toUpperCase() || 'PLANLANIYOR'}
                    </div>
                </div>
              </div>

              <div className="p-8 space-y-10">
                {/* Task Assignment Form */}
                {isLeaderOfSelectedProject && (
                  <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-700 uppercase tracking-wider">
                        <Plus size={16} /> Yeni Görev Tanımla
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <Input 
                            label="Görev Başlığı"
                            placeholder="Örn: Rapor taslağını hazırla" 
                            value={taskTitle}
                            onChange={e => setTaskTitle(e.target.value)}
                            className="bg-white border-indigo-100"
                          />
                        </div>
                        <Input 
                            label="Son Tarih"
                            type="date"
                            value={taskDueDate}
                            onChange={e => setTaskDueDate(e.target.value)}
                            className="bg-white border-indigo-100"
                        />
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Öncelik Seviyesi</label>
                            <select 
                                value={taskPriority}
                                onChange={e => setTaskPriority(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white border border-indigo-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            >
                                <option value="low">Düşük</option>
                                <option value="normal">Orta</option>
                                <option value="high">Yüksek</option>
                                <option value="critical">Kritik</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Sorumlu Atayın</label>
                            <select 
                                value={taskAssignedToId}
                                onChange={e => setTaskAssignedToId(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white border border-indigo-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            >
                                <option value="">Bir ekip üyesi seçin...</option>
                                {teamMembers
                                  .filter(tm => {
                                    const role = (tm.membership?.role || '').toLowerCase();
                                    return role !== 'baskan' && role !== 'kulup_baskani';
                                  })
                                  .map(tm => (
                                    <option key={tm.id} value={tm.membership.id}>
                                      {tm.membership.user?.firstName ? `${tm.membership.user.firstName} ${tm.membership.user.lastName}` : tm.membership.user?.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <Button 
                        onClick={handleCreateTask}
                        className="w-full py-3"
                        icon={Plus}
                    >
                        GÖREVİ YAYINLA
                    </Button>
                  </div>
                )}

                {/* Task List */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <ListTodo size={20} className="text-indigo-500" /> Mevcut Görevler
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      {tasks.length} TOPLAM
                    </span>
                  </div>

                  {loadingTasks ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <ClipboardList size={40} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium italic">Henüz bir görev atanmamış.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => {
                        const isDone = task.status === 'completed';
                        const priorityInfo = PRIORITY[task.priority || 'normal'];
                        
                        return (
                          <div 
                            key={task.id} 
                            onClick={() => toggleTaskStatus(task)}
                            className={`flex items-center justify-between p-5 rounded-xl border transition-all cursor-pointer group/task ${
                              isDone 
                              ? 'bg-emerald-50/20 border-emerald-100 opacity-75' 
                              : 'bg-white border-gray-100 hover:border-indigo-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                isDone 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-gray-200 text-transparent group-hover/task:border-indigo-400'
                              }`}>
                                <CheckCircle2 size={14} />
                              </div>
                              <div>
                                <div className={`text-sm font-bold transition-all ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                  {task.title}
                                </div>
                                <div className="flex items-center gap-4 mt-1.5">
                                  <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5">
                                    <Clock size={12} className="text-gray-300" /> {task.dueDate}
                                  </span>
                                  <span className="text-[10px] font-bold text-indigo-600/70 flex items-center gap-1.5">
                                    <User2 size={12} className="text-indigo-400" /> {task.assignedTo?.user?.email?.split('@')[0].toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${priorityInfo.cls}`}>
                              {priorityInfo.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
