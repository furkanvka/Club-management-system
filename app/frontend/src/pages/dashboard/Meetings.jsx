import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Plus, 
  BookOpen, 
  Trash2, 
  Calendar, 
  X, 
  FileText, 
  CheckCircle, 
  Megaphone, 
  Download, 
  Upload,
  Loader2,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

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

  const selectableTeams = useMemo(() => {
    if (isAdmin) return teams;
    return teams.filter(t => Number(t.leader?.id) === Number(activeMembershipId));
  }, [teams, isAdmin, activeMembershipId]);

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
    if (!window.confirm('Bu toplantı kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/meetings/${id}`);
      fetchData();
    } catch (e) { alert('Silinemedi.'); }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${view === 'announcements' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {view === 'announcements' ? <Megaphone size={24} /> : <BookOpen size={24} />}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {view === 'announcements' ? 'Toplantı Duyuruları' : 'Toplantı Raporları'}
            </h1>
            <p className="text-gray-500 font-medium">
              {activeClub?.name} topluluk koordinasyonu
            </p>
          </div>
        </div>
        {canAnnounce && view === 'announcements' && (
          <Button variant="primary" onClick={() => setShowForm(true)} icon={Plus}>
            Yeni Duyuru
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Toplantılar yükleniyor...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-24 text-center">
          <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-900 mb-1">Henüz bir kayıt bulunmuyor</p>
          <p className="text-xs text-gray-500 italic">Paylaşılan duyurular veya raporlar burada görünecek.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map(m => (
            <Card key={m.id} className={`group hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col h-full`} noPadding>
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm ${
                    m.status === 'DUYURU' 
                    ? 'bg-amber-50 text-amber-700 border-amber-100' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {m.status === 'DUYURU' ? <Megaphone size={12} /> : <CheckCircle size={12} />}
                    {m.status}
                  </span>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                  {m.title}
                </h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(m.meetingDate).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Clock size={14} className="text-gray-400" />
                    {new Date(m.meetingDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {m.location && (
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <MapPin size={14} className="text-gray-400" />
                      {m.location}
                    </div>
                  )}
                  {m.type === 'EKIP' && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-100 mt-2">
                       {m.team?.name?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Report Preview */}
                {m.status === 'RAPORLANDI' && (
                  <div className="mt-auto pt-4 border-t border-gray-100 space-y-4">
                    <div className="flex items-center gap-2">
                       <Users size={14} className="text-emerald-500" />
                       <p className="text-[10px] font-bold text-gray-500 uppercase">Katılımcılar: <span className="text-gray-900 normal-case font-medium">{m.attendees}</span></p>
                    </div>
                    {m.content && <p className="text-xs text-gray-500 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{m.content}"</p>}
                    {m.fileData && (
                      <button 
                        onClick={() => downloadPDF(m)}
                        className="w-full flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 group/btn hover:bg-indigo-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="text-indigo-600" />
                          <span className="text-[11px] font-bold text-indigo-700 truncate">{m.fileName || 'Toplantı_Raporu.pdf'}</span>
                        </div>
                        <Download size={14} className="text-indigo-400 group-hover/btn:text-indigo-600 transition-colors" />
                      </button>
                    )}
                  </div>
                )}

                {/* Report Action */}
                {m.status === 'DUYURU' && (
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full text-[11px] font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => openReportForm(m)}
                      icon={FileText}
                    >
                      RAPOR HAZIRLA
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200" noPadding>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Toplantı Planla</h2>
                <p className="text-xs font-medium text-gray-500">Duyuruyu yayınlayın</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-5">
              <Input 
                label="Toplantı Başlığı"
                required 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                placeholder="Örn: Haftalık Koordinasyon"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Toplantı Türü</label>
                  {isAdmin ? (
                    <select 
                      value={form.type} 
                      onChange={e => setForm({...form, type: e.target.value})} 
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    >
                      <option value="GENEL">Genel</option>
                      <option value="EKIP">Ekip</option>
                    </select>
                  ) : <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-indigo-600">EKİP TOPLANTISI</div>}
                </div>
                <Input 
                  label="Tarih & Saat"
                  type="datetime-local" 
                  required 
                  value={form.meetingDate} 
                  onChange={e => setForm({...form, meetingDate: e.target.value})} 
                />
              </div>

              {(form.type === 'EKIP' || !isAdmin) && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Ekip Seçimi</label>
                  <select 
                    required 
                    value={form.teamId} 
                    onChange={e => setForm({...form, teamId: e.target.value})} 
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Ekip Seçin...</option>
                    {selectableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <Input 
                label="Yer / Platform"
                value={form.location} 
                onChange={e => setForm({...form, location: e.target.value})} 
                placeholder="Örn: Zoom, Ofis, B102" 
              />

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)} className="flex-1">İPTAL</Button>
                <Button variant="primary" type="submit" loading={saving} className="flex-1">YAYINLA</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportingMeeting && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg animate-in zoom-in-95 duration-200" noPadding>
            <div className="px-6 py-5 border-b border-gray-100 bg-emerald-50/20 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Toplantı Raporu</h2>
                <p className="text-xs font-medium text-emerald-700">{reportingMeeting.title}</p>
              </div>
              <button onClick={() => setReportingMeeting(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddReport} className="p-6 space-y-6">
              <Input 
                label="Katılımcı Listesi"
                required 
                value={form.attendees} 
                onChange={e => setForm({...form, attendees: e.target.value})} 
                placeholder="İsimleri aralarında virgül ile yazın..."
              />

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Toplantı Özeti & Kararlar</label>
                <textarea 
                  rows={4} 
                  value={form.content} 
                  onChange={e => setForm({...form, content: e.target.value})} 
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  placeholder="Konuşulan başlıkları ve alınan kararları belirtin..." 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">PDF Rapor Belgesi (Opsiyonel)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="border-2 border-dashed border-gray-200 group-hover:border-emerald-300 bg-gray-50 rounded-xl p-6 transition-all flex flex-col items-center gap-3">
                    <Upload className={`transition-colors ${selectedFile ? 'text-emerald-500' : 'text-gray-300 group-hover:text-emerald-400'}`} size={24} />
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-600">
                        {selectedFile ? selectedFile.name : 'Dosya Seçin veya Sürükleyin'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">Yalnızca PDF (Maks. 10MB)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" type="button" onClick={() => setReportingMeeting(null)} className="flex-1">VAZGEÇ</Button>
                <Button variant="primary" type="submit" loading={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-600">RAPORU KAYDET</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
