import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { Plus, FileText, Trash2, ExternalLink, X, Folder, Check, XCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Resmi', 'Finans', 'Etkinlik', 'Şablon', 'Diğer'];
const EMPTY_FORM = { title: '', fileUrl: '', category: 'Resmi', description: '' };

export const Documents = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const isBaskan = activeRole === 'baskan' || user?.loginType === 'club';
  const isLider = activeRole === 'ekip_lideri' || activeRole === 'lider' || activeRole === 'EKIP_LIDERI';
  const isEkipUyesi = activeRole === 'ekip_uyesi' || activeRole === 'EKIP_UYESI';

  const canUpload = isBaskan || isLider || isEkipUyesi;

  const fetchDocs = useCallback(() => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/documents`)
      .then(r => { setDocs(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeClub?.id]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/clubs/${activeClub.id}/documents/${id}/approve`);
      fetchDocs();
    } catch (e) {}
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/clubs/${activeClub.id}/documents/${id}/reject`);
      fetchDocs();
    } catch (e) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/clubs/${activeClub.id}/documents`, form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchDocs();
    } catch (err) {
      alert('Belge eklenemedi: ' + (err.response?.data || err.message));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/documents/${id}`);
      fetchDocs();
    } catch (e) { alert('Silinemedi.'); }
  };

  const filtered = activeCategory === 'Tümü' ? docs : docs.filter(d => d.category === activeCategory);

  const getCatColor = (cat) => {
    const map = { Resmi: 'bg-blue-100 text-blue-700', Finans: 'bg-green-100 text-green-700', Etkinlik: 'bg-purple-100 text-purple-700', Şablon: 'bg-yellow-100 text-yellow-700', Diğer: 'bg-gray-100 text-gray-600' };
    return map[cat] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Belgeler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeClub?.name} — {docs.length} belge</p>
        </div>
        {canUpload && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
            <Plus size={16} /> Belge Ekle
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {['Tümü', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Yeni Belge</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Belge Adı *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="2025_Tüzük.pdf" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Dosya URL / Bağlantı</label>
                <input value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="https://drive.google.com/..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Kategori</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Açıklama</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={2} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Kısa açıklama..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">İptal</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Kaydediliyor...' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Docs Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <Folder size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">{activeCategory === 'Tümü' ? 'Henüz belge eklenmemiş.' : `Bu kategoride belge yok.`}</p>
          {canUpload && activeCategory === 'Tümü' && (
            <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-indigo-600 hover:underline">İlk belgeyi ekle →</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition group flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{doc.title}</h3>
                  <div className="flex gap-1 items-center flex-wrap">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${getCatColor(doc.category)}`}>
                      {doc.category || 'Diğer'}
                    </span>
                    {doc.approvalStatus === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 bg-amber-50 text-amber-600 border border-amber-100">
                        <AlertCircle size={10} /> Beklemede
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {doc.description && <p className="text-xs text-gray-500 line-clamp-2 flex-1">{doc.description}</p>}
              
              {isBaskan && doc.approvalStatus === 'PENDING' && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => handleReject(doc.id)} className="flex items-center justify-center gap-1 py-1.5 border border-red-200 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-50 transition">
                    <XCircle size={12} /> Reddet
                  </button>
                  <button onClick={() => handleApprove(doc.id)} className="flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition">
                    <Check size={12} /> Onayla
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('tr-TR') : ''}
                </span>
                <div className="flex items-center gap-1">
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-indigo-50 transition">
                      <ExternalLink size={15} />
                    </a>
                  )}
                  {isBaskan && (
                    <button onClick={() => handleDelete(doc.id)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
