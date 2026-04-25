import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { Plus, FileText, Trash2, Download, X, Folder, Check, XCircle, AlertCircle, Upload, Image as ImageIcon, Eye, Globe, Lock, ShieldCheck } from 'lucide-react';

const CATEGORIES = ['Public', 'Etkinlik', 'Proje', 'Resmi', 'Şablon', 'Diğer'];
const EMPTY_FORM = { title: '', category: 'Public', description: '', fileData: null };

export const Documents = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const role = activeRole?.toLowerCase() || '';
  const isBaskan = role === 'baskan' || user?.loginType === 'club';
  const isLider = role === 'ekip_lideri' || role === 'lider' || role === 'ekip-lideri';
  const isEkipUyesi = role === 'ekip_uyesi';

  const isStaff = isBaskan || isLider || isEkipUyesi;
  const canUpload = isStaff;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Yalnızca PDF ve resim dosyaları (JPG, PNG, GIF, WEBP) desteklenmektedir.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, fileData: reader.result, title: form.title || file.name.split('.')[0] });
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (!form.fileData) {
      alert('Lütfen bir dosya seçin.');
      return;
    }
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

  const handleDownload = async (docId, title, fileData) => {
    try {
      const response = await api.get(`/clubs/${activeClub.id}/documents/${docId}/download`, {
        responseType: 'blob'
      });
      
      let extension = 'pdf';
      if (fileData?.includes('image/png')) extension = 'png';
      else if (fileData?.includes('image/jpeg')) extension = 'jpg';
      else if (fileData?.includes('image/gif')) extension = 'gif';
      else if (fileData?.includes('image/webp')) extension = 'webp';

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Dosya indirilemedi.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/documents/${id}`);
      fetchDocs();
    } catch (e) { alert('Silinemedi.'); }
  };

  // Visibility filtering logic
  const canSee = (cat) => {
    if (isBaskan) return true;
    if (cat === 'Resmi' || cat === 'Finans') return false;
    if (cat === 'Etkinlik' || cat === 'Proje') return isStaff;
    if (cat === 'Public') return true;
    return isStaff; // Default for others
  };

  const visibleDocs = docs.filter(d => canSee(d.category));
  const filtered = activeCategory === 'Tümü' ? visibleDocs : visibleDocs.filter(d => d.category === activeCategory);

  const getCatColor = (cat) => {
    const map = { 
        Public: 'bg-emerald-100 text-emerald-700',
        Etkinlik: 'bg-purple-100 text-purple-700', 
        Proje: 'bg-indigo-100 text-indigo-700',
        Resmi: 'bg-blue-100 text-blue-700', 
        Şablon: 'bg-gray-100 text-gray-600', 
        Diğer: 'bg-gray-100 text-gray-600' 
    };
    return map[cat] || 'bg-gray-100 text-gray-600';
  };

  const getCatIcon = (cat) => {
    if (cat === 'Public') return <Globe size={10} />;
    if (cat === 'Resmi') return <Lock size={10} />;
    return <ShieldCheck size={10} />;
  };

  const isImage = (data) => data?.startsWith('data:image/');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Belgeler ve Fotoğraflar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeClub?.name} — {visibleDocs.length} dosya</p>
        </div>
        {canUpload && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
            <Plus size={16} /> Ekle
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {['Tümü', ...CATEGORIES].filter(cat => cat === 'Tümü' || canSee(cat)).map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
            {cat !== 'Tümü' && getCatIcon(cat)}
            {cat}
          </button>
        ))}
      </div>

      {/* Modal - Create */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Yeni Dosya</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Başlık *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Örn: Etkinlik Fotoğrafı" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Dosya (PDF veya Resim) *</label>
                <div className="mt-1 relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all text-center min-h-[120px] flex flex-col items-center justify-center">
                   <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                   {form.fileData ? (
                     <div className="space-y-2">
                        {isImage(form.fileData) ? (
                          <img src={form.fileData} alt="Preview" className="h-20 w-auto rounded-lg shadow-sm mx-auto object-cover" />
                        ) : (
                          <FileText className="mx-auto h-12 w-12 text-indigo-500" />
                        )}
                        <p className="text-xs font-bold text-emerald-600">Dosya seçildi</p>
                     </div>
                   ) : (
                     <div className="space-y-1">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-xs font-bold text-gray-600">Dosya Seçmek İçin Tıklayın</p>
                        <p className="text-[10px] text-gray-400">PDF, JPG, PNG, GIF, WEBP</p>
                     </div>
                   )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Kategori</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {CATEGORIES.filter(c => canSee(c)).map(c => <option key={c}>{c}</option>)}
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
                  {saving ? 'Kaydediliyor...' : 'Yükle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewDoc(null)} className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2 font-bold">
              <X size={24} /> Kapat
            </button>
            <div className="bg-white rounded-2xl overflow-hidden flex items-center justify-center p-2">
              {isImage(previewDoc.fileData) ? (
                <img src={previewDoc.fileData} alt={previewDoc.title} className="max-w-full max-h-[80vh] object-contain" />
              ) : (
                <div className="p-20 text-center">
                   <FileText size={80} className="text-gray-200 mx-auto mb-4" />
                   <p className="text-gray-500 font-bold">Bu dosya türü için önizleme desteklenmiyor.</p>
                   <button onClick={() => handleDownload(previewDoc.id, previewDoc.title, previewDoc.fileData)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">İndirerek Görüntüle</button>
                </div>
              )}
            </div>
            <div className="bg-white/10 backdrop-blur-md mt-4 p-4 rounded-xl text-white">
              <h3 className="font-bold text-lg">{previewDoc.title}</h3>
              <p className="text-sm opacity-80">{previewDoc.description}</p>
            </div>
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
          <p className="text-gray-400 font-medium">{activeCategory === 'Tümü' ? 'Henüz dosya eklenmemiş.' : `Bu kategoride dosya yok.`}</p>
          {canUpload && activeCategory === 'Tümü' && (
            <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-indigo-600 hover:underline">İlk dosyayı ekle →</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-md transition group flex flex-col">
              {/* Image Preview Thumb */}
              {isImage(doc.fileData) ? (
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50 group-hover:shadow-inner transition border border-gray-50">
                   <img src={doc.fileData} alt={doc.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button onClick={() => setPreviewDoc(doc)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl hover:scale-110 transition">
                         <Eye size={16} />
                      </button>
                   </div>
                </div>
              ) : (
                <div className="aspect-square rounded-xl mb-2 bg-indigo-50 flex items-center justify-center text-indigo-200 border border-indigo-100">
                   <FileText size={32} />
                </div>
              )}

              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-xs leading-tight truncate">{doc.title}</h3>
                  <div className="flex gap-1 items-center flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded-md mt-1 ${getCatColor(doc.category)}`}>
                      {getCatIcon(doc.category)}
                      {doc.category || 'Diğer'}
                    </span>
                    {doc.approvalStatus === 'PENDING' && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-md mt-1 bg-amber-50 text-amber-600 border border-amber-100">
                        <AlertCircle size={8} /> Beklemede
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {isBaskan && doc.approvalStatus === 'PENDING' && (
                <div className="mt-2 grid grid-cols-2 gap-1 mb-2">
                  <button onClick={() => handleReject(doc.id)} className="flex items-center justify-center gap-1 py-1 border border-red-200 text-red-500 rounded-lg text-[8px] font-bold hover:bg-red-50 transition">
                    <XCircle size={10} /> Reddet
                  </button>
                  <button onClick={() => handleApprove(doc.id)} className="flex items-center justify-center gap-1 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-bold hover:bg-emerald-600 transition">
                    <Check size={10} /> Onayla
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <span className="text-[9px] text-gray-400 font-bold uppercase">
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('tr-TR') : ''}
                </span>
                <div className="flex items-center gap-0.5">
                  {isImage(doc.fileData) && (
                    <button onClick={() => setPreviewDoc(doc)}
                      className="text-gray-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition"
                      title="Görüntüle"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDownload(doc.id, doc.title, doc.fileData)}
                    className="text-indigo-500 hover:text-indigo-700 p-1 rounded-lg hover:bg-indigo-50 transition"
                    title="İndir"
                  >
                    <Download size={14} />
                  </button>
                  {isBaskan && (
                    <button onClick={() => handleDelete(doc.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition"
                      title="Sil"
                    >
                      <Trash2 size={14} />
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