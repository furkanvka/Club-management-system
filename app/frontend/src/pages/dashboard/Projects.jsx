import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Folder, Plus, Trash2, CheckCircle2, Circle, 
  Clock, AlertCircle, ChevronRight, X, Layout, 
  ListTodo, Calendar, Filter
} from 'lucide-react';

const PRIORITY = {
  low: { label: 'Düşük', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  normal: { label: 'Normal', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  high: { label: 'Yüksek', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  critical: { label: 'Kritik', cls: 'bg-red-50 text-red-600 border-red-100' },
};

export const Projects = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskName, setTaskName] = useState('');
  const [saving, setSaving] = useState(false);

  const canManage = activeRole === 'baskan' || user?.loginType === 'club';

  const fetchProjects = () => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/projects`)
      .then(r => { setProjects(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchTasks = (projectId) => {
    setLoadingTasks(true);
    api.get(`/clubs/${activeClub.id}/projects/${projectId}/tasks`)
      .then(r => { setTasks(r.data); setLoadingTasks(false); })
      .catch(() => setLoadingTasks(false));
  };

  useEffect(() => { 
    fetchProjects(); 
    setSelectedProject(null);
    setTasks([]);
  }, [activeClub]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post(`/clubs/${activeClub.id}/projects`, { 
        name, 
        description, 
        status: 'planning', 
        priority: 'normal' 
      });
      setName('');
      setDescription('');
      setShowForm(false);
      fetchProjects();
    } catch (e) {
      alert('Proje oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskName.trim() || !selectedProject) return;
    try {
      await api.post(`/clubs/${activeClub.id}/projects/${selectedProject.id}/tasks`, {
        title: taskName,
        status: 'todo',
        priority: 'normal'
      });
      setTaskName('');
      fetchTasks(selectedProject.id);
    } catch (e) {
      alert('Görev eklenemedi.');
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await api.put(`/clubs/${activeClub.id}/projects/${selectedProject.id}/tasks/${task.id}`, {
        ...task,
        status: newStatus
      });
      fetchTasks(selectedProject.id);
    } catch (e) {
      alert('Durum güncellenemedi.');
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Projeyi ve tüm görevlerini silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/projects/${id}`);
      if (selectedProject?.id === id) setSelectedProject(null);
      fetchProjects();
    } catch (e) { alert('Silinemedi.'); }
  };

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
            {activeClub?.name} bünyesindeki çalışmaları yönetin
          </p>
        </div>
        {canManage && !selectedProject && (
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
            <ArrowLeft size={18} className="rotate-180" /> Projelere Dön
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Proje Listesi */}
        <div className={`${selectedProject ? 'hidden lg:block lg:col-span-4' : 'lg:col-span-12'} space-y-4`}>
          {showForm && (
            <div className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-xl shadow-indigo-50/50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">Yeni Proje Detayları</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <input 
                  placeholder="Proje Adı..." 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none font-medium transition-all" 
                />
                <textarea 
                  placeholder="Proje Amacı ve Açıklaması..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={3} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none font-medium transition-all" 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleCreateProject} 
                  disabled={saving || !name.trim()} 
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
                >
                  {saving ? 'Oluşturuluyor...' : 'Projeyi Başlat'}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center text-gray-300 mb-4">
                <Folder size={32} />
              </div>
              <h4 className="font-bold text-gray-800">Henüz Proje Bulunmuyor</h4>
              <p className="text-sm text-gray-400 mt-1">Yeni bir proje başlatarak ekibinizle çalışmaya başlayın.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedProject ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              {projects.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => { setSelectedProject(p); fetchTasks(p.id); }}
                  className={`group cursor-pointer bg-white border rounded-[2rem] p-6 transition-all duration-300 relative overflow-hidden ${
                    selectedProject?.id === p.id 
                    ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-none' 
                    : 'border-gray-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-gray-200/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                      <Folder className="text-gray-400 group-hover:text-indigo-600" size={20} />
                    </div>
                    {canManage && (
                      <button 
                        onClick={(e) => handleDeleteProject(p.id, e)} 
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <h3 className="font-black text-gray-900 group-hover:text-indigo-700 transition-colors mb-2 line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-6 h-8">{p.description || 'Açıklama belirtilmemiş.'}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <ListTodo size={12} />
                      Detayları Gör
                    </div>
                    <ChevronRight size={16} className={`text-gray-300 transition-transform duration-300 ${selectedProject?.id === p.id ? 'translate-x-1 text-indigo-500' : 'group-hover:translate-x-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Görev Detayları (Sağ Panel) */}
        {selectedProject && (
          <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-200/40 overflow-hidden sticky top-6">
              <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-indigo-50/30 to-white">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-2">
                  <Layout size={14} /> Proje Detayı
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">{selectedProject.name}</h2>
                <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-2xl">{selectedProject.description}</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Görev Ekleme */}
                {canManage && (
                  <form onSubmit={handleCreateTask} className="flex gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white focus-within:border-indigo-200 transition-all">
                    <input 
                      placeholder="Yeni görev ekle..." 
                      value={taskName}
                      onChange={e => setTaskName(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-semibold"
                    />
                    <button 
                      type="submit" 
                      disabled={!taskName.trim()}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
                    >
                      Ekle
                    </button>
                  </form>
                )}

                {/* Görev Listesi */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                      <ListTodo size={20} className="text-indigo-500" /> Görev Listesi
                    </h3>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {tasks.length} Toplam
                    </div>
                  </div>

                  {loadingTasks ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Görevler Senkronize Ediliyor...</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100">
                      <p className="text-gray-400 font-bold text-sm">Henüz bir görev eklenmemiş.</p>
                      <p className="text-[11px] text-gray-300 mt-1 uppercase tracking-widest">İlk adımı yukarıdan atın</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div 
                          key={task.id} 
                          onClick={() => canManage && toggleTaskStatus(task)}
                          className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                            task.status === 'done' 
                            ? 'bg-emerald-50/30 border-emerald-100 opacity-60' 
                            : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-md cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              task.status === 'done' 
                              ? 'bg-emerald-500 text-white' 
                              : 'border-2 border-gray-200 text-transparent group-hover:border-indigo-400 group-hover:text-indigo-400'
                            }`}>
                              {task.status === 'done' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </div>
                            <div>
                              <div className={`text-sm font-bold ${task.status === 'done' ? 'text-emerald-700 line-through' : 'text-gray-800'}`}>
                                {task.title}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                  <Clock size={10} /> {task.status === 'done' ? 'Tamamlandı' : 'Beklemede'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${PRIORITY[task.priority || 'normal'].cls}`}>
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

const ArrowLeft = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
