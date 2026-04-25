import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Users, Plus, 
  X, ChevronRight, LayoutGrid, 
  UserMinus, ArrowLeft, BarChart3, TrendingUp, Target, Clock, History,
  Loader2,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const Teams = () => {
  const { activeClub, activeRole, activeMembershipId } = useClub();
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const [teamStats, setTeamStats] = useState(null);
  const [selectedMemberHistory, setSelectedMemberHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('members');

  const [allMembers, setAllMembers] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLeaderId, setSelectedLeaderId] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = activeRole === 'baskan' || user?.loginType === 'club';
  const isLider = activeRole === 'ekip_lideri' || activeRole === 'ekip-lideri';

  const fetchTeams = useCallback(() => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/teams`)
      .then(r => { 
        setTeams(r.data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [activeClub?.id]);

  const displayTeams = isAdmin 
    ? teams 
    : teams.filter(t => Number(t.leader?.id) === Number(activeMembershipId));

  const fetchTeamDetails = (teamId) => {
    Promise.all([
        api.get(`/clubs/${activeClub.id}/teams/${teamId}/members`),
        api.get(`/clubs/${activeClub.id}/teams/${teamId}/performance`)
    ]).then(([membersRes, statsRes]) => {
        setTeamMembers(membersRes.data);
        setTeamStats(statsRes.data);
    }).catch(() => {});
  };

  const fetchMemberHistory = (membershipId) => {
    api.get(`/clubs/${activeClub.id}/teams/${selectedTeam.id}/members/${membershipId}/history`)
        .then(r => setSelectedMemberHistory(r.data))
        .catch(() => alert("Üye geçmişi getirilemedi."));
  };

  const fetchAllClubMembers = useCallback(() => {
    if (!activeClub?.id) return;
    api.get(`/clubs/${activeClub.id}/members`)
      .then(r => setAllMembers(r.data))
      .catch(err => console.error("Üyeler getirilemedi", err));
  }, [activeClub?.id]);

  useEffect(() => { 
    fetchTeams(); 
    if (isAdmin || isLider) fetchAllClubMembers();
  }, [fetchTeams, fetchAllClubMembers, isAdmin, isLider]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedLeaderId) return;
    setSaving(true);
    try {
      await api.post(`/clubs/${activeClub.id}/teams`, { 
        name, 
        description,
        leader: { id: selectedLeaderId }
      });
      setName('');
      setDescription('');
      setSelectedLeaderId('');
      setShowForm(false);
      fetchTeams();
      fetchAllClubMembers();
    } catch (e) {
      alert('Ekip oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  };

  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedNewMemberId || !selectedTeam) return;
    try {
      await api.post(`/clubs/${activeClub.id}/teams/${selectedTeam.id}/members`, {
        membership: { id: selectedNewMemberId }
      }, {
        params: { requesterId: activeMembershipId }
      });
      setSelectedNewMemberId('');
      fetchTeamDetails(selectedTeam.id);
    } catch (e) {
      alert(e.response?.data?.message || 'Üye eklenemedi.');
    }
  };

  const handleRemoveMember = async (tmId) => {
    if (!window.confirm('Üyeyi ekipten çıkarmak istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/teams/${selectedTeam.id}/members/${tmId}`, {
        params: { requesterId: activeMembershipId }
      });
      fetchTeamDetails(selectedTeam.id);
    } catch (e) { 
        alert(e.response?.data?.message || 'Üye çıkarılamadı.'); 
    }
  };

  const isLeaderOfSelectedTeam = Number(selectedTeam?.leader?.id) === Number(activeMembershipId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2 flex items-center gap-3">
            Ekipler & Performans
          </h1>
          <p className="text-gray-500 font-medium">
            {activeClub?.name} çalışma gruplarını ve verimliliği izleyin
          </p>
        </div>
        <div className="flex gap-3">
          {selectedTeam && (
            <Button 
              variant="secondary" 
              onClick={() => { setSelectedTeam(null); setSelectedMemberHistory(null); }} 
              icon={ArrowLeft}
            >
              EKİP LİSTESİNE DÖN
            </Button>
          )}
          {isAdmin && !selectedTeam && (
            <Button variant="primary" onClick={() => setShowForm(true)} icon={Plus}>
              YENİ EKİP
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Team List / Selection */}
        <div className={`${selectedTeam ? 'hidden lg:block lg:col-span-4' : 'lg:col-span-12'} space-y-6`}>
          {showForm && (
            <Card className="animate-in fade-in slide-in-from-top-4 duration-300 border-indigo-200" title="Yeni Ekip Kur">
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <Input 
                  label="Ekip Adı"
                  placeholder="Örn: Organizasyon Ekibi" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Açıklama</label>
                  <textarea 
                    placeholder="Ekibin sorumluluk alanlarını belirtin..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={3} 
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Ekip Lideri</label>
                  <select 
                    required
                    value={selectedLeaderId}
                    onChange={e => setSelectedLeaderId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  >
                    <option value="">Lider Seçiniz...</option>
                    {allMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName}` : m.user?.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setShowForm(false)} className="flex-1">İPTAL</Button>
                  <Button variant="primary" type="submit" loading={saving} className="flex-1">OLUŞTUR</Button>
                </div>
              </form>
            </Card>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-gray-500">Ekipler yükleniyor...</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedTeam ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              {displayTeams.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
                   <Users size={48} className="text-gray-200 mx-auto mb-4" />
                   <p className="text-sm font-bold text-gray-900 mb-1">Henüz ekip bulunmuyor</p>
                   <p className="text-xs text-gray-500">Yönetim için yeni ekipler oluşturun.</p>
                </div>
              ) : (
                displayTeams.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => { setSelectedTeam(t); fetchTeamDetails(t.id); }}
                    className={`w-full text-left bg-white border rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden ${
                      selectedTeam?.id === t.id 
                      ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' 
                      : 'border-gray-100 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-xl transition-colors ${selectedTeam?.id === t.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                        <LayoutGrid size={20} />
                      </div>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                        LİDER: {t.leader?.user?.firstName ? t.leader.user.firstName.toUpperCase() : t.leader?.user?.email?.split('@')[0].toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{t.name}</h3>
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PERFORMANS & ÜYELER</span>
                      <ChevronRight size={16} className={`transition-transform duration-300 ${selectedTeam?.id === t.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Team Detail Panel */}
        {selectedTeam && (
          <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Başarı Oranı', value: `%${teamStats?.completionRate || 0}`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Toplam Görev', value: teamStats?.totalTasks || 0, icon: Target, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Gecikenler', value: teamStats?.overdueTasks || 0, icon: Clock, color: 'bg-rose-50 text-rose-600' },
              ].map(s => (
                <Card key={s.label} noPadding>
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                      <s.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                      <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card noPadding className="overflow-hidden shadow-xl shadow-indigo-900/5 border-indigo-100">
              {/* Team Header */}
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 relative">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedTeam.name}</h2>
                <p className="text-gray-500 font-medium leading-relaxed">{selectedTeam.description}</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10 px-4">
                {[
                  { id: 'members', label: 'EKİP ÜYELERİ', icon: Users },
                  { id: 'performance', label: 'VERİMLİLİK ANALİZİ', icon: BarChart3 }
                ].map(tab => (
                    <button 
                      key={tab.id} 
                      onClick={() => setActiveTab(tab.id)} 
                      className={`flex items-center gap-2 py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                        activeTab === tab.id 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
              </div>

              <div className="p-8">
                {activeTab === 'members' && (
                  <div className="space-y-8">
                    {/* Add Member Form */}
                    {isLeaderOfSelectedTeam && (
                        <div className="bg-indigo-50/30 border border-indigo-100 p-6 rounded-2xl space-y-4">
                            <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                                <Plus size={14} /> Yeni Ekip Üyesi Ekle
                            </h4>
                            <div className="flex flex-col md:flex-row gap-3">
                                <select 
                                    value={selectedNewMemberId} 
                                    onChange={e => setSelectedNewMemberId(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm bg-white border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                >
                                    <option value="">Bir topluluk üyesi seçin...</option>
                                    {allMembers
                                        .filter(m => !teamMembers.some(tm => tm.membership.id === m.id))
                                        .map(m => (
                                            <option key={m.id} value={m.id}>
                                              {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName}` : m.user?.email} ({m.role})
                                            </option>
                                        ))
                                    }
                                </select>
                                <Button 
                                    onClick={handleAddMember}
                                    disabled={!selectedNewMemberId}
                                    icon={Plus}
                                >
                                    EKLE
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Members Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teamMembers.map(tm => {
                          const isLeader = tm.role === 'EKIP_LIDERI';
                          const displayName = tm.membership.user?.firstName ? `${tm.membership.user.firstName} ${tm.membership.user.lastName}` : tm.membership.user?.email?.split('@')[0];
                          
                          return (
                            <div 
                              key={tm.id} 
                              className={`flex items-center justify-between p-4 bg-white border rounded-xl group transition-all ${
                                isLeaderOfSelectedTeam 
                                ? 'cursor-pointer border-gray-100 hover:border-indigo-300 hover:shadow-sm' 
                                : 'border-gray-50 opacity-90'
                              }`} 
                              onClick={() => isLeaderOfSelectedTeam && fetchMemberHistory(tm.membership.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm border ${
                                      isLeader 
                                      ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                    }`}>
                                        {(tm.membership.user?.firstName?.[0] || tm.membership.user?.email?.[0]).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 leading-none mb-1">{displayName}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1.5">
                                          {isLeader ? (
                                            <>
                                              <ShieldCheck size={10} className="text-amber-500" />
                                              EKİP LİDERİ
                                            </>
                                          ) : (
                                            <>
                                              <Users size={10} className="text-indigo-400" />
                                              EKİP ÜYESİ
                                            </>
                                          )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isLeaderOfSelectedTeam && !isLeader && (
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleRemoveMember(tm.id); }} 
                                          className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                          title="Ekipten Çıkar"
                                        >
                                            <UserMinus size={18} />
                                        </button>
                                    )}
                                    <ChevronRight size={16} className={`text-gray-300 transition-all ${isLeaderOfSelectedTeam ? 'group-hover:text-indigo-400 group-hover:translate-x-0.5' : 'hidden'}`} />
                                </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100 space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 size={18} /> EKİP VERİMLİLİĞİ
                              </h4>
                              <span className="text-2xl font-bold text-indigo-600">%{teamStats?.completionRate || 0}</span>
                            </div>
                            
                            <div className="relative w-full bg-indigo-100 h-3 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="absolute left-0 top-0 bg-indigo-600 h-full transition-all duration-1000 ease-out" 
                                  style={{ width: `${teamStats?.completionRate || 0}%` }} 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">TAMAMLANAN GÖREV</div>
                                <div className="text-xl font-bold text-emerald-600">{teamStats?.completedTasks || 0}</div>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">BEKLEYEN GÖREV</div>
                                <div className="text-xl font-bold text-indigo-600">{teamStats?.pendingTasks || 0}</div>
                              </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <Info size={18} className="text-indigo-400 shrink-0" />
                          <p className="text-xs text-gray-500 font-medium italic">
                            Performans verileri ekipe atanan tüm projelerdeki görevlerin tamamlanma durumuna göre anlık olarak hesaplanmaktadır.
                          </p>
                        </div>
                    </div>
                )}

                {selectedMemberHistory && (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-end" onClick={() => setSelectedMemberHistory(null)}>
                        <div 
                          className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
                          onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                  <History className="text-indigo-600" /> Üye Geçmişi
                                </h3>
                                <button onClick={() => setSelectedMemberHistory(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-all">
                                  <X size={24} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 space-y-10">
                              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 space-y-6">
                                  <div className="text-center">
                                      <div className="text-4xl font-bold text-indigo-600">%{selectedMemberHistory.performanceScore}</div>
                                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">PERFORMANS SKORU</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                                      <div className="text-center">
                                        <div className="text-lg font-bold text-gray-800">{selectedMemberHistory.completedTasks}</div>
                                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">TAMAMLANAN</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-lg font-bold text-gray-800">{selectedMemberHistory.totalTasks}</div>
                                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">TOPLAM GÖREV</div>
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-6">
                                  <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Clock size={14} className="text-gray-400" /> SON GÖREVLER
                                  </h4>
                                  <div className="space-y-3">
                                      {selectedMemberHistory.tasks.map(t => (
                                          <div key={t.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between group/task-history">
                                              <div className="min-w-0 mr-4">
                                                  <div className="text-sm font-bold text-gray-800 truncate">{t.title}</div>
                                                  <div className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-tight">{t.project?.name}</div>
                                              </div>
                                              <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                t.status === 'completed' 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                              }`}>
                                                  {t.status === 'completed' ? 'TAMAM' : 'AÇIK'}
                                              </span>
                                          </div>
                                      ))}
                                      {selectedMemberHistory.tasks.length === 0 && (
                                        <p className="text-xs text-gray-400 italic text-center py-4">Bu üyeye ait görev geçmişi bulunmuyor.</p>
                                      )}
                                  </div>
                              </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
