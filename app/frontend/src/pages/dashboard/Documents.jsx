import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Download, 
  X, 
  Folder, 
  Check, 
  XCircle, 
  Upload, 
  Eye, 
  Globe, 
  Lock, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

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
      if (file.size > 10 * 1024 * 1024) {
        alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
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

  const canSee = (cat) => {
    if (isBaskan) return true;
    if (cat === 'Resmi' || cat === 'Finans') return false;
    if (cat === 'Etkinlik' || cat === 'Proje') return isStaff;
    if (cat === 'Public') return true;
    return isStaff;
  };

  const visibleDocs = docs.filter(d => canSee(d.category));
  const filtered = activeCategory === 'Tümü' ? visibleDocs : visibleDocs.filter(d => d.category === activeCategory);

  const getCatBadge = (cat) => {
    const map = { 
        Public: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        Etkinlik: 'bg-purple-50 text-purple-700 border-purple-100', 
        Proje: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        Resmi: 'bg-blue-50 text-blue-700 border-blue-100', 
        Şablon: 'bg-gray-50 text-gray-600 border-gray-200', 
        Diğer: 'bg-gray-50 text-gray-600 border-gray-200' 
    };
    return map[cat] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getCatIcon = (cat) => {
    if (cat === 'Public') return <Globe size={10} />;
    if (cat === 'Resmi') return <Lock size={10} />;
    return <ShieldCheck size={10} />;
  };

  const isImage = (data) => data?.startsWith('data:image/');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Belgeler & Galeri</h1>
          <p className="text-gray-500 font-medium">
            {activeClub?.name} arşivindeki dosyalar ve görseller
          </p>
        </div>
        {canUpload && (
          <Button variant="primary" onClick={() => setShowForm(true)} icon={Plus}>
            Yeni Dosya Ekle
          </Button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap pb-2">
        {['Tümü', ...CATEGORIES].filter(cat => cat === 'Tümü' || canSee(cat)).map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
              activeCategory === cat 
              ? 'bg-indigo-600 text-white border-indigo-600' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cat !== 'Tümü' && getCatIcon(cat)}
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Docs Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Dosyalar yükleniyor...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-24 text-center">
          <Folder size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-900 mb-1">Henüz dosya bulunmuyor</p>
          <p className="text-xs text-gray-500 italic">Bu kategoride kaydedilmiş bir belge veya fotoğraf yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filtered.map(doc => (
            <Card key={doc.id} className="group flex flex-col h-full overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-300" noPadding>
              {/* Preview Area */}
              <div className="relative aspect-[4/3] bg-gray-50 border-b border-gray-100 overflow-hidden flex items-center justify-center group/preview">
                 {isImage(doc.fileData) ? (
                   <>
                    <img src={doc.fileData} alt={doc.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/preview:scale-110" />
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                       <button 
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2.5 bg-white rounded-full text-indigo-600 shadow-xl hover:scale-110 transition-transform"
                       >
                          <Eye size={18} />
                       </button>
                       <button 
                        onClick={() => handleDownload(doc.id, doc.title, doc.fileData)}
                        className="p-2.5 bg-white rounded-full text-indigo-600 shadow-xl hover:scale-110 transition-transform"
                       >
                          <Download size={18} />
                       </button>
                    </div>
                   </>
                 ) : (
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <FileText size={32} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PDF BELGESİ</span>
                   </div>
                 )}
                 
                 {/* Top Badge */}
                 <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold border shadow-sm backdrop-blur-sm ${getCatBadge(doc.category)}`}>
                      {getCatIcon(doc.category)}
                      {doc.category?.toUpperCase() || 'DİĞER'}
                    </span>
                 </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]" title={doc.title}>
                    {doc.title}
                  </h3>
                  {isBaskan && (
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="shrink-0 p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-gray-500 line-clamp-1 mb-4">
                  {doc.description || 'Açıklama bulunmuyor.'}
                </p>

                {/* Footer Info */}
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('tr-TR') : ''}
                  </span>
                  
                  {doc.approvalStatus === 'PENDING' ? (
                    (isBaskan || isLider) ? (
                      <div className="flex gap-1">
                         <button onClick={() => handleReject(doc.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors" title="Reddet"><XCircle size={14} /></button>
                         <button onClick={() => handleApprove(doc.id)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded transition-colors" title="Onayla"><Check size={14} /></button>
                      </div>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">BEKLEMEDE</span>
                    )
                  ) : !isImage(doc.fileData) && (
                    <button 
                      onClick={() => handleDownload(doc.id, doc.title, doc.fileData)}
                      className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <Download size={12} /> İndir
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200" noPadding>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Yeni Dosya Ekle</h2>
                <p className="text-xs font-medium text-gray-500">Arşive belge veya görsel yükleyin</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <Input 
                label="Dosya Başlığı"
                required 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                placeholder="Örn: Toplantı Notları - 15 Ocak"
              />

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Dosya Seçimi *</label>
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-center group cursor-pointer">
                  <input 
                    type="file" 
                    accept="application/pdf,image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    required
                  />
                  {form.fileData ? (
                    <div className="space-y-2">
                       {isImage(form.fileData) ? (
                         <img src={form.fileData} alt="Preview" className="h-24 w-auto rounded-lg shadow-sm mx-auto object-cover border border-white" />
                       ) : (
                         <FileText className="mx-auto h-16 w-16 text-indigo-500" />
                       )}
                       <p className="text-xs font-bold text-emerald-600">Dosya Başarıyla Seçildi</p>
                    </div>
                  ) : (
                    <div className="py-2">
                       <Upload className="mx-auto h-10 w-10 text-gray-300 group-hover:text-indigo-400 transition-colors mb-3" />
                       <p className="text-xs font-bold text-gray-600">Yüklemek için tıklayın veya sürükleyin</p>
                       <p className="text-[10px] text-gray-400 mt-1">PDF veya Resim (Maks. 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Kategori</label>
                <select 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                >
                  {CATEGORIES.filter(c => canSee(c)).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Kısa Açıklama</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows={2} 
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  placeholder="Dosya hakkında kısa bilgi..." 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)} className="flex-1">İPTAL</Button>
                <Button variant="primary" type="submit" loading={saving} className="flex-1">YÜKLE</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => setPreviewDoc(null)}>
          <div className="relative max-w-5xl w-full flex flex-col gap-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
               <div>
                  <h3 className="text-xl font-bold">{previewDoc.title}</h3>
                  <p className="text-sm text-gray-400">{previewDoc.description || 'Açıklama yok'}</p>
               </div>
               <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                 <X size={32} />
               </button>
            </div>
            
            <div className="bg-black/20 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 min-h-[300px]">
              {isImage(previewDoc.fileData) ? (
                <img src={previewDoc.fileData} alt={previewDoc.title} className="max-w-full max-h-[75vh] object-contain shadow-2xl" />
              ) : (
                <div className="p-20 text-center space-y-6">
                   <FileText size={100} className="text-white/20 mx-auto" />
                   <p className="text-white text-lg font-medium">Bu dosya türü için önizleme desteklenmiyor.</p>
                   <Button variant="primary" size="lg" onClick={() => handleDownload(previewDoc.id, previewDoc.title, previewDoc.fileData)} icon={Download}>
                     Belgeyi İndir
                   </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
