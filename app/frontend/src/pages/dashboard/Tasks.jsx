import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import api from '../../services/api';
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Calendar, 
  Briefcase,
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import { Card } from '../../components/common/Card';

const TaskCard = ({ task, onUpdateStatus }) => {
  const isCompleted = task.status === 'completed';
  const type = task.event ? 'event' : 'project';
  
  return (
    <Card className={`group transition-all ${isCompleted ? 'bg-gray-50/50 opacity-75' : 'hover:border-indigo-300 hover:shadow-md'}`} noPadding>
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-5 min-w-0">
          <button 
            onClick={() => onUpdateStatus(task)}
            className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              isCompleted 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-gray-300 text-transparent hover:border-indigo-400'
            }`}
          >
            <CheckCircle2 size={14} />
          </button>
          
          <div className="min-w-0">
            <h4 className={`text-base font-bold text-gray-900 truncate ${isCompleted ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </h4>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                type === 'event' 
                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
              }`}>
                {type === 'event' ? <Calendar size={10} /> : <Briefcase size={10} />}
                {type === 'event' ? task.event.name : task.project?.name}
              </span>
              
              {task.dueDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100">
                  <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                </span>
              )}
              
              {task.priority && task.priority !== 'normal' && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  task.priority === 'high' || task.priority === 'critical' 
                  ? 'bg-rose-50 text-rose-700 border-rose-100' 
                  : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}>
                  {task.priority === 'high' ? 'YÜKSEK' : task.priority === 'critical' ? 'KRİTİK' : 'DÜŞÜK'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {!isCompleted && (
          <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 transition-all ml-4" />
        )}
      </div>
      
      {task.description && (
        <div className="px-5 pb-5 ml-11">
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed italic border-l-2 border-gray-100 pl-3">
            {task.description}
          </p>
        </div>
      )}
    </Card>
  );
};

export const Tasks = () => {
  const { activeClub, activeMembershipId } = useClub();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!activeClub?.id || !activeMembershipId) return;
    setLoading(true);
    try {
      const res = await api.get(`/clubs/${activeClub.id}/members/${activeMembershipId}/tasks`);
      setTasks(res.data);
    } catch (e) {
      console.error('Görevler yüklenemedi:', e);
    }
    setLoading(false);
  }, [activeClub?.id, activeMembershipId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleUpdateStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const url = task.event 
      ? `/clubs/${activeClub.id}/events/${task.event.id}/tasks/${task.id}/status`
      : `/clubs/${activeClub.id}/projects/${task.project.id}/tasks/${task.id}/status`;
    
    try {
      await api.put(url, null, { params: { status: newStatus, requesterId: activeMembershipId } });
      fetchTasks();
    } catch (e) {
      alert('Görev durumu güncellenemedi.');
    }
  };

  const eventTasks = tasks.filter(t => t.event);
  const projectTasks = tasks.filter(t => t.project);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Görevler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Görevlerim</h1>
          <p className="text-gray-500 font-medium mt-1">Etkinlik ve projelerdeki aktif sorumluluklarınız</p>
        </div>
        <div className="px-6 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center min-w-[140px]">
           <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Toplam Görev</span>
           <span className="text-3xl font-bold text-indigo-600 leading-none">{tasks.length}</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-24 text-center">
           <ClipboardList size={64} className="text-gray-100 mx-auto mb-6" />
           <h3 className="text-lg font-bold text-gray-900 mb-2">Henüz görev atanmamış</h3>
           <p className="text-sm text-gray-400 max-w-sm mx-auto">
             Harika! Şu anda bekleyen bir göreviniz bulunmuyor. Yeni projeler veya etkinlikler için takipte kalın.
           </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Project Tasks */}
          {projectTasks.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <Briefcase size={16} />
                </div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Proje Görevleri</h2>
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                  {projectTasks.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {projectTasks.map(task => (
                  <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} />
                ))}
              </div>
            </section>
          )}

          {/* Event Tasks */}
          {eventTasks.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                  <Calendar size={16} />
                </div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Etkinlik Görevleri</h2>
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                  {eventTasks.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {eventTasks.map(task => (
                  <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
