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
  Plus,
  X,
  DollarSign,
  Folder
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';

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
  const canManageTeams = isLider;

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

  const getRoleBadge = (role) => {
    const normalized = (role || '').toUpperCase().replace('-', '_');
    switch (normalized) {
      case 'KULUP_BASKANI':
      case 'BASKAN':
        return { label: 'Başkan', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: Crown };
      case 'EKIP_LIDERI':
        return { label: 'Ekip Lideri', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Star };
      case 'EKIP_UYESI':
        return { label: 'Ekip Üyesi', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: Shield };
      default:
        return { label: 'Üye', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: UserCheck };
    }
  };

  const filtered = members.filter(m =>
    (m.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.studentNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const headers = ['Üye Bilgileri', 'Öğrenci No', 'Yetki Grubu', 'Sistem Durumu', ''];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2 flex items-center gap-2">
            Üye Yönetimi
          </h1>
          <p className="text-gray-500 font-medium">
            {activeClub?.name} topluluk üyeleri ve yetki dağılımı
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Üye', value: members.length, color: 'bg-indigo-50 text-indigo-600', icon: Users },
          { label: 'Başkanlar', value: members.filter(m => ['KULUP_BASKANI', 'BASKAN'].includes(m.role?.toUpperCase())).length, color: 'bg-purple-50 text-purple-600', icon: Crown },
          { label: 'Ekip Liderleri', value: members.filter(m => m.role?.toUpperCase() === 'EKIP_LIDERI').length, color: 'bg-amber-50 text-amber-600', icon: Star },
          { label: 'Aktif Üyeler', value: members.filter(m => m.status === 'active').length, color: 'bg-emerald-50 text-emerald-600', icon: UserCheck },
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
        <div className="p-6 border-b border-gray-100 bg-gray-50/30">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Üye ara..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <Table
          headers={headers}
          data={filtered}
          loading={loading}
          emptyMessage={search ? 'Arama kriterlerine uygun üye bulunamadı.' : 'Henüz üye bulunmuyor.'}
          renderRow={(m) => {
            const rb = getRoleBadge(m.role);
            const RoleIcon = rb.icon;
            const normalizedRole = (m.role || '').toUpperCase();
            const isUserBaskan = normalizedRole === 'KULUP_BASKANI' || normalizedRole === 'BASKAN';
            const displayName = m.user?.firstName ? `${m.user.firstName} ${m.user.lastName}` : (m.user?.email?.split('@')[0] || 'Bilinmiyor');
            
            return (
              <>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">
                      {displayName[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{displayName}</div>
                      <div className="text-xs text-gray-500 font-medium">{m.user?.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-600">
                   {m.user?.studentNumber || '—'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${rb.color}`}>
                      <RoleIcon size={12} />
                      {rb.label.toUpperCase()}
                    </span>
                    {isBaskan && !isUserBaskan && (
                      <div className="flex gap-1">
                        {[
                          { key: 'yonetici', label: 'Ynt', color: 'text-red-600', bg: 'bg-red-50' },
                          { key: 'finans', label: 'Fin', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                          { key: 'docs', label: 'Bel', icon: Folder, color: 'text-blue-600', bg: 'bg-blue-50' },
                        ].map(f => {
                          const active = m.flags && m.flags.includes(`"${f.key}":true`);
                          return (
                            <button
                              key={f.key}
                              onClick={() => handleUpdateFlags(m.id, m.flags, f.key)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all border ${
                                active 
                                ? `${f.bg} ${f.color} border-current` 
                                : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                              }`}
                              title={`${f.label} Yetkisi`}
                            >
                              {f.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    m.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    {m.status === 'active' ? 'AKTİF' : 'PASİF'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                     {canManageTeams && !isUserBaskan && (
                       <Button
                         variant="secondary"
                         size="sm"
                         onClick={() => { setSelectedMember(m); setShowTeamModal(true); }}
                         icon={Plus}
                       >
                         EKİBE EKLE
                       </Button>
                     )}
                     
                     {isBaskan && !isUserBaskan && (
                        <button
                         onClick={() => handleRemove(m.id)}
                         className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                         title="Üyeyi Çıkar"
                       >
                         <Trash2 size={18} />
                       </button>
                     )}
                  </div>
                </TableCell>
              </>
            );
          }}
        />
      </Card>

      {/* Team Assignment Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">Ekibe Ata</h3>
                    <p className="text-xs text-gray-500 font-medium">{selectedMember?.user?.email}</p>
                 </div>
                 <button onClick={() => setShowTeamModal(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6 space-y-4">
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hedef Ekibi Seçin</p>
                 
                 <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {myTeams.length === 0 ? (
                       <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-sm text-gray-400 font-medium">Yönettiğiniz bir ekip bulunamadı.</p>
                       </div>
                    ) : (
                       myTeams.map(t => (
                          <button
                            key={t.id}
                            disabled={assigning}
                            onClick={() => handleAddToTeam(t.id)}
                            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl transition-all group"
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold group-hover:bg-white transition-colors">
                                   {t.name[0].toUpperCase()}
                                </div>
                                <div className="text-left">
                                   <div className="text-sm font-bold text-gray-900">{t.name}</div>
                                   <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">Lider: {t.leader?.user?.email?.split('@')[0]}</div>
                                </div>
                             </div>
                             <Plus size={18} className="text-gray-300 group-hover:text-indigo-500" />
                          </button>
                       ))
                    )}
                 </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                 <Button 
                   variant="secondary"
                   size="sm"
                   onClick={() => setShowTeamModal(false)}
                 >
                    İPTAL
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
