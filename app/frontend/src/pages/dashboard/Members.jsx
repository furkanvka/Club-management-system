import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Search, 
  Trash2, 
  Crown, 
  UserCheck, 
  Users, 
  Shield, 
  Star, 
  UserCircle2,
  MoreHorizontal,
  DollarSign,
  Folder
} from 'lucide-react';

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
    if (!window.confirm('Bu üyeyi topluluktan çıkarmak istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/members/${memberId}`);
      fetchMembers();
    } catch (e) { alert('Üye silinemedi.'); }
  };

  const handleUpdateFlags = async (memberId, currentFlags, flagKey) => {
    try {
      let flagsObj = {};
      try {
        flagsObj = currentFlags ? JSON.parse(currentFlags) : {};
      } catch (e) {
        flagsObj = {};
      }
      
      flagsObj[flagKey] = !flagsObj[flagKey];
      await api.put(`/clubs/${activeClub.id}/members/${memberId}/flags`, JSON.stringify(flagsObj));
      fetchMembers();
    } catch (err) {
      alert('Yetki güncellenemedi.');
    }
  };

  const roleDisplay = (role) => {
    const normalized = (role || '').toUpperCase();
    switch (normalized) {
      case 'KULUP_BASKANI':
      case 'BASKAN':
        return { label: 'Kulüp Başkanı', cls: 'bg-purple-50 text-purple-700 border-purple-100', icon: Crown };
      case 'EKIP_LIDERI':
        return { label: 'Ekip Lideri', cls: 'bg-amber-50 text-amber-700 border-amber-100', icon: Star };
      case 'EKIP_UYESI':
        return { label: 'Ekip Üyesi', cls: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: Shield };
      case 'KULUP_UYESI':
      case 'UYE':
      default:
        return { label: 'Kulüp Üyesi', cls: 'bg-blue-50 text-blue-700 border-blue-100', icon: UserCheck };
    }
  };

  const filtered = members.filter(m =>
    (m.user?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-indigo-600" size={24} />
            Üye Yönetimi
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {activeClub?.name} topluluk üyeleri ve yetki dağılımı
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Üye', value: members.length, color: 'text-indigo-600' },
          { label: 'Başkanlar', value: members.filter(m => ['KULUP_BASKANI', 'BASKAN'].includes(m.role?.toUpperCase())).length, color: 'text-purple-600' },
          { label: 'Ekip Liderleri', value: members.filter(m => m.role?.toUpperCase() === 'EKIP_LIDERI').length, color: 'text-amber-600' },
          { label: 'Aktif Üyeler', value: members.filter(m => m.status === 'active').length, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-xl shadow-gray-200/40 transition-transform hover:scale-[1.02]">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="relative group max-w-sm w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Üye e-postası ile hızlı ara..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 font-medium transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-gray-50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistem Çevrimiçi
             </div>
          </div>
        </div>

        {loading ? (
          <div className="p-24 text-center flex flex-col items-center">
            <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Veri tabanı taranıyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] mx-auto flex items-center justify-center text-gray-200 mb-6">
              <UserCircle2 size={56} />
            </div>
            <p className="text-gray-500 font-black text-xl">{search ? 'Kayıt bulunamadı.' : 'Üye listesi boş.'}</p>
            <p className="text-sm text-gray-400 mt-2 font-medium">Topluluğa yeni üyeler katıldığında burada görünecektir.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Üye Bilgileri</th>
                  <th className="text-left px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Yetki Grubu</th>
                  <th className="text-left px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sistem Durumu</th>
                  {isBaskan && <th className="text-right px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">İşlemler</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(m => {
                  const rd = roleDisplay(m.role);
                  const RIcon = rd.icon;
                  const normalizedRole = (m.role || '').toUpperCase();
                  const isUserBaskan = normalizedRole === 'KULUP_BASKANI' || normalizedRole === 'BASKAN';
                  
                  return (
                    <tr key={m.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm flex items-center justify-center font-black text-indigo-600 text-lg group-hover:scale-110 transition-transform duration-300">
                            {(m.user?.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-gray-800 text-base leading-tight">{m.user?.email?.split('@')[0] || 'Bilinmiyor'}</div>
                            <div className="text-xs text-gray-400 font-bold mt-0.5">{m.user?.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border ${rd.cls} shadow-sm w-fit`}>
                            <RIcon size={14} />
                            {rd.label}
                          </div>
                          {isBaskan && !isUserBaskan && (
                            <div className="flex gap-1">
                              {[
                                { key: 'yonetici', label: 'Ynt', icon: Shield, color: 'text-red-500' },
                                { key: 'finans', label: 'Fin', icon: DollarSign, color: 'text-green-500' },
                                { key: 'docs', label: 'Bel', icon: Folder, color: 'text-blue-500' },
                              ].map(f => {
                                const Icon = f.icon;
                                const active = m.flags && m.flags.includes(`"${f.key}":true`);
                                return (
                                  <button
                                    key={f.key}
                                    onClick={() => handleUpdateFlags(m.id, m.flags, f.key)}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border transition-all ${
                                      active 
                                      ? `bg-white ${f.color} border-current shadow-sm` 
                                      : 'bg-gray-50 text-gray-300 border-gray-100 hover:border-gray-200'
                                    }`}
                                    title={`${f.label} Yetkisi`}
                                  >
                                    <Icon size={10} /> {f.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl ${m.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gray-300'}`}></span>
                          {m.status === 'active' ? 'Aktif Üye' : 'Beklemede'}
                        </div>
                      </td>
                      {isBaskan && (
                        <td className="px-8 py-6 text-right">
                          {!isUserBaskan ? (
                            <div className="flex justify-end gap-2">
                               <button
                                onClick={() => handleRemove(m.id)}
                                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                                title="Üyeyi Çıkar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-400 rounded-xl" title="Kurucu Yetkisi">
                               <Shield size={16} />
                               <span className="text-[9px] font-black uppercase tracking-tighter">Korumalı</span>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
