import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { Plus, BookOpen, Trash2, Calendar, Users, X, MapPin, Tag, FileText, CheckCircle, Megaphone, Download, Upload } from 'lucide-react';

export const Meetings = ({ view }) => {
  const { activeClub, activeRole, activeMembershipId } = useClub();
  const { user } = useAuth();
  
  const [meetings, setMeetings] = useState([]);
  const [teams, setTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reportingMeeting, setReportingMeeting] = useState(null); 
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [form, setForm] = useState({ 
    title: '', content: '', meetingDate: '', attendees: '', location: '', type: 'GENEL', teamId: '' 
  });
  
  const [saving, setSaving] = useState(false);

  // PROJELERDEKİ STABİL ROL KONTROLLERİ
  const isAdmin = activeRole === 'baskan' || user?.loginType === 'club';
  const isLider = activeRole === 'ekip_lideri' || activeRole === 'ekip-lideri';
  const canAnnounce = isAdmin || isLider;

  const fetchData = useCallback(async () => {
    if (!activeClub?.id) return;
    setLoading(true);
    try {
      const [mRes, tRes] = await Promise.all([
        api.get(`/clubs/${activeClub.id}/meetings`),
        api.get(`/clubs/${activeClub.id}/teams`)
      ]);
      setMeetings(mRes.data || []);
      setTeams(tRes.data || []);
    } catch (err) {
      console.error("Hata:", err);
    } finally {
      setLoading(false);
    }
  }, [activeClub?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openReportForm = (m) => {
    setReportingMeeting(m);
    setForm({ ...form, content: '', attendees: '' });
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Lütfen sadece PDF dosyası seçin.');
      e.target.value = null;
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const downloadPDF = (meeting) => {
    if (!meeting.fileData) return;
    const link = document.createElement('a');
    link.href = meeting.fileData;
    link.download = meeting.fileName || `${meeting.title}_raporu.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ekip Liderinin kendi ekibini seçebildiği o meşhur filtre (Projects.jsx ile aynı)
  const selectableTeams = useMemo(() => {
    if (isAdmin) return teams;
    return teams.filter(t => Number(t.leader?.id) === Number(activeMembershipId));
  }, [teams, isAdmin, activeMembershipId]);

  // Toplantı Listeleme Filtresi
  const filteredMeetings = useMemo(() => {
    const statusToFilter = view === 'announcements' ? 'DUYURU' : 'RAPORLANDI';
    const baseMeetings = meetings.filter(m => m.status === statusToFilter);

    if (isAdmin) return baseMeetings;

    return baseMeetings.filter(m => {
      if (m.type === 'GENEL') return true;
      if (m.type === 'EKIP' && m.team) {
        return teams.some(t => t.id === m.team.id);
      }
      return false;
    });
  }, [meetings, view, isAdmin, teams]);

  useEffect(() => {
    if (showForm) {
      setForm(prev => ({ ...prev, type: isAdmin ? 'GENEL' : 'EKIP', teamId: '' }));
    }
  }, [showForm, isAdmin]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        meetingDate: form.meetingDate ? new Date(form.meetingDate).toISOString().slice(0, 19) : null,
        status: 'DUYURU',
        team: form.type === 'EKIP' ? { id: form.teamId } : null
      };
      await api.post(`/clubs/${activeClub.id}/meetings`, payload);
      setShowForm(false);
      setForm({ title: '', content: '', meetingDate: '', attendees: '', location: '', type: 'GENEL', teamId: '' });
      fetchData();
    } catch (e) {
      alert('İşlem başarısız.');
    } finally { setSaving(false); }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let fileData = null;
      let fileName = null;

      if (selectedFile) {
        fileData = await fileToBase64(selectedFile);
        fileName = selectedFile.name;
      }

      await api.put(`/clubs/${activeClub.id}/meetings/${reportingMeeting.id}/report`, {
        content: form.content, 
        attendees: form.attendees,
        fileData,
        fileName
      });
      setReportingMeeting(null);
      fetchData();
    } catch (e) {
      alert('Rapor kaydedilemedi.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/meetings/${id}`);
      fetchData();
    } catch (e) { alert('Silinemedi.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${view === 'announcements' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'}`}>
            {view === 'announcements' ? <Megaphone size={24} /> : <BookOpen size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {view === 'announcements' ? 'Toplantı Duyuruları' : 'Toplantı Raporları'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">{activeClub?.name}</p>
          </div>
        </div>
        {canAnnounce && view === 'announcements' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
            <Plus size={18} /> Yeni Duyuru
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-900">Toplantı Planla</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              <input required placeholder="Toplantı Başlığı" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-4">
                {isAdmin ? (
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none">
                    <option value="GENEL">Genel</option>
                    <option value="EKIP">Ekip</option>
                  </select>
                ) : <div className="p-3 text-sm font-bold text-indigo-600">Ekip Toplantısı</div>}
                <input type="datetime-local" required value={form.meetingDate} onChange={e => setForm({...form, meetingDate: e.target.value})} className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
              </div>
              {(form.type === 'EKIP' || !isAdmin) && (
                <select required value={form.teamId} onChange={e => setForm({...form, teamId: e.target.value})} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none">
                  <option value="">Ekip Seçin...</option>
                  {selectableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
              <input placeholder="Yer (Zoom, Ofis vb.)" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
              <button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
                {saving ? 'Oluşturuluyor...' : 'Duyuruyu Yayınla'}
              </button>
            </form>
          </div>
        </div>
      )}

      {reportingMeeting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-emerald-50/20 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Rapor Hazırla</h2>
              <button onClick={() => setReportingMeeting(null)} className="text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddReport} className="p-6 space-y-4">
              <input required placeholder="Katılımcılar" value={form.attendees} onChange={e => setForm({...form, attendees: e.target.value})} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
              <textarea placeholder="Notlar / Kararlar (Opsiyonel)" rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">PDF Rapor Yükle</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="border-2 border-dashed border-gray-100 group-hover:border-emerald-200 bg-gray-50 rounded-2xl p-6 transition-all flex flex-col items-center gap-2">
                    <Upload className="text-gray-300 group-hover:text-emerald-500 transition-colors" size={24} />
                    <span className="text-sm font-medium text-gray-500 group-hover:text-emerald-600">
                      {selectedFile ? selectedFile.name : 'Dosya Seçin veya Sürükleyin'}
                    </span>
                    <span className="text-[10px] text-gray-400">Sadece PDF (Maks 10MB)</span>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
                {saving ? 'Kaydediliyor...' : 'Raporu Tamamla'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filteredMeetings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-20 text-center shadow-sm">
          <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-bold">Henüz bir kayıt bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map(m => (
            <div key={m.id} className={`bg-white border border-gray-100 rounded-[2rem] p-6 transition-all hover:shadow-xl border-l-[6px] ${m.status === 'DUYURU' ? 'border-l-amber-400' : 'border-l-emerald-400'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${m.status === 'DUYURU' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {m.status === 'DUYURU' ? <Megaphone size={20} /> : <CheckCircle size={20} />}
                </div>
                <div className="flex items-center gap-1">
                  {m.status === 'DUYURU' && (
                    <button onClick={() => openReportForm(m)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-100 transition">
                      <FileText size={12} /> Rapor Yaz
                    </button>
                  )}
                  {m.fileData && (
                    <button onClick={() => downloadPDF(m)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-100 transition">
                      <Download size={12} /> PDF İndir
                    </button>
                  )}
                  {isAdmin && <button onClick={() => handleDelete(m.id)} className="p-2 text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-gray-900 text-lg leading-tight">{m.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {m.type === 'EKIP' && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">{m.team?.name || 'Ekip'}</span>}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                      <Calendar size={12} className="text-indigo-400" /> {new Date(m.meetingDate).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
                {m.status === 'RAPORLANDI' && (
                  <div className="pt-4 border-t border-gray-50 space-y-2">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Katılımcılar: <span className="text-gray-500 normal-case">{m.attendees}</span></p>
                    {m.content && <div className="p-4 bg-gray-50 rounded-2xl text-[13px] text-gray-600 italic line-clamp-3">{m.content}</div>}
                    {m.fileData && (
                      <div className="flex items-center gap-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <FileText size={16} className="text-indigo-500" />
                        <span className="text-[11px] font-bold text-indigo-700 truncate">{m.fileName || 'Rapor.pdf'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};