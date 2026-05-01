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
  Folder,
  Eye,
  CheckCircle2,
  Clock,
  UserPlus
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
  const [viewingPending, setViewingPending] = useState(false);

  // Team Assignment State
  const [myTeams, setMyTeams] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [assigning, setAssigning] = useState(false);

  // History State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  const handleApproveMember = async (memberId) => {
    try {
      await api.put(`/clubs/${activeClub.id}/members/${memberId}/approve`);
      fetchMembers();
    } catch (e) {
      alert('Onaylanırken hata oluştu.');
    }
  };

  const fetchMemberHistory = async (membershipId) => {
    setLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const r = await api.get(`/clubs/${activeClub.id}/members/${membershipId}/history`);
      setHistoryData(r.data);
    } catch (e) {
      alert('Geçmiş bilgileri alınamadı.');
      setShowHistoryModal(false);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchMyTeams = useCallback(() => {
    if (!activeClub?.id || !canManageTeams) return;
    api.get(`/clubs/${activeClub.id}/teams`)
      .then(r => {
        let data = r.data;
        if (Array.isArray(data)) {
          if (!isBaskan) {
            data = data.filter(t => Number(t.leader?.id) === Number(activeMembershipId));
          }
          setMyTeams(data);
        } else {
          setMyTeams([]);
        }
      })
      .catch(() => setMyTeams([]));
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

  const handleMakePresident = async (memberId) => {
    if (!window.confirm('Bu üyeyi kulüp başkanı olarak atamak istediğinize emin misiniz?')) return;
    try {
      await api.put(`/clubs/${activeClub.id}/members/${memberId}/role`, 'baskan');
      alert('Üye başarıyla başkan olarak atandı.');
      fetchMembers();
    } catch (e) {
      alert('Başkan atanamadı.');
    }
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

  const pendingMembers = members.filter(m => m.status === 'pending');
  const activeMembers = members.filter(m => m.status !== 'pending');

  const filtered = (viewingPending ? pendingMembers : activeMembers).filter(m =>
    (m.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.user?.studentNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const headers = viewingPending
    ? ['Üye Bilgileri', 'Öğrenci No', 'Durum', '']
    : ['Üye Bilgileri', 'Öğrenci No', 'Yetki Grubu', 'Sistem Durumu', ''];

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
          { label: 'Onay Bekleyen', value: pendingMembers.length, color: 'bg-amber-50 text-amber-600', icon: Clock },
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
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Üye ara..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
          {/* Tab buttons */}
          {isBaskan && (
            <div className="flex gap-2">
              <button
                onClick={() => { setViewingPending(false); setSearch(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  !viewingPending ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:brightness-95'
                }`}
              >
                <Users size={14} />
                Aktif Üyeler
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  !viewingPending ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                }`}>{activeMembers.length}</span>
              </button>
              <button
                onClick={() => { setViewingPending(true); setSearch(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  viewingPending ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200 hover:brightness-95'
                }`}
              >
                <Clock size={14} />
                Onay Bekleyen
                {pendingMembers.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    viewingPending ? 'bg-white/20' : 'bg-amber-200 text-amber-800'
                  }`}>{pendingMembers.length}</span>
                )}
              </button>
            </div>
          )}
        </div>

        <Table
          headers={headers}
          data={filtered}
          loading={loading}
          emptyMessage={search ? 'Arama kriterlerine uygun üye bulunamadı.' : 'Henüz üye bulunmuyor.'}
          renderRow={(m) => {
            const rb = getRoleBadge(m.role);
            const RoleIcon = rb.icon;
            const normalizedRole = (m.role || '').toUpperCase().replace('-', '_');
            const isUserBaskan = normalizedRole === 'KULUP_BASKANI' || normalizedRole === 'BASKAN';
            const isRegularMember = !m.role || normalizedRole === 'UYE';
            const displayName = m.user?.firstName
              ? `${m.user.firstName}${m.user.lastName ? ' ' + m.user.lastName : ''}`
              : (m.user?.email?.split('@')[0] || 'Bilinmiyor');
            
            return (
              <>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      viewingPending ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {displayName[0].toLocaleUpperCase('tr-TR')}
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
                {viewingPending ? (
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-700 border-amber-100">
                      <Clock size={12} />
                      ONAY BEKLİYOR
                    </span>
                  </TableCell>
                ) : (
                  <>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${rb.color}`}>
                          <RoleIcon size={12} />
                          {rb.label.toLocaleUpperCase('tr-TR')}
                        </span>
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
                  </>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                     {/* Onay bekleyen modda onay/red butonları */}
                     {viewingPending && isBaskan && (
                       <>
                         <Button
                           variant="primary"
                           size="sm"
                           onClick={() => handleApproveMember(m.id)}
                           icon={CheckCircle2}
                           className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                         >
                           ONAYLA
                         </Button>
                         <button
                           onClick={() => handleRemove(m.id)}
                           className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                           title="Reddet ve Sil"
                         >
                           <Trash2 size={18} />
                         </button>
                       </>
                     )}

                     {/* Normal modda yönetim butonları */}
                     {!viewingPending && user?.loginType === 'club' && isRegularMember && (
                       <Button
                         variant="primary"
                         size="sm"
                         onClick={() => handleMakePresident(m.id)}
                         icon={Crown}
                       >
                         BAŞKAN YAP
                       </Button>
                     )}

                     {!viewingPending && canManageTeams && !isUserBaskan && (
                       <Button
                         variant="secondary"
                         size="sm"
                         onClick={() => { setSelectedMember(m); setShowTeamModal(true); }}
                         icon={Plus}
                       >
                         EKİBE EKLE
                       </Button>
                     )}

                     {!viewingPending && isBaskan && (
                        <button
                         onClick={() => { setSelectedMember(m); fetchMemberHistory(m.id); }}
                         className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                         title="Geçmişi Görüntüle"
                       >
                         <Eye size={18} />
                       </button>
                     )}
                     
                     {!viewingPending && isBaskan && !isUserBaskan && (
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

      {/* Member History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-24">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-4 duration-300">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Üye Geçmişi</h3>
                <p className="text-sm text-gray-500 font-medium">
                  {selectedMember?.user?.firstName} {selectedMember?.user?.lastName} ({selectedMember?.user?.studentNumber})
                </p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-all rounded-lg hover:bg-gray-50">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Veriler Yükleniyor...</p>
                </div>
              ) : (
                <>
                  {/* Teams Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="text-indigo-500" size={20} />
                      <h4 className="font-bold text-gray-900 uppercase tracking-tight text-sm">Bulunduğu Ekipler</h4>
                    </div>
                    {historyData?.teams?.length === 0 ? (
                      <p className="text-sm text-gray-400 bg-white p-4 rounded-xl border border-dashed border-gray-200">Henüz bir ekipte yer almadı.</p>
                    ) : (
                      <div className="grid gap-3">
                        {historyData?.teams?.map(tm => (
                          <div key={tm.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                                {tm.team?.name[0]}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{tm.team?.name}</div>
                                <div className="text-xs text-gray-500">{tm.role}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Katılım</div>
                              <div className="text-xs font-medium text-gray-600">{new Date(tm.joinedAt).toLocaleDateString('tr-TR')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Events Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="text-amber-500" size={20} />
                      <h4 className="font-bold text-gray-900 uppercase tracking-tight text-sm">Etkinlik Görevleri</h4>
                    </div>
                    {historyData?.events?.length === 0 ? (
                      <p className="text-sm text-gray-400 bg-white p-4 rounded-xl border border-dashed border-gray-200">Henüz bir etkinlikte görev almadı.</p>
                    ) : (
                      <div className="grid gap-3">
                        {historyData?.events?.map(es => (
                          <div key={es.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 font-bold">
                                E
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{es.event?.title}</div>
                                <div className="text-xs text-gray-500">{es.role}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tarih</div>
                              <div className="text-xs font-medium text-gray-600">{new Date(es.assignedAt).toLocaleDateString('tr-TR')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Applications Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Folder className="text-blue-500" size={20} />
                      <h4 className="font-bold text-gray-900 uppercase tracking-tight text-sm">Etkinlik Başvuruları</h4>
                    </div>
                    {historyData?.applications?.length === 0 ? (
                      <p className="text-sm text-gray-400 bg-white p-4 rounded-xl border border-dashed border-gray-200">Henüz bir etkinliğe başvurmadı.</p>
                    ) : (
                      <div className="grid gap-3">
                        {historyData?.applications?.map(app => (
                          <div key={app.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${app.status === 'approved' ? 'bg-emerald-500' : app.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                              <div>
                                <div className="text-sm font-bold text-gray-900">{app.event?.title}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase">{app.status}</div>
                              </div>
                            </div>
                            <div className="text-right">
                               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Başvuru</div>
                               <div className="text-xs font-medium text-gray-600">{new Date(app.appliedAt).toLocaleDateString('tr-TR')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tasks Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="text-emerald-500" size={20} />
                      <h4 className="font-bold text-gray-900 uppercase tracking-tight text-sm">Atanan Görevler</h4>
                    </div>
                    {historyData?.tasks?.length === 0 ? (
                      <p className="text-sm text-gray-400 bg-white p-4 rounded-xl border border-dashed border-gray-200">Henüz bir görev atanmadı.</p>
                    ) : (
                      <div className="grid gap-3">
                        {historyData?.tasks?.map(task => (
                          <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${task.status === 'TAMAMLANDI' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <div>
                                <div className="text-sm font-bold text-gray-900">{task.title}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase">{task.status}</div>
                              </div>
                            </div>
                            <div className="text-right">
                               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teslim</div>
                               <div className="text-xs font-medium text-gray-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '—'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => setShowHistoryModal(false)}
              >
                KAPAT
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
