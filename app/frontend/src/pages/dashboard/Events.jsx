import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import {
  Plus, Calendar, MapPin, Users, Trash2,
  Clock, CheckCircle, XCircle, AlertCircle, X
} from 'lucide-react';

const STATUS = {
  upcoming: { label: 'Yaklaşan', cls: 'bg-blue-100 text-blue-700', icon: Clock },
  ongoing: { label: 'Devam Eden', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
  completed: { label: 'Tamamlandı', cls: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  cancelled: { label: 'İptal', cls: 'bg-red-100 text-red-600', icon: XCircle },
  draft: { label: 'Taslak', cls: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
};

const EMPTY_FORM = { name: '', description: '', eventDate: '', location: '', capacity: '', status: 'upcoming' };

export const Events = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const canManage = activeRole === 'baskan' || user?.loginType === 'club';

  const fetchEvents = () => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/events`)
      .then(r => { setEvents(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [activeClub]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.post(`/clubs/${activeClub.id}/events`, {
        ...form,
        eventDate: form.eventDate ? new Date(form.eventDate).toISOString().slice(0, 19) : null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchEvents();
    } catch (e) {
      alert('Etkinlik oluşturulamadı: ' + (e.response?.data || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/events/${id}`);
      fetchEvents();
    } catch (e) { alert('Silinemedi.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etkinlikler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeClub?.name} — {events.length} etkinlik</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus size={16} /> Etkinlik Oluştur
          </button>
        )}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Yeni Etkinlik</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Etkinlik Adı *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Tanışma Toplantısı..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Açıklama</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Etkinlik hakkında kısa bilgi..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Tarih & Saat</label>
                  <input type="datetime-local" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Kapasite</label>
                  <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="100" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Konum</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Amfi Tiyatro, B101..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Kaydediliyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Henüz etkinlik yok.</p>
          {canManage && (
            <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-indigo-600 hover:underline">
              İlk etkinliği oluştur →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map(ev => {
            const s = STATUS[ev.status] || STATUS.upcoming;
            const SIcon = s.icon;
            return (
              <div key={ev.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition group">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{ev.name}</h3>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.cls}`}>
                    <SIcon size={11} /> {s.label}
                  </span>
                </div>
                {ev.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{ev.description}</p>}
                <div className="mt-4 space-y-1.5">
                  {ev.eventDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={13} className="text-indigo-400" />
                      {new Date(ev.eventDate).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  )}
                  {ev.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={13} className="text-indigo-400" /> {ev.location}
                    </div>
                  )}
                  {ev.capacity && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users size={13} className="text-indigo-400" /> {ev.capacity} kişi kapasiteli
                    </div>
                  )}
                </div>
                {canManage && (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                    <button onClick={() => handleDelete(ev.id)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
