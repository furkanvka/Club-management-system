import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus, Calendar, MapPin, Users, Trash2,
  Clock, CheckCircle, XCircle, AlertCircle, X,
  Send, QrCode, UserCheck, UserX, Loader2,
  Briefcase, UserPlus, UserMinus, ShieldCheck,
  CheckSquare, Square, ClipboardList
} from 'lucide-react';

const STATUS = {
  upcoming: { label: 'Yaklaşan', cls: 'bg-blue-100 text-blue-700', icon: Clock },
  ongoing: { label: 'Devam Eden', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
  completed: { label: 'Tamamlandı', cls: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  cancelled: { label: 'İptal', cls: 'bg-red-100 text-red-600', icon: XCircle },
  draft: { label: 'Taslak', cls: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
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
  const [showApps, setShowApps] = useState(null); // event object
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [myApps, setMyApps] = useState({});

  // Staff & Task Management State
  const [showStaffModal, setShowStaffModal] = useState(null); // event object
  const [activeTab, setActiveTab] = useState('staff'); // staff | tasks
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffRole, setStaffRole] = useState('Görevli');
  const [selectedMemberForStaff, setSelectedMemberForStaff] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', assignedToId: '', dueDate: '', priority: 'normal' });
  const [myStaffEvents, setMyStaffEvents] = useState([]); // List of event IDs where I am staff

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

      // Find events where I am staff
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
  }, [activeClub?.id, user?.email, isBaskan, isResponsibleFor]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // --- STAFF LOGIC ---
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

  // --- TASK LOGIC ---
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

  // --- OTHER LOGIC ---
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
    } catch (e) { alert(e.response?.data || 'Hata.'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Etkinliği sil?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/events/${id}`);
      fetchEvents();
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Etkinlikler</h1>
          <p className="text-sm text-gray-500">{activeClub?.name} yönetim paneli</p>
        </div>
        {isBaskan && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            <Plus size={18} /> Etkinlik Oluştur
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-indigo-50/50 flex items-center justify-between">
              <h2 className="font-black text-gray-900">Yeni Etkinlik Taslağı</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Etkinlik Adı</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tarih</label>
                  <input type="datetime-local" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Kapasite</label>
                  <input type="number" min="0" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Konum / Mekan</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" placeholder="Amfi Tiyatro, B101..." />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Sorumlu Ekip Lideri</label>
                <select required value={form.responsible_id} onChange={e => setForm({...form, responsible_id: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white">
                  <option value="">Seçiniz...</option>
                  {members.filter(m => m.role?.toLowerCase().includes('lider')).map(m => (
                    <option key={m.id} value={m.id}>{m.user?.email?.split('@')[0]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-black text-gray-500 hover:bg-gray-50 uppercase tracking-widest">İptal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 disabled:opacity-50 uppercase tracking-widest">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-20 text-center shadow-sm">
           <Calendar size={60} className="text-gray-100 mx-auto mb-4" />
           <p className="text-gray-400 font-bold">Henüz bir etkinlik planlanmamış.</p>
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
              <div key={ev.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2">
                   <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${s.cls}`}>
                     <SIcon size={12} /> {s.label}
                   </span>
                   {isStaff && !isBaskan && (
                     <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                       <Briefcase size={10} /> Görevli
                     </span>
                   )}
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-2 pr-20">{ev.name}</h3>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Calendar size={16} className="text-indigo-400" />
                    {ev.eventDate ? new Date(ev.eventDate).toLocaleString('tr-TR') : 'Tarih belirtilmedi'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <MapPin size={16} className="text-indigo-400" /> {ev.location || 'Konum belirtilmedi'}
                  </div>
                  {ev.responsible && (
                    <div className="flex items-center gap-2 text-xs font-black text-indigo-600 bg-indigo-50 w-fit px-3 py-1.5 rounded-xl">
                      <ShieldCheck size={14} /> Sorumlu: {ev.responsible.user?.email?.split('@')[0]}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex gap-2">
                    {canManage ? (
                      <>
                        <button onClick={() => { setShowApps(ev); fetchApplications(ev.id); }} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition">Başvurular</button>
                        <button onClick={() => { setShowStaffModal(ev); fetchStaff(ev.id); fetchTasks(ev.id); setActiveTab('staff'); }} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition">Ekip</button>
                      </>
                    ) : isStaff ? (
                       <button onClick={() => { setShowStaffModal(ev); fetchStaff(ev.id); fetchTasks(ev.id); setActiveTab('tasks'); }} className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition">Görevlerimi Gör</button>
                    ) : myApp ? (
                       <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                         myApp.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         myApp.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                         'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                         {myApp.status === 'approved' ? 'Başvuru Onaylandı' : 
                          myApp.status === 'rejected' ? 'Başvuru Reddedildi' : 
                          'Başvuru Beklemede'}
                       </div>
                    ) : (
                      <button onClick={() => handleApply(ev.id)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition">Katıl</button>
                    )}
                  </div>
                  {isBaskan && (
                    <button onClick={() => handleDelete(ev.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STAFF & TASK MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-amber-50/50 flex items-center justify-between">
              <div>
                 <h2 className="text-xl font-black text-gray-900 tracking-tight">{showStaffModal.name}</h2>
                 <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">Etkinlik Ekibi & Görev Dağılımı</p>
              </div>
              <button onClick={() => setShowStaffModal(null)} className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-gray-600 transition-all"><X size={24} /></button>
            </div>

            <div className="flex px-8 bg-gray-50/50 border-b border-gray-100">
               <button onClick={() => { setActiveTab('staff'); fetchStaff(showStaffModal.id); }} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'staff' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'}`}>Personel</button>
               <button onClick={() => { setActiveTab('tasks'); fetchTasks(showStaffModal.id); }} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'tasks' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'}`}>Görevler</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               {activeTab === 'staff' ? (
                 <>
                   {isResponsibleFor(showStaffModal) && (
                     <form onSubmit={handleAddStaff} className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Üye Seç</label>
                          <select required value={selectedMemberForStaff} onChange={e => setSelectedMemberForStaff(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none bg-white font-medium">
                            <option value="">Seçiniz...</option>
                            {members.map(m => (
                              <option key={m.id} value={m.id}>{m.user?.email?.split('@')[0]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full sm:w-40">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Görev</label>
                          <input value={staffRole} onChange={e => setStaffRole(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium" />
                        </div>
                        <button type="submit" className="bg-amber-500 text-white p-2.5 rounded-xl hover:bg-amber-600 transition shadow-lg shrink-0"><UserPlus size={20} /></button>
                     </form>
                   )}
                   <div className="space-y-3">
                      {loadingStaff ? <Loader2 className="animate-spin mx-auto text-amber-500" /> : staffList.length === 0 ? <p className="text-center text-gray-400 py-10 font-bold italic">Henüz personel atanmamış.</p> : (
                        <div className="grid grid-cols-1 gap-2">
                          {staffList.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-amber-200 transition-all shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-sm">{s.membership?.user?.email?.[0].toUpperCase()}</div>
                                  <div>
                                     <p className="text-sm font-black text-gray-800">{s.membership?.user?.email?.split('@')[0]}</p>
                                     <p className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">{s.role}</p>
                                  </div>
                               </div>
                               {isResponsibleFor(showStaffModal) && (
                                 <button onClick={() => handleRemoveStaff(s.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><UserMinus size={18} /></button>
                               )}
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                 </>
               ) : (
                 <>
                   {isResponsibleFor(showStaffModal) && (
                     <form onSubmit={handleCreateTask} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="sm:col-span-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Görev Başlığı</label>
                              <input required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none font-medium" />
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Sorumlu Personel</label>
                              <select required value={taskForm.assignedToId} onChange={e => setTaskForm({...taskForm, assignedToId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white font-medium">
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
                           <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Son Tarih</label>
                              <input type="date" required value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none font-medium" />
                           </div>
                        </div>
                        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">Görev Ata</button>
                     </form>
                   )}
                   <div className="space-y-3">
                      {loadingTasks ? <Loader2 className="animate-spin mx-auto text-indigo-500" /> : tasks.length === 0 ? <p className="text-center text-gray-400 py-10 font-bold italic">Görev listesi boş.</p> : (
                        <div className="space-y-3">
                          {tasks.map(task => {
                            const isMyTask = Number(task.assignedTo?.id) === Number(activeMembershipId);
                            const canUpdate = isMyTask || isResponsibleFor(showStaffModal);
                            return (
                              <div key={task.id} className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex items-start justify-between ${task.status === 'completed' ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100'}`}>
                                 <div className="flex gap-4">
                                    {canUpdate ? (
                                      <button onClick={() => handleUpdateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')} className={`mt-1 transition-colors ${task.status === 'completed' ? 'text-emerald-500' : 'text-gray-300 hover:text-indigo-400'}`}>
                                         {task.status === 'completed' ? <CheckSquare size={24} /> : <Square size={24} />}
                                      </button>
                                    ) : (
                                      <div className="mt-1 text-gray-200"><Square size={24} /></div>
                                    )}
                                    <div>
                                       <h4 className={`font-bold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</h4>
                                       <div className="flex items-center gap-3 mt-1.5">
                                          <span className="text-[9px] font-black text-gray-400 uppercase bg-white border border-gray-100 px-2 py-0.5 rounded-lg">@{task.assignedTo?.user?.email?.split('@')[0]}</span>
                                          {task.dueDate && <span className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1"><Clock size={10} /> {new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>}
                                       </div>
                                    </div>
                                 </div>
                                 {isResponsibleFor(showStaffModal) && (
                                   <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                 )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* APPLICATIONS MODAL (Simplified) */}
      {showApps && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Başvurular</h2>
              <button onClick={() => setShowApps(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-all"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
               {loadingApps ? <Loader2 className="animate-spin mx-auto text-indigo-500" /> : apps.length === 0 ? <p className="text-center text-gray-400 py-10">Başvuru bulunamadı.</p> : (
                  <div className="space-y-3">
                     {apps.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 border border-gray-100">{app.membership?.user?.email?.[0].toUpperCase()}</div>
                              <div>
                                 <p className="text-sm font-bold text-gray-800">{app.membership?.user?.email?.split('@')[0]}</p>
                                 <p className="text-[10px] text-gray-400 font-black uppercase">{app.status}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              {app.status === 'pending' && isResponsibleFor(showApps) ? (
                                 <>
                                    <button onClick={() => handleUpdateAppStatus(app.id, 'rejected')} className="p-2 bg-white text-red-500 rounded-xl border border-gray-100 hover:bg-red-50 transition-all"><UserX size={18} /></button>
                                    <button onClick={() => handleUpdateAppStatus(app.id, 'approved')} className="p-2 bg-white text-indigo-600 rounded-xl border border-gray-100 hover:bg-indigo-50 transition-all"><UserCheck size={18} /></button>
                                 </>
                              ) : (
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
                                  app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                                  app.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {app.status === 'approved' ? 'Onaylandı' : app.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                                </span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
