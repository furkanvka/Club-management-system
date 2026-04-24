import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  Briefcase,
  CheckSquare,
  Square,
  ClipboardList
} from 'lucide-react';

const TaskCard = ({ task, onUpdateStatus }) => {
  const isCompleted = task.status === 'completed';
  const type = task.event ? 'event' : 'project';
  
  return (
    <div className={`bg-white border rounded-[2rem] p-6 shadow-sm transition-all flex items-center justify-between ${isCompleted ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100 hover:shadow-md'}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onUpdateStatus(task)}
          className={`transition-colors ${isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-indigo-500'}`}
        >
          {isCompleted ? <CheckSquare size={28} /> : <Square size={28} />}
        </button>
        <div>
           <h4 className={`text-lg font-black text-gray-900 leading-tight ${isCompleted ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
           <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl border flex items-center gap-1.5 ${type === 'event' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                {type === 'event' ? <Calendar size={12} /> : <Briefcase size={12} />}
                {type === 'event' ? task.event.name : task.project?.name}
              </span>
              {task.dueDate && (
                <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100">
                  <Clock size={12} /> {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                </span>
              )}
              {task.priority && task.priority !== 'normal' && (
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl border ${
                  task.priority === 'high' || task.priority === 'critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {task.priority === 'high' ? 'Yüksek' : task.priority === 'critical' ? 'Kritik' : 'Düşük'}
                </span>
              )}
           </div>
           {task.description && (
             <p className="text-sm text-gray-500 mt-2 font-medium line-clamp-1">{task.description}</p>
           )}
        </div>
      </div>
    </div>
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
    // Logic matches DashboardHome and backend controllers
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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-gray-500 font-bold animate-pulse">Görevlerin yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Görevlerim</h1>
          <p className="text-gray-500 font-medium">Etkinlik ve projelerdeki aktif sorumlulukların</p>
        </div>
        <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
           <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Toplam Görev</div>
           <div className="text-2xl font-black text-indigo-600 leading-none">{tasks.length}</div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-[3rem] p-20 text-center shadow-sm">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList size={48} className="text-gray-200" />
           </div>
           <h3 className="text-xl font-black text-gray-900 mb-2">Henüz görev atanmamış</h3>
           <p className="text-gray-400 font-medium max-w-xs mx-auto">Harika! Şu anda bekleyen bir görevin bulunmuyor. Yeni projeler veya etkinlikler için takipte kal.</p>
        </div>
      ) : (
        <>
          {/* Project Tasks */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 ml-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Briefcase size={18} />
              </div>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Proje Görevleri</h2>
              <span className="bg-gray-100 text-gray-400 text-[10px] font-black px-2 py-0.5 rounded-lg">{projectTasks.length}</span>
            </div>
            {projectTasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic ml-4">Bu kategoride görev bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {projectTasks.map(task => (
                  <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} />
                ))}
              </div>
            )}
          </section>

          {/* Event Tasks */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 ml-4">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Calendar size={18} />
              </div>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Etkinlik Görevleri</h2>
              <span className="bg-gray-100 text-gray-400 text-[10px] font-black px-2 py-0.5 rounded-lg">{eventTasks.length}</span>
            </div>
            {eventTasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic ml-4">Bu kategoride görev bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {eventTasks.map(task => (
                  <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
