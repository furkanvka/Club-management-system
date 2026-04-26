import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  X, 
  FileDown, 
  Trash2, 
  Upload, 
  Search, 
  Calendar as CalendarIcon, 
  Tag, 
  Filter,
  Receipt,
  Ban
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Table, TableCell } from '../../components/common/Table';
import { Input } from '../../components/common/Input';

const EMPTY_FORM = { 
  type: 'expense', 
  description: '', 
  amount: '', 
  category: '', 
  transactionDate: new Date().toISOString().split('T')[0], 
  receiptData: null 
};

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
      .then(r => { 
        setTransactions(r.data.sort((a,b) => new Date(b.transactionDate) - new Date(a.transactionDate))); 
        setLoading(false); 
      })
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
    if (!window.confirm('Bu işlemi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz ve kayıtlarda "İptal Edildi" olarak kalacaktır.')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/transactions/${id}`);
      fetchTx();
    } catch (e) { alert('İşlem iptal edilemedi.'); }
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

  const activeTransactions = transactions.filter(t => t.status !== 'cancelled');
  const income = activeTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = activeTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const fmt = (n) => '₺' + Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Finans Yönetimi</h1>
          <p className="text-gray-500 font-medium">
            {activeClub?.name} finansal hareketleri ve bütçe raporu
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExport} icon={FileDown}>
            Rapor Al (CSV)
          </Button>
          {canManage && (
            <Button variant="primary" onClick={() => setShowForm(true)} icon={Plus}>
              Yeni İşlem
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Toplam Gelir', value: fmt(income), color: 'bg-emerald-50 text-emerald-600', icon: TrendingUp },
          { label: 'Toplam Gider', value: fmt(expense), color: 'bg-rose-50 text-rose-600', icon: TrendingDown },
          { label: 'Mevcut Bakiye', value: fmt(balance), color: balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600', icon: DollarSign },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card noPadding>
        {/* Table Toolbar */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="İşlem ara..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
              <Filter size={14} className="text-gray-400" />
              <select 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer"
              >
                <option value="all">TÜMÜ</option>
                <option value="income">GELİR</option>
                <option value="expense">GİDER</option>
              </select>
            </div>
          </div>
        </div>

        <Table
          headers={['Tarih', 'Açıklama', 'Kategori', 'Tür', 'Tutar', '']}
          data={filteredTransactions}
          loading={loading}
          emptyMessage="Kayıtlı finansal işlem bulunamadı."
          renderRow={(t) => {
            const isCancelled = t.status === 'cancelled';
            return (
              <tr className={isCancelled ? 'opacity-50 grayscale-[0.5]' : ''}>
                <TableCell>
                  <div className="flex items-center gap-2 text-gray-500 font-medium text-xs">
                    <CalendarIcon size={14} className="text-gray-300" />
                    {t.transactionDate ? new Date(t.transactionDate).toLocaleDateString('tr-TR') : '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.description}</p>
                    {isCancelled && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black bg-gray-200 text-gray-600 tracking-tighter">
                        <Ban size={10} /> İPTAL EDİLDİ
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {t.category ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      <Tag size={10} /> {t.category.toUpperCase()}
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    isCancelled ? 'bg-gray-50 text-gray-400 border-gray-100' :
                    t.type === 'income' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isCancelled ? 'bg-gray-300' : t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {t.type === 'income' ? 'GELİR' : 'GİDER'}
                  </span>
                </TableCell>
                <TableCell className={`text-right font-bold ${isCancelled ? 'text-gray-400 line-through' : t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                      {t.receiptData && (
                        <button 
                          onClick={() => setPreviewReceipt(t)} 
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Fişi Görüntüle"
                        >
                          <Receipt size={18} />
                        </button>
                      )}
                      {canManage && !isCancelled && (
                        <button 
                          onClick={() => handleDelete(t.id)} 
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="İşlemi İptal Et"
                        >
                          <Ban size={18} />
                        </button>
                      )}
                  </div>
                </TableCell>
              </tr>
            );
          }}
        />
      </Card>

      {/* Receipt Preview Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewReceipt(null)}>
           <Card className="max-w-xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200" noPadding onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">{previewReceipt.description}</h3>
                    <p className="text-xs font-medium text-gray-500">
                      {fmt(previewReceipt.amount)} — {new Date(previewReceipt.transactionDate).toLocaleDateString('tr-TR')}
                    </p>
                 </div>
                 <button onClick={() => setPreviewReceipt(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                    <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-auto bg-gray-50 p-6 flex items-center justify-center min-h-[400px]">
                 <img src={previewReceipt.receiptData} alt="Receipt" className="max-w-full rounded-lg shadow-sm" />
              </div>
           </Card>
        </div>
      )}

      {/* Transaction Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200" noPadding>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Yeni İşlem Kaydı</h2>
                <p className="text-xs font-medium text-gray-500">Bütçe hareketini kaydedin</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div className="flex bg-gray-100/50 p-1 rounded-xl">
                {['income', 'expense'].map(t => (
                  <button 
                    key={t} 
                    type="button" 
                    onClick={() => setForm({...form, type: t})}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      form.type === t
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t === 'income' ? 'Gelir' : 'Gider'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <Input 
                  label="İşlem Açıklaması"
                  required 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Örn: 2025 Üye Aidatları" 
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Tutar (₺)"
                    required 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={form.amount} 
                    onChange={e => setForm({...form, amount: e.target.value})}
                    placeholder="0.00" 
                  />
                  <Input 
                    label="İşlem Tarihi"
                    type="date" 
                    value={form.transactionDate} 
                    onChange={e => setForm({...form, transactionDate: e.target.value})}
                  />
                </div>

                <Input 
                  label="Kategori"
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                  placeholder="Aidat, Ekipman, Kira..." 
                />

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    {form.type === 'expense' ? 'Fiş / Fatura Fotoğrafı *' : 'Fiş Fotoğrafı (Opsiyonel)'}
                  </label>
                  <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-center group cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    {form.receiptData ? (
                      <div className="flex items-center gap-4">
                         <img src={form.receiptData} alt="Preview" className="w-16 h-16 rounded-lg object-cover shadow-sm border border-gray-200" />
                         <div className="text-left">
                            <p className="text-xs font-bold text-emerald-600">Fotoğraf Seçildi</p>
                            <p className="text-[10px] text-gray-400 font-medium">Değiştirmek için tıklayın</p>
                         </div>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-8 w-8 text-gray-300 group-hover:text-indigo-400 transition-colors mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-500">Fotoğraf yüklemek için tıklayın</p>
                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG (Maks. 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  İPTAL
                </Button>
                <Button 
                  type="submit" 
                  loading={saving}
                  className="flex-[2]"
                >
                  KAYDET
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
