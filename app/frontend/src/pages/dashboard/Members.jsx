import React, { useEffect, useState, useCallback } from 'react';
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
  Plus,
  X,
  CheckCircle2,
  DollarSign,
  Folder
} from 'lucide-react';

export const Members = () => {
  const { activeClub, activeRole, activeMembershipId } = useClub();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Team Assignment State
  const [myTeams, setMyTeams] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const isBaskan = activeRole === 'baskan' || user?.loginType === 'club';
  const isLider = activeRole === 'ekip_lideri' || activeRole === 'EKIP_LIDERI' || activeRole === 'lider';
  const canManageTeams = isLider; // SADECE Ekip Lideri üye ekleyebilir, Başkan ekleyemez.

  const fetchMembers = useCallback(() => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/members`)
      .then(r => { setMembers(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeClub?.id]);

  const fetchMyTeams = useCallback(() => {
    if (!activeClub?.id || !canManageTeams) return;
    api.get(`/clubs/${activeClub.id}/teams`)
      .then(r => {
        let data = r.data;
        if (!isBaskan) {
          data = data.filter(t => Number(t.leader?.id) === Number(activeMembershipId));
        }
        setMyTeams(data);
      })
      .catch(() => {});
  }, [activeClub?.id, isBaskan, activeMembershipId, canManageTeams]);

  useEffect(() => { 
    fetchMembers(); 
    fetchMyTeams();
  }, [fetchMembers, fetchMyTeams]);

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

  const handleAddToTeam = async (teamId) => {
    if (!selectedMember || !teamId) return;
    setAssigning(true);
    try {
      await api.post(`/clubs/${activeClub.id}/teams/${teamId}/members`, {
        membership: { id: selectedMember.id }
      }, { params: { requesterId: activeMembershipId } });
      
      alert('Üye başarıyla ekibe eklendi.');
      setShowTeamModal(false);
      setSelectedMember(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Üye eklenemedi. Zaten ekipte olabilir.');
    } finally {
      setAssigning(false);
    }
  };

  const roleDisplay = (role) => {
    const normalized = (role || '').toUpperCase().replace('-', '_');
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
    (m.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.studentNumber || '').toLowerCase().includes(search.toLowerCase())
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
              placeholder="Ad, Soyad veya Öğrenci No ile ara..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 font-medium transition-all"
            />
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
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Üye Bilgileri</th>
                  <th className="text-left px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Öğrenci No</th>
                  <th className="text-left px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Yetki Grubu</th>
                  <th className="text-left px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sistem Durumu</th>
                  <th className="text-right px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(m => {
                  const rd = roleDisplay(m.role);
                  const RIcon = rd.icon;
                  const normalizedRole = (m.role || '').toUpperCase();
                  const isUserBaskan = normalizedRole === 'KULUP_BASKANI' || normalizedRole === 'BASKAN';
                  const displayName = m.user?.firstName ? `${m.user.firstName} ${m.user.lastName}` : (m.user?.email?.split('@')[0] || 'Bilinmiyor');
                  const initial = m.user?.firstName ? m.user.firstName[0] : (m.user?.email?.[0] || '?');
                  
                  return (
                    <tr key={m.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm flex items-center justify-center font-black text-indigo-600 text-lg group-hover:scale-110 transition-transform duration-300">
                            {initial.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-gray-800 text-base leading-tight">{displayName}</div>
                            <div className="text-xs text-gray-400 font-bold mt-0.5">{m.user?.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-bold text-gray-600">
                         {m.user?.studentNumber || '—'}
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
                          {m.status === 'active' ? 'Aktif Üye' : 'Pasif'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                           {canManageTeams && !isUserBaskan && (
                             <button
                               onClick={() => { setSelectedMember(m); setShowTeamModal(true); }}
                               className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                               title="Ekibe Ekle"
                             >
                               <Plus size={14} className="inline mr-1" /> Ekibe Ekle
                             </button>
                           )}
                           
                           {isBaskan && !isUserBaskan && (
                              <button
                               onClick={() => handleRemove(m.id)}
                               className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                               title="Üyeyi Çıkar"
                             >
                               <Trash2 size={18} />
                             </button>
                           )}
                           
                           {isUserBaskan && (
                              <div className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-400 rounded-xl" title="Kurucu Yetkisi">
                                 <Shield size={16} />
                                 <span className="text-[9px] font-black uppercase tracking-tighter">Korumalı</span>
                              </div>
                           )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team Assignment Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-indigo-50/50 to-white flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Ekibe Atama Yap</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{selectedMember?.user?.email}</p>
                 </div>
                 <button onClick={() => setShowTeamModal(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-all"><X size={20} /></button>
              </div>
              
              <div className="p-8 space-y-4">
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-indigo-500" /> Atanacak Ekibi Seçin
                 </div>
                 
                 <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {myTeams.length === 0 ? (
                       <div className="py-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <p className="text-sm text-gray-400 font-bold italic">Yönettiğiniz bir ekip bulunamadı.</p>
                       </div>
                    ) : (
                       myTeams.map(t => (
                          <button
                            key={t.id}
                            disabled={assigning}
                            onClick={() => handleAddToTeam(t.id)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-2xl transition-all group"
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600 font-black group-hover:scale-110 transition-transform">
                                   {t.name[0].toUpperCase()}
                                </div>
                                <div className="text-left">
                                   <div className="text-sm font-black text-gray-800">{t.name}</div>
                                   <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Lider: {t.leader?.user?.email?.split('@')[0]}</div>
                                </div>
                             </div>
                             <Plus size={18} className="text-gray-300 group-hover:text-indigo-500" />
                          </button>
                       ))
                    )}
                 </div>
              </div>
              
              <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex justify-end">
                 <button 
                   onClick={() => setShowTeamModal(false)}
                   className="px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                 >
                    İptal
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
