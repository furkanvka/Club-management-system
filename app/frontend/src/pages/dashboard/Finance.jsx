import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, X } from 'lucide-react';

const EMPTY_FORM = { type: 'income', description: '', amount: '', category: '', transactionDate: '' };

export const Finance = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const canManage = activeRole === 'baskan' || user?.loginType === 'club';

  const fetchTx = () => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/transactions`)
      .then(r => { setTransactions(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTx(); }, [activeClub]);

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const handleCreate = async (e) => {
    e.preventDefault();
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

  const fmt = (n) => '₺' + Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finans</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeClub?.name} — {transactions.length} işlem</p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
            <Plus size={16} /> Yeni İşlem
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Toplam Gelir', value: fmt(income), cls: 'from-green-500 to-emerald-600', icon: TrendingUp },
          { label: 'Toplam Gider', value: fmt(expense), cls: 'from-red-500 to-rose-600', icon: TrendingDown },
          { label: 'Net Bakiye', value: fmt(balance), cls: balance >= 0 ? 'from-indigo-500 to-blue-600' : 'from-red-600 to-rose-700', icon: DollarSign },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-gradient-to-br ${s.cls} rounded-2xl p-5 text-white`}>
              <Icon size={22} className="opacity-70 mb-2" />
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs opacity-70 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Yeni Finansal İşlem</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {/* Type Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                {['income', 'expense'].map(t => (
                  <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                    className={`flex-1 py-2.5 text-sm font-semibold transition ${
                      form.type === t
                        ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}>
                    {t === 'income' ? '+ Gelir' : '- Gider'}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Açıklama *</label>
                <input required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Açıklama giriniz..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Tutar (₺) *</label>
                  <input required type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Tarih</label>
                  <input type="date" value={form.transactionDate} onChange={e => setForm({...form, transactionDate: e.target.value})}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Kategori</label>
                <input value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Etkinlik, Aidat, Ekipman..." />
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

      {/* Transactions Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-800">Son İşlemler</span>
        </div>
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={36} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Henüz finansal işlem yok.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Açıklama</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tür</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tutar</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tarih</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{t.description}</td>
                  <td className="px-5 py-3.5 text-gray-500">{t.category || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.type === 'income' ? 'Gelir' : 'Gider'}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {t.transactionDate ? new Date(t.transactionDate).toLocaleDateString('tr-TR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
