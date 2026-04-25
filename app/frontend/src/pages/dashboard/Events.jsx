import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import {
  Plus, Calendar, MapPin, Trash2,
  Clock, CheckCircle, XCircle, AlertCircle, X,
  UserCheck, UserX, Loader2,
  Briefcase, UserPlus, UserMinus, ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const STATUS = {
  upcoming: { label: 'YAKLAŞAN', cls: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
  ongoing: { label: 'DEVAM EDEN', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
  completed: { label: 'TAMAMLANDI', cls: 'bg-gray-50 text-gray-600 border-gray-100', icon: CheckCircle },
  cancelled: { label: 'İPTAL', cls: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle },
  draft: { label: 'TASLAK', cls: 'bg-amber-50 text-amber-700 border-amber-100', icon: AlertCircle },
};

const EMPTY_FORM = { name: '', description: '', eventDate: '', location: '', capacity: '0', status: 'upcoming', responsible_id: '' };

export const Events = () => {
  const { activeClub, activeRole, activeMembershipId } = useClub();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showApps, setShowApps] = useState(null);
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [myApps, setMyApps] = useState({});

  // Staff & Task Management State
  const [showStaffModal, setShowStaffModal] = useState(null);
  const [activeTab, setActiveTab] = useState('staff');
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffRole, setStaffRole] = useState('Görevli');
  const [selectedMemberForStaff, setSelectedMemberForStaff] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', assignedToId: '', dueDate: '', priority: 'normal' });
  const [myStaffEvents, setMyStaffEvents] = useState([]);

  const isBaskan = activeRole === 'baskan' || user?.loginType === 'club';
  
  const isResponsibleFor = useCallback((ev) => {
    return Number(ev?.responsible?.id) === Number(activeMembershipId);
  }, [activeMembershipId]);

  const canManageEvent = useCallback((ev) => {
    return isBaskan || isResponsibleFor(ev);
  }, [isBaskan, isResponsibleFor]);

  const fetchEvents = useCallback(async () => {
    if (!activeClub?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/clubs/${activeClub.id}/events`);
      setEvents(res.data);
      
      const isAnyResponsible = res.data.some(ev => isResponsibleFor(ev));
      if (isBaskan || isAnyResponsible) {
        const memRes = await api.get(`/clubs/${activeClub.id}/members`);
        setMembers(memRes.data);
      }

      const staffEvents = [];
      for (const ev of res.data) {
        try {
          const staffRes = await api.get(`/clubs/${activeClub.id}/events/${ev.id}/staff`);
          if (staffRes.data.some(s => Number(s.membership?.id) === Number(activeMembershipId))) {
            staffEvents.push(ev.id);
          }
        } catch (e) {}
      }
      setMyStaffEvents(staffEvents);

      const myAppsMap = {};
      for (const ev of res.data) {
        try {
          const appRes = await api.get(`/clubs/${activeClub.id}/events/${ev.id}/applications`);
          const myApp = appRes.data.find(a => a.membership?.user?.email === user?.email);
          if (myApp) myAppsMap[ev.id] = myApp;
        } catch (e) {}
      }
      setMyApps(myAppsMap);
    } catch (e) {}
    setLoading(false);
  }, [activeClub?.id, user?.email, isBaskan, isResponsibleFor, activeMembershipId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const fetchStaff = async (eventId) => {
    setLoadingStaff(true);
    try {
      const res = await api.get(`/clubs/${activeClub.id}/events/${eventId}/staff`);
      setStaffList(res.data);
    } catch (e) {}
    setLoadingStaff(false);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!selectedMemberForStaff || !showStaffModal) return;
    try {
      await api.post(`/clubs/${activeClub.id}/events/${showStaffModal.id}/staff`, {
        membership: { id: selectedMemberForStaff },
        role: staffRole
      }, { params: { requesterId: activeMembershipId } });
      setSelectedMemberForStaff('');
      fetchStaff(showStaffModal.id);
    } catch (e) { alert(e.response?.data || 'Hata oluştu.'); }
  };

  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm('Görevliyi çıkarmak istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/events/${showStaffModal.id}/staff/${staffId}`, {
        params: { requesterId: activeMembershipId }
      });
      fetchStaff(showStaffModal.id);
    } catch (e) { alert('Hata oluştu.'); }
  };

  const fetchTasks = async (eventId) => {
    setLoadingTasks(true);
    try {
      const res = await api.get(`/clubs/${activeClub.id}/events/${eventId}/tasks`);
      setTasks(res.data);
    } catch (e) {}
    setLoadingTasks(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!showStaffModal) return;
    try {
      await api.post(`/clubs/${activeClub.id}/events/${showStaffModal.id}/tasks`, {
        ...taskForm,
        assignedTo: taskForm.assignedToId ? { id: taskForm.assignedToId } : null,
      }, { params: { requesterId: activeMembershipId } });
      setTaskForm({ title: '', assignedToId: '', dueDate: '', priority: 'normal' });
      fetchTasks(showStaffModal.id);
    } catch (e) { alert('Görev atanamadı.'); }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/clubs/${activeClub.id}/events/${showStaffModal.id}/tasks/${taskId}/status`, null, {
        params: { status: newStatus, requesterId: activeMembershipId }
      });
      fetchTasks(showStaffModal.id);
    } catch (e) { alert('Güncellenemedi.'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Görevi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/events/${showStaffModal.id}/tasks/${taskId}`, {
        params: { requesterId: activeMembershipId }
      });
      fetchTasks(showStaffModal.id);
    } catch (e) { alert('Silinemedi.'); }
  };

  const handleApply = async (eventId) => {
    try {
      await api.post(`/clubs/${activeClub.id}/events/${eventId}/applications/apply`);
      alert('Başvuru alındı!');
      fetchEvents();
    } catch (e) { alert('Hata oluştu.'); }
  };

  const fetchApplications = async (eventId) => {
    setLoadingApps(true);
    try {
      const res = await api.get(`/clubs/${activeClub.id}/events/${eventId}/applications`);
      setApps(res.data);
    } catch (e) {}
    setLoadingApps(false);
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      await api.put(`/clubs/${activeClub.id}/events/${showApps.id}/applications/${appId}/status`, JSON.stringify(newStatus), {
        params: { requesterId: activeMembershipId }
      });
      fetchApplications(showApps.id);
    } catch (e) { alert(e.response?.data || 'Hata oluştu.'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/clubs/${activeClub.id}/events`, {
        ...form,
        responsible: form.responsible_id ? { id: form.responsible_id } : null,
        eventDate: form.eventDate ? new Date(form.eventDate).toISOString().slice(0, 19) : null,
        capacity: parseInt(form.capacity) || 0,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchEvents();
    } catch (e) { 
      alert(e.response?.data || 'Etkinlik oluşturulurken bir hata oluştu.'); 
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Etkinliği silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/events/${id}`);
      fetchEvents();
    } catch (e) {}
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Etkinlikler</h1>
          <p className="text-gray-500 font-medium">
            {activeClub?.name} etkinlik planları ve katılım yönetimi
          </p>
        </div>
        {isBaskan && (
          <Button variant="primary" onClick={() => setShowForm(true)} icon={Plus}>
            Yeni Etkinlik
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Etkinlikler yükleniyor...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-24 text-center">
           <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
           <p className="text-sm font-bold text-gray-900 mb-1">Henüz bir etkinlik planlanmamış</p>
           <p className="text-xs text-gray-500">Yeni bir etkinlik oluşturarak topluluğu hareketlendirin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(ev => {
            const s = STATUS[ev.status] || STATUS.upcoming;
            const SIcon = s.icon;
            const myApp = myApps[ev.id];
            const canManage = canManageEvent(ev);
            const isStaff = myStaffEvents.includes(ev.id) || isResponsibleFor(ev);

            return (
              <Card key={ev.id} className="group relative overflow-hidden" noPadding>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.cls}`}>
                      <SIcon size={12} /> {s.label}
                    </span>
                    <div className="flex gap-2">
                       {isStaff && !isBaskan && (
                         <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                           <Briefcase size={12} /> GÖREVLİ
                         </span>
                       )}
                       {isBaskan && (
                        <button 
                          onClick={() => handleDelete(ev.id)} 
                          className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                       )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-1">{ev.name}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 text-sm text-gray-500 font-medium">
                      <Calendar size={16} className="text-gray-400" />
                      {ev.eventDate ? new Date(ev.eventDate).toLocaleString('tr-TR') : 'Belirtilmedi'}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-500 font-medium">
                      <MapPin size={16} className="text-gray-400" /> {ev.location || 'Belirtilmedi'}
                    </div>
                    {ev.responsible && (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold border border-indigo-100 mt-2">
                        <ShieldCheck size={14} /> SORUMLU: {ev.responsible.user?.email?.split('@')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    {canManage ? (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => { setShowApps(ev); fetchApplications(ev.id); }}
                          className="text-[11px] font-bold"
                        >
                          BAŞVURULAR
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => { setShowStaffModal(ev); fetchStaff(ev.id); fetchTasks(ev.id); setActiveTab('staff'); }}
                          className="text-[11px] font-bold text-amber-700 border-amber-200 hover:bg-amber-50"
                        >
                          EKİP & GÖREV
                        </Button>
                      </>
                    ) : isStaff ? (
                       <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => { setShowStaffModal(ev); fetchStaff(ev.id); fetchTasks(ev.id); setActiveTab('tasks'); }}
                        className="text-[11px] font-bold"
                       >
                         GÖREVLERİM
                       </Button>
                    ) : myApp ? (
                       <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold border ${
                         myApp.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                         myApp.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                         'bg-amber-50 text-amber-700 border-amber-100'
                       }`}>
                         {myApp.status === 'approved' ? 'BAŞVURU ONAYLANDI' : 
                          myApp.status === 'rejected' ? 'BAŞVURU REDDEDİLDİ' : 
                          'BAŞVURU BEKLEMEDE'}
                       </div>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleApply(ev.id)} className="text-[11px] font-bold">
                        ETKİNLİĞE KATIL
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200" noPadding>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Yeni Etkinlik</h2>
                <p className="text-xs font-medium text-gray-500">Etkinlik detaylarını girin</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <Input 
                label="Etkinlik Adı"
                required 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="Örn: Kariyer Günleri 2025"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Tarih & Saat"
                  type="datetime-local" 
                  value={form.eventDate} 
                  onChange={e => setForm({...form, eventDate: e.target.value})} 
                />
                <Input 
                  label="Kapasite"
                  type="number" 
                  min="0" 
                  value={form.capacity} 
                  onChange={e => setForm({...form, capacity: e.target.value})} 
                />
              </div>

              <Input 
                label="Konum / Mekan"
                value={form.location} 
                onChange={e => setForm({...form, location: e.target.value})} 
                placeholder="Örn: Kültür Merkezi, B Salonu" 
              />

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Sorumlu Ekip Lideri</label>
                <select 
                  required 
                  value={form.responsible_id} 
                  onChange={e => setForm({...form, responsible_id: e.target.value})} 
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                >
                  <option value="">Seçiniz...</option>
                  {members.filter(m => (m.role || '').toLowerCase().includes('lider')).map(m => (
                    <option key={m.id} value={m.id}>{m.user?.firstName ? `${m.user.firstName} ${m.user.lastName}` : m.user?.email?.split('@')[0]}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)} className="flex-1">İPTAL</Button>
                <Button variant="primary" type="submit" loading={saving} className="flex-1">OLUŞTUR</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* STAFF & TASK MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200" noPadding>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                 <h2 className="text-lg font-bold text-gray-900">{showStaffModal.name}</h2>
                 <p className="text-xs font-medium text-amber-600">Ekip & Görev Yönetimi</p>
              </div>
              <button onClick={() => setShowStaffModal(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex px-6 bg-gray-50/50 border-b border-gray-100">
               <button 
                onClick={() => { setActiveTab('staff'); fetchStaff(showStaffModal.id); }} 
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'staff' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
               >
                 PERSONEL
               </button>
               <button 
                onClick={() => { setActiveTab('tasks'); fetchTasks(showStaffModal.id); }} 
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
               >
                 GÖREVLER
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {activeTab === 'staff' ? (
                 <>
                   {isResponsibleFor(showStaffModal) && (
                     <form onSubmit={handleAddStaff} className="flex flex-col sm:flex-row gap-3 items-end p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl">
                        <div className="flex-1 w-full space-y-1.5">
                          <label className="text-[11px] font-bold text-indigo-700 uppercase px-1">Üye Seç</label>
                          <select 
                            required 
                            value={selectedMemberForStaff} 
                            onChange={e => setSelectedMemberForStaff(e.target.value)} 
                            className="w-full px-3 py-2 text-sm bg-white border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                          >
                            <option value="">Seçiniz...</option>
                            {members.map(m => (
                              <option key={m.id} value={m.id}>{m.user?.firstName ? `${m.user.firstName} ${m.user.lastName}` : m.user?.email?.split('@')[0]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full sm:w-48 space-y-1.5">
                          <label className="text-[11px] font-bold text-indigo-700 uppercase px-1">Görev Tanımı</label>
                          <input 
                            value={staffRole} 
                            onChange={e => setStaffRole(e.target.value)} 
                            className="w-full px-3 py-2 text-sm bg-white border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium" 
                          />
                        </div>
                        <Button variant="primary" type="submit" className="shrink-0 p-2.5">
                          <UserPlus size={18} />
                        </Button>
                     </form>
                   )}
                   
                   <div className="space-y-2">
                      {loadingStaff ? (
                        <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></div>
                      ) : staffList.length === 0 ? (
                        <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-sm text-gray-400 font-medium italic">Henüz personel atanmamış.</p>
                        </div>
                      ) : (
                        staffList.map(s => (
                          <div key={s.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 transition-all shadow-sm group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm border border-indigo-100">
                                  {(s.membership?.user?.firstName?.[0] || s.membership?.user?.email?.[0]).toUpperCase()}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-gray-900">
                                     {s.membership?.user?.firstName ? `${s.membership.user.firstName} ${s.membership.user.lastName}` : s.membership?.user?.email?.split('@')[0]}
                                   </p>
                                   <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{s.role}</p>
                                </div>
                             </div>
                             {isResponsibleFor(showStaffModal) && (
                               <button 
                                onClick={() => handleRemoveStaff(s.id)} 
                                className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                               >
                                 <UserMinus size={18} />
                               </button>
                             )}
                          </div>
                        ))
                      )}
                   </div>
                 </>
               ) : (
                 <>
                   {isResponsibleFor(showStaffModal) && (
                     <form onSubmit={handleCreateTask} className="p-5 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="sm:col-span-2">
                              <Input 
                                label="Görev Başlığı"
                                required 
                                value={taskForm.title} 
                                onChange={e => setTaskForm({...taskForm, title: e.target.value})} 
                                className="bg-white border-indigo-200"
                                placeholder="Örn: Masa düzenini ayarla"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-indigo-700 uppercase px-1">Sorumlu Personel</label>
                              <select 
                                required 
                                value={taskForm.assignedToId} 
                                onChange={e => setTaskForm({...taskForm, assignedToId: e.target.value})} 
                                className="w-full px-3 py-2 text-sm bg-white border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                              >
                                 <option value="">Seçiniz...</option>
                                 {showStaffModal.responsible && (
                                    <option value={showStaffModal.responsible.id}>
                                       (Lider) {showStaffModal.responsible.user?.email?.split('@')[0]}
                                    </option>
                                 )}
                                 {staffList.filter(s => s.membership.id !== showStaffModal.responsible?.id).map(s => (
                                    <option key={s.membership.id} value={s.membership.id}>{s.membership.user?.email?.split('@')[0]}</option>
                                 ))}
                              </select>
                           </div>
                           <Input 
                            label="Son Tarih"
                            type="date" 
                            required 
                            value={taskForm.dueDate} 
                            onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} 
                            className="bg-white border-indigo-200"
                           />
                        </div>
                        <Button type="submit" className="w-full" icon={Plus}>GÖREV ATA</Button>
                     </form>
                   )}
                   <div className="space-y-3">
                      {loadingTasks ? (
                        <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></div>
                      ) : tasks.length === 0 ? (
                        <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-sm text-gray-400 font-medium italic">Görev listesi boş.</p>
                        </div>
                      ) : (
                        tasks.map(task => {
                          const isMyTask = Number(task.assignedTo?.id) === Number(activeMembershipId);
                          const canUpdate = isMyTask || isResponsibleFor(showStaffModal);
                          const isDone = task.status === 'completed';
                          return (
                            <div key={task.id} className={`flex items-center justify-between p-4 bg-white border rounded-xl transition-all shadow-sm group ${isDone ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100 hover:border-indigo-200'}`}>
                               <div className="flex items-center gap-4">
                                  {canUpdate ? (
                                    <button 
                                      onClick={() => handleUpdateTaskStatus(task.id, isDone ? 'pending' : 'completed')} 
                                      className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-transparent hover:border-indigo-400'}`}
                                    >
                                       <CheckSquare size={14} />
                                    </button>
                                  ) : (
                                    <div className="shrink-0 w-6 h-6 rounded-lg border-2 border-gray-200" />
                                  )}
                                  <div>
                                     <h4 className={`text-sm font-bold ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</h4>
                                     <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase">@{task.assignedTo?.user?.email?.split('@')[0]}</span>
                                        {task.dueDate && <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><Clock size={10} /> {new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>}
                                     </div>
                                  </div>
                               </div>
                               {isResponsibleFor(showStaffModal) && (
                                 <button 
                                  onClick={() => handleDeleteTask(task.id)} 
                                  className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               )}
                            </div>
                          );
                        })
                      )}
                   </div>
                 </>
               )}
            </div>
          </Card>
        </div>
      )}

      {/* APPLICATIONS MODAL */}
      {showApps && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[75vh] flex flex-col animate-in zoom-in-95 duration-200" noPadding>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Başvurular</h2>
                <p className="text-xs font-medium text-gray-500">{showApps.name}</p>
              </div>
              <button onClick={() => setShowApps(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
               {loadingApps ? (
                 <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></div>
               ) : apps.length === 0 ? (
                 <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400 font-medium italic">Henüz başvuru bulunmuyor.</p>
                 </div>
               ) : (
                  <div className="space-y-3">
                     {apps.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-indigo-600 border border-gray-100 shadow-sm font-medium">
                                {(app.membership?.user?.firstName?.[0] || app.membership?.user?.email?.[0]).toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-gray-900">
                                   {app.membership?.user?.firstName ? `${app.membership.user.firstName} ${app.membership.user.lastName}` : app.membership?.user?.email?.split('@')[0]}
                                 </p>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{app.status}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              {app.status === 'pending' && isResponsibleFor(showApps) ? (
                                 <>
                                    <button onClick={() => handleUpdateAppStatus(app.id, 'rejected')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Reddet"><UserX size={18} /></button>
                                    <button onClick={() => handleUpdateAppStatus(app.id, 'approved')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Onayla"><UserCheck size={18} /></button>
                                 </>
                              ) : (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                  app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                  app.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                  'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {app.status === 'approved' ? 'ONAYLANDI' : app.status === 'rejected' ? 'REDDEDİLDİ' : 'BEKLEMEDE'}
                                </span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
