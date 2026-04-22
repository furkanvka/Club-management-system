import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { Plus, BookOpen, Trash2, Calendar, Users, X, Save } from 'lucide-react';

export const Meetings = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', meetingDate: '', attendees: '' });
  const [saving, setSaving] = useState(false);

  const canManage = activeRole === 'baskan' || user?.loginType === 'club';

  const fetchMeetings = () => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/meetings`)
      .then(r => { setMeetings(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMeetings(); }, [activeClub]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/clubs/${activeClub.id}/meetings`, {
        ...form,
        meetingDate: form.meetingDate ? new Date(form.meetingDate).toISOString().slice(0, 19) : null
      });
      setForm({ title: '', content: '', meetingDate: '', attendees: '' });
      setShowForm(false);
      fetchMeetings();
    } catch (e) {
      alert('Rapor kaydedilemedi.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu raporu silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/meetings/${id}`);
      fetchMeetings();
    } catch (e) { alert('Silinemedi.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Toplantı Raporları</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeClub?.name} — {meetings.length} rapor</p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
            <Plus size={16} /> Rapor Ekle
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Yeni Toplantı Raporu</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Toplantı Başlığı *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Haftalık Değerlendirme..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Toplantı Tarihi</label>
                <input type="datetime-local" value={form.meetingDate} onChange={e => setForm({...form, meetingDate: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Katılımcılar</label>
                <input value={form.attendees} onChange={e => setForm({...form, attendees: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Ali, Ayşe, Mehmet..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Toplantı Notları / Kararlar</label>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  rows={4} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Alınan kararlar..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">İptal</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : meetings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Henüz toplantı raporu yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map(m => (
            <div key={m.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{m.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={14} className="text-indigo-400" /> {new Date(m.meetingDate).toLocaleString('tr-TR')}</span>
                    <span className="flex items-center gap-1"><Users size={14} className="text-indigo-400" /> {m.attendees || '—'}</span>
                  </div>
                </div>
                {canManage && (
                  <button onClick={() => handleDelete(m.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
                )}
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                {m.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
