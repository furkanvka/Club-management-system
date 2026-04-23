import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Folder, Plus, Trash2, CheckCircle2, Circle, 
  Clock, AlertCircle, ChevronRight, X, Layout, 
  ListTodo, Calendar, Filter, User2, ArrowLeft,
  Flag, Tag, ChevronDown
} from 'lucide-react';

const PRIORITY = {
  low: { label: 'Düşük', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  normal: { label: 'Orta', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  high: { label: 'Yüksek', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  critical: { label: 'Kritik', cls: 'bg-red-50 text-red-600 border-red-100' },
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

  const isLider = activeRole === 'ekip_lideri' || activeRole === 'ekip-lideri';

  const fetchProjects = () => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/projects`)
      .then(r => { setProjects(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchTeams = () => {
    api.get(`/clubs/${activeClub.id}/teams`).then(r => setTeams(r.data));
  };

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
    fetchProjects(); 
    fetchTeams();
    setSelectedProject(null);
    setTasks([]);
  }, [activeClub]);

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
      alert(e.response?.data?.message || 'Proje oluşturulamadı. Sadece ekip liderleri kendi ekipleri için proje oluşturabilir.');
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
      alert(e.response?.data?.message || 'Görev eklenemedi. Yetkinizi kontrol edin.');
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

  const isLeaderOfSelectedProject = selectedProject?.team?.leader?.id === activeMembershipId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Layout className="text-indigo-600" size={24} />
            Projeler & Görevler
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Ekiplerinizin çalışmalarını ve görev dağılımını yönetin
          </p>
        </div>
        {isLider && !selectedProject && (
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            <Plus size={18} /> Yeni Proje Başlat
          </button>
        )}
        {selectedProject && (
          <button 
            onClick={() => setSelectedProject(null)} 
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} /> Projelere Dön
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Proje Listesi */}
        <div className={`${selectedProject ? 'hidden lg:block lg:col-span-4' : 'lg:col-span-12'} space-y-4`}>
          {showForm && (
            <div className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-xl shadow-indigo-50/50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-bold text-gray-900">Yeni Proje Detayları</h3>
              <div className="space-y-3">
                <input 
                  placeholder="Proje Adı..." 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" 
                />
                <textarea 
                  placeholder="Proje Açıklaması..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={2} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" 
                />
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Sorumlu Ekip</label>
                  <select 
                    value={selectedTeamId}
                    onChange={e => setSelectedTeamId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Ekip Seçiniz...</option>
                    {teams
                        .filter(t => t.leader?.id === activeMembershipId)
                        .map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Kendi Ekibiniz)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition">İptal</button>
                <button 
                  onClick={handleCreateProject} 
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100"
                >
                  Projeyi Başlat
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedProject ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              {projects.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => { setSelectedProject(p); fetchTasks(p.id); fetchTeamMembers(p.team.id); }}
                  className={`group cursor-pointer bg-white border rounded-[2rem] p-6 transition-all duration-300 ${
                    selectedProject?.id === p.id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><Folder size={20} /></div>
                    <div className="px-2 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{p.team?.name}</div>
                  </div>
                  <h3 className="font-black text-gray-900 mb-1">{p.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 h-8">{p.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Görevleri Gör</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Görev Yönetimi (Sağ Panel) */}
        {selectedProject && (
          <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-200/40 overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-indigo-50/20 to-white">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">
                    <Flag size={14} /> {selectedProject.team?.name} PROJESİ
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">{selectedProject.name}</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                        <User2 size={16} className="text-gray-400" /> Lider: {selectedProject.team?.leader?.user?.email}
                    </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Görev Ekleme Formu (Sadece Lider Görebilir) */}
                {isLeaderOfSelectedProject && (
                  <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 space-y-4">
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <Plus size={16} className="text-indigo-600" /> Yeni Görev Ata
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            placeholder="Görev başlığı..." 
                            value={taskTitle}
                            onChange={e => setTaskTitle(e.target.value)}
                            className="col-span-1 md:col-span-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 ml-1 uppercase">Son Tarih</label>
                            <input 
                                type="date"
                                value={taskDueDate}
                                onChange={e => setTaskDueDate(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 ml-1 uppercase">Öncelik</label>
                            <select 
                                value={taskPriority}
                                onChange={e => setTaskPriority(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="low">Düşük</option>
                                <option value="normal">Orta</option>
                                <option value="high">Yüksek</option>
                            </select>
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black text-gray-400 ml-1 uppercase">Görevi Ata (Ekip Üyesi)</label>
                            <select 
                                value={taskAssignedToId}
                                onChange={e => setTaskAssignedToId(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="">Sorumlu Seçiniz...</option>
                                {teamMembers.map(tm => (
                                    <option key={tm.id} value={tm.membership.id}>{tm.membership.user?.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button 
                        onClick={handleCreateTask}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                    >
                        Görevi Yayınla
                    </button>
                  </div>
                )}

                {/* Görev Listesi */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                    <ListTodo size={20} className="text-indigo-500" /> Görevler
                  </h3>

                  {loadingTasks ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /></div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-bold text-sm">Henüz bir görev atanmamış.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div 
                          key={task.id} 
                          onClick={() => toggleTaskStatus(task)}
                          className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                            task.status === 'completed' ? 'bg-emerald-50/30 border-emerald-100 opacity-60' : 'bg-white border-gray-100 hover:border-indigo-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              task.status === 'completed' ? 'bg-emerald-500 text-white' : 'border-2 border-gray-200 text-transparent'
                            }`}>
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <div className={`text-sm font-bold ${task.status === 'completed' ? 'text-emerald-700 line-through' : 'text-gray-800'}`}>
                                {task.title}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                  <Calendar size={10} /> {task.dueDate}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                                  <User2 size={10} /> {task.assignedTo?.user?.email?.split('@')[0]}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${PRIORITY[task.priority || 'normal'].cls}`}>
                            {PRIORITY[task.priority || 'normal'].label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
