import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Plus, TrendingUp, TrendingDown, DollarSign, X, FileDown, 
  Trash2, Image as ImageIcon, Eye, Upload, Search, 
  Calendar as CalendarIcon, Tag, CreditCard, ChevronDown, Filter
} from 'lucide-react';

const EMPTY_FORM = { type: 'expense', description: '', amount: '', category: '', transactionDate: new Date().toISOString().split('T')[0], receiptData: null };

export const Finance = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const canManage = activeRole === 'baskan' || user?.loginType === 'club';

  const fetchTx = useCallback(() => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/transactions`)
      .then(r => { setTransactions(r.data.sort((a,b) => new Date(b.transactionDate) - new Date(a.transactionDate))); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeClub?.id]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Lütfen sadece resim dosyası seçiniz.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, receiptData: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const headers = ['Aciklama', 'Kategori', 'Tur', 'Tutar', 'Tarih'];
    const rows = transactions.map(t => [
      t.description,
      t.category || '',
      t.type,
      t.amount,
      t.transactionDate || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finans_raporu_${activeClub.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/transactions/${id}`);
      fetchTx();
    } catch (e) { alert('Silinemedi.'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.type === 'expense' && !form.receiptData) {
      alert('Giderler için fiş/fatura fotoğrafı zorunludur.');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/clubs/${activeClub.id}/transactions`, {
        ...form,
        amount: parseFloat(form.amount),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchTx();
    } catch (err) {
      alert('İşlem eklenemedi: ' + (err.response?.data || err.message));
    } finally { setSaving(false); }
  };

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const fmt = (n) => '₺' + Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Finans Yönetimi</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{activeClub?.name} — {transactions.length} İşlem Kaydı</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition shadow-sm">
            <FileDown size={18} /> Excel (CSV)
          </button>
          {canManage && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              <Plus size={18} /> Yeni İşlem Ekle
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Toplam Gelir', value: fmt(income), cls: 'from-emerald-500 to-teal-600', icon: TrendingUp },
          { label: 'Toplam Gider', value: fmt(expense), cls: 'from-rose-500 to-pink-600', icon: TrendingDown },
          { label: 'Kasa Bakiyesi', value: fmt(balance), cls: balance >= 0 ? 'from-indigo-600 to-blue-700' : 'from-orange-600 to-red-700', icon: DollarSign },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-gradient-to-br ${s.cls} rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Icon size={80} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase opacity-70 tracking-[0.2em] mb-1">{s.label}</p>
                <p className="text-3xl font-black">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search - Excel Style */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-4 flex flex-wrap items-center gap-4 shadow-sm">
         <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Açıklama veya kategori ara..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-400"
            />
         </div>
         <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="bg-transparent border-none text-xs font-black uppercase focus:ring-0 cursor-pointer"
            >
              <option value="all">Tümü</option>
              <option value="income">Gelirler</option>
              <option value="expense">Giderler</option>
            </select>
         </div>
      </div>

      {/* Transactions List - Modern Excel Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <CreditCard size={32} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold">Kayıtlı işlem bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarih</th>
                  <th className="text-left px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Açıklama</th>
                  <th className="text-left px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</th>
                  <th className="text-left px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tür</th>
                  <th className="text-right px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tutar</th>
                  <th className="text-center px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-8 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                          <CalendarIcon size={14} className="opacity-40" />
                          {t.transactionDate ? new Date(t.transactionDate).toLocaleDateString('tr-TR') : '—'}
                       </div>
                    </td>
                    <td className="px-8 py-4">
                       <p className="font-black text-gray-900 text-sm leading-tight">{t.description}</p>
                    </td>
                    <td className="px-8 py-4">
                       {t.category ? (
                         <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                           <Tag size={10} /> {t.category}
                         </span>
                       ) : <span className="text-gray-200">—</span>}
                    </td>
                    <td className="px-8 py-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        {t.type === 'income' ? 'Gelir' : 'Gider'}
                      </span>
                    </td>
                    <td className={`px-8 py-4 text-right font-black text-base ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td className="px-8 py-4">
                       <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.receiptData && (
                            <button onClick={() => setPreviewReceipt(t)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition shadow-sm" title="Fişi Görüntüle">
                               <ImageIcon size={16} />
                            </button>
                          )}
                          {canManage && (
                            <button onClick={() => handleDelete(t.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition shadow-sm" title="Sil">
                               <Trash2 size={16} />
                            </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setPreviewReceipt(null)}>
           <div className="bg-white rounded-[2rem] p-2 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewReceipt(null)} className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 p-2 rounded-full transition"><X size={20} /></button>
              <div className="p-6 border-b border-gray-100">
                 <h3 className="font-black text-gray-900">{previewReceipt.description}</h3>
                 <p className="text-xs font-bold text-gray-500 uppercase">{fmt(previewReceipt.amount)} — {new Date(previewReceipt.transactionDate).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="flex-1 overflow-auto bg-gray-50 p-4 flex items-center justify-center">
                 <img src={previewReceipt.receiptData} alt="Receipt" className="max-w-full rounded-xl shadow-lg" />
              </div>
           </div>
        </div>
      )}

      {/* Transaction Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Yeni İşlem Kaydı</h2>
                <p className="text-xs opacity-70 font-bold uppercase tracking-wider">Finansal Veri Girişi</p>
              </div>
              <button onClick={() => setShowForm(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-5">
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                {['income', 'expense'].map(t => (
                  <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition ${
                      form.type === t
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}>
                    {t === 'income' ? 'Gelir' : 'Gider'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İşlem Açıklaması *</label>
                  <input required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="mt-1 w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-400" placeholder="Örn: 2025 Üye Aidatları" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tutar (₺) *</label>
                    <input required type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                      className="mt-1 w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-400" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İşlem Tarihi</label>
                    <input type="date" value={form.transactionDate} onChange={e => setForm({...form, transactionDate: e.target.value})}
                      className="mt-1 w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                  <input value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="mt-1 w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-400" placeholder="Aidat, Ekipman, Kira..." />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {form.type === 'expense' ? 'Fiş / Fatura Fotoğrafı *' : 'Fiş Fotoğrafı (Opsiyonel)'}
                  </label>
                  <div className="mt-1 relative border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-all text-center group cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {form.receiptData ? (
                      <div className="flex items-center gap-4">
                         <img src={form.receiptData} alt="Preview" className="w-16 h-16 rounded-xl object-cover shadow-md" />
                         <div className="text-left">
                            <p className="text-xs font-black text-emerald-600">Fotoğraf Seçildi</p>
                            <p className="text-[10px] text-gray-400">Değiştirmek için tıklayın</p>
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-2">
                        <Upload className="h-8 w-8 text-gray-300 group-hover:text-indigo-400 transition-colors mb-2" />
                        <p className="text-xs font-bold text-gray-500">Fotoğraf Yüklemek İçin Tıklayın</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition">İptal</button>
                <button type="submit" disabled={saving}
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100">
                  {saving ? 'Kaydediliyor...' : 'İşlemi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
