import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { Folder, Plus, Trash2 } from 'lucide-react';

export const Projects = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const canManage = activeRole === 'baskan' || user?.loginType === 'club';

  const fetchProjects = () => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/projects`)
      .then(r => { setProjects(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, [activeClub]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post(`/clubs/${activeClub.id}/projects`, { name, description, status: 'planning', priority: 'normal' });
      setName('');
      setDescription('');
      setShowForm(false);
      fetchProjects();
    } catch (e) {
      alert('Proje oluşturulamadı: ' + (e.response?.data || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/projects/${id}`);
      fetchProjects();
    } catch (e) { alert('Silinemedi.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projeler & Görevler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeClub?.name} — {projects.length} proje</p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
            <Plus size={16} /> Proje Oluştur
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Proje Adı</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Açıklama</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold">İptal</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <Folder size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Henüz proje yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition group">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                {canManage && (
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">{p.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
