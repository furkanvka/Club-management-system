import React, { useEffect, useState, useCallback } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Users, Plus, 
  X, ChevronRight, LayoutGrid, 
  UserMinus, ArrowLeft, BarChart3, TrendingUp, Target, Clock, History
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('members'); // members, performance

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="text-indigo-600" size={24} />
            Ekipler & Performans
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {activeClub?.name} çalışma gruplarını ve verimliliği izleyin
          </p>
        </div>
        {isAdmin && !selectedTeam && (
          <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
            <Plus size={18} /> Yeni Ekip Oluştur
          </button>
        )}
        {selectedTeam && (
          <button onClick={() => { setSelectedTeam(null); setSelectedMemberHistory(null); }} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 transition">
            <ArrowLeft size={18} /> Ekiplere Dön
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ekip Listesi */}
        <div className={`${selectedTeam ? 'hidden lg:block lg:col-span-4' : 'lg:col-span-12'} space-y-4`}>
          {showForm && (
            <div className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-xl shadow-indigo-50/50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Yeni Ekip Kur</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <input placeholder="Ekip Adı..." value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Ekip Lideri</label>
                  <select value={selectedLeaderId} onChange={e => setSelectedLeaderId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Lider Seçiniz...</option>
                    {allMembers.map(m => <option key={m.id} value={m.id}>{m.user?.email}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleCreateTeam} disabled={saving || !name.trim() || !selectedLeaderId} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all">
                {saving ? 'Kuruluyor...' : 'Ekibi Kur'}
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedTeam ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              {displayTeams.length === 0 ? (
                <div className="col-span-full py-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                   <Users className="mx-auto text-gray-300 mb-2" size={48} />
                   <p className="text-gray-500 font-bold italic">Görüntülenecek ekip bulunmuyor.</p>
                </div>
              ) : (
                displayTeams.map(t => (
                  <div key={t.id} onClick={() => { setSelectedTeam(t); fetchTeamDetails(t.id); }} className={`group cursor-pointer bg-white border rounded-[2rem] p-6 transition-all duration-300 ${selectedTeam?.id === t.id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-indigo-300'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={20} /></div>
                      <div className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase">Lider: {t.leader?.user?.email?.split('@')[0]}</div>
                    </div>
                    <h3 className="font-black text-gray-900 group-hover:text-indigo-700 transition-colors mb-2">{t.name}</h3>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Performansı Gör</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Detay Paneli */}
        {selectedTeam && (
          <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Team Performance Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><TrendingUp size={24} /></div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Başarı Oranı</div>
                        <div className="text-xl font-black text-gray-900">%{teamStats?.completionRate || 0}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Target size={24} /></div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toplam Görev</div>
                        <div className="text-xl font-black text-gray-900">{teamStats?.totalTasks || 0}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center"><Clock size={24} /></div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gecikenler</div>
                        <div className="text-xl font-black text-gray-900">{teamStats?.overdueTasks || 0}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-200/40 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-1">{selectedTeam.name}</h2>
                    <p className="text-sm text-gray-500 font-medium">{selectedTeam.description}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-50 px-8">
                {['members', 'performance'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 px-6 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {tab === 'members' && 'Üyeler'}
                        {tab === 'performance' && 'Performans Analizi'}
                    </button>
                ))}
              </div>

              <div className="p-8">
                {activeTab === 'members' && (
                  <div className="space-y-6">
                    {/* Üye Ekleme Formu (Sadece Liderler için) */}
                    {isLeaderOfSelectedTeam && (
                        <div className="bg-indigo-50/30 border border-indigo-100 p-6 rounded-3xl space-y-4">
                            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                                <Plus size={16} /> Yeni Ekip Üyesi Ekle
                            </h4>
                            <div className="flex flex-col md:flex-row gap-3">
                                <select 
                                    value={selectedNewMemberId} 
                                    onChange={e => setSelectedNewMemberId(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">Üye Seçiniz...</option>
                                    {allMembers
                                        .filter(m => !teamMembers.some(tm => tm.membership.id === m.id))
                                        .map(m => (
                                            <option key={m.id} value={m.id}>{m.user?.email} ({m.role})</option>
                                        ))
                                    }
                                </select>
                                <button 
                                    onClick={handleAddMember}
                                    disabled={!selectedNewMemberId}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teamMembers.map(tm => (
                            <div key={tm.id} className={`flex items-center justify-between p-4 bg-gray-50/50 border rounded-2xl group transition-all ${isLeaderOfSelectedTeam ? 'cursor-pointer hover:border-indigo-300 hover:bg-white' : 'border-gray-100'}`} onClick={() => isLeaderOfSelectedTeam && fetchMemberHistory(tm.membership.id)}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${tm.role === 'EKIP_LIDERI' ? 'bg-amber-50 text-amber-600' : 'bg-white text-indigo-500'}`}>
                                        {tm.membership.user?.email?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">{tm.membership.user?.email}</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">{tm.role === 'EKIP_LIDERI' ? 'Lider' : 'Ekip Üyesi'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isLeaderOfSelectedTeam && tm.role !== 'EKIP_LIDERI' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveMember(tm.id); }} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <UserMinus size={16} />
                                        </button>
                                    )}
                                    <ChevronRight size={16} className="text-gray-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                    <div className="space-y-6">
                        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2"><BarChart3 size={18} /> Ekip Verimliliği</h4>
                            <div className="w-full bg-indigo-100 h-4 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${teamStats?.completionRate || 0}%` }} />
                            </div>
                            <p className="mt-2 text-xs font-bold text-indigo-600 text-right">Projeler %{teamStats?.completionRate || 0} tamamlandı</p>
                        </div>
                    </div>
                )}

                {selectedMemberHistory && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-end">
                        <div className="bg-white w-full max-w-md h-full shadow-2xl p-8 space-y-8 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2"><History className="text-indigo-600" /> Üye Geçmişi</h3>
                                <button onClick={() => setSelectedMemberHistory(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={24} /></button>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-indigo-600">%{selectedMemberHistory.performanceScore}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Genel Performans Skoru</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                    <div className="text-center"><div className="font-bold">{selectedMemberHistory.completedTasks}</div><div className="text-[9px] text-gray-400 font-black uppercase">Tamamlanan</div></div>
                                    <div className="text-center"><div className="font-bold">{selectedMemberHistory.totalTasks}</div><div className="text-[9px] text-gray-400 font-black uppercase">Toplam Görev</div></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-black text-gray-800 uppercase tracking-widest text-xs">Son Görevler</h4>
                                <div className="space-y-2">
                                    {selectedMemberHistory.tasks.map(t => (
                                        <div key={t.id} className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">{t.title}</div>
                                                <div className="text-[10px] text-gray-400">{t.project?.name}</div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {t.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};