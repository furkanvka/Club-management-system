import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { Search, Trash2, Crown, UserCheck, Users } from 'lucide-react';

export const Members = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isBaskan = activeRole === 'baskan' || user?.loginType === 'club';

  const fetchMembers = () => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/members`)
      .then(r => { setMembers(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, [activeClub]);

  const handleRemove = async (memberId) => {
    if (!window.confirm('Bu üyeyi çıkarmak istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/members/${memberId}`);
      fetchMembers();
    } catch (e) { alert('Üye silinemedi.'); }
  };

  const roleDisplay = (role) => {
    if (role === 'baskan') return { label: 'Başkan', cls: 'bg-purple-100 text-purple-700', icon: Crown };
    return { label: 'Üye', cls: 'bg-blue-100 text-blue-700', icon: UserCheck };
  };

  const filtered = members.filter(m =>
    (m.user?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Üye Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeClub?.name} — toplam <strong>{members.length}</strong> üye
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Toplam Üye', value: members.length, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
          { label: 'Başkan', value: members.filter(m => m.role === 'baskan').length, color: 'bg-purple-50 text-purple-700 border-purple-100' },
          { label: 'Üye', value: members.filter(m => m.role !== 'baskan').length, color: 'bg-blue-50 text-blue-700 border-blue-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-3xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 flex gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="E-posta ile ara..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">{search ? 'Sonuç bulunamadı.' : 'Henüz üye yok.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Üye</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                {isBaskan && <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlem</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(m => {
                const rd = roleDisplay(m.role);
                const RIcon = rd.icon;
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {(m.user?.email?.[0] || '?').toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{m.user?.email || 'Bilinmiyor'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${rd.cls}`}>
                        <RIcon size={11} />
                        {rd.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {m.status === 'active' ? '● Aktif' : '○ Pasif'}
                      </span>
                    </td>
                    {isBaskan && (
                      <td className="px-5 py-3.5 text-right">
                        {m.role !== 'baskan' && (
                          <button
                            onClick={() => handleRemove(m.id)}
                            className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                            title="Üyeyi Çıkar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
