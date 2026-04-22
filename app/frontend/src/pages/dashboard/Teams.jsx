import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  Users, Plus, Trash2, Shield, UserPlus, 
  X, ChevronRight, LayoutGrid, Search, 
  UserCircle2, Mail, Info, UserMinus, ArrowLeft
} from 'lucide-react';

export const Teams = () => {
  const { activeClub, activeRole } = useClub();
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const canManage = activeRole === 'baskan' || user?.loginType === 'club';

  const fetchTeams = () => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/teams`)
      .then(r => { setTeams(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchTeamMembers = (teamId) => {
    setLoadingMembers(true);
    api.get(`/clubs/${activeClub.id}/teams/${teamId}/members`)
      .then(r => { setTeamMembers(r.data); setLoadingMembers(false); })
      .catch(() => setLoadingMembers(false));
  };

  useEffect(() => { 
    fetchTeams(); 
    setSelectedTeam(null);
    setTeamMembers([]);
  }, [activeClub]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post(`/clubs/${activeClub.id}/teams`, { name, description });
      setName('');
      setDescription('');
      setShowForm(false);
      fetchTeams();
    } catch (e) {
      alert('Ekip oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (tmId) => {
    if (!window.confirm('Üyeyi ekipten çıkarmak istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/teams/${selectedTeam.id}/members/${tmId}`);
      fetchTeamMembers(selectedTeam.id);
    } catch (e) { alert('Üye çıkarılamadı.'); }
  };

  const handleDeleteTeam = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bu ekibi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/clubs/${activeClub.id}/teams/${id}`);
      if (selectedTeam?.id === id) setSelectedTeam(null);
      fetchTeams();
    } catch (e) { alert('Silinemedi.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="text-indigo-600" size={24} />
            Ekipler & Komiteler
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {activeClub?.name} içindeki çalışma gruplarını yönetin
          </p>
        </div>
        {canManage && !selectedTeam && (
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            <Plus size={18} /> Yeni Ekip Oluştur
          </button>
        )}
        {selectedTeam && (
          <button 
            onClick={() => setSelectedTeam(null)} 
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 transition"
          >
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
                <input 
                  placeholder="Ekip Adı (Örn: Tanıtım Ekibi)" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none font-medium transition-all" 
                />
                <textarea 
                  placeholder="Ekip görevi ve açıklaması..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={3} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none font-medium transition-all" 
                />
              </div>
              <button 
                onClick={handleCreateTeam} 
                disabled={saving || !name.trim()} 
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
              >
                {saving ? 'Oluşturuluyor...' : 'Ekibi Kur'}
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : teams.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center text-gray-300 mb-4">
                <Users size={32} />
              </div>
              <h4 className="font-bold text-gray-800">Henüz Ekip Kurulmamış</h4>
              <p className="text-sm text-gray-400 mt-1">Kulüp üyelerinizi ekiplere ayırarak iş birliğini artırın.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedTeam ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              {teams.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => { setSelectedTeam(t); fetchTeamMembers(t.id); }}
                  className={`group cursor-pointer bg-white border rounded-[2rem] p-6 transition-all duration-300 relative overflow-hidden ${
                    selectedTeam?.id === t.id 
                    ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-none' 
                    : 'border-gray-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-gray-200/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 transition-colors text-gray-400 group-hover:text-indigo-600">
                      <Users size={20} />
                    </div>
                    {canManage && (
                      <button 
                        onClick={(e) => handleDeleteTeam(t.id, e)} 
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <h3 className="font-black text-gray-900 group-hover:text-indigo-700 transition-colors mb-2 line-clamp-1">{t.name}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-6 h-8">{t.description || 'Ekip açıklaması yok.'}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Üye Listesini Gör
                    </div>
                    <ChevronRight size={16} className={`text-gray-300 transition-transform duration-300 ${selectedTeam?.id === t.id ? 'translate-x-1 text-indigo-500' : 'group-hover:translate-x-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ekip Üyeleri (Sağ Panel) */}
        {selectedTeam && (
          <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-200/40 overflow-hidden sticky top-6">
              <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-indigo-50/30 to-white">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-2">
                  <Shield size={14} /> Ekip Yönetimi
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">{selectedTeam.name}</h2>
                <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-2xl">{selectedTeam.description}</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Üye Ekleme (Arayüz Olarak Hazır) */}
                {canManage && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                    <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs font-bold text-amber-800 leading-relaxed">
                      Ekip üyelerini yönetmek için üyeler listesinden kişileri bu ekibe atayabilirsiniz. (Yakında aktif olacak)
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                      <Users size={20} className="text-indigo-500" /> Ekip Üyeleri
                    </h3>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {teamMembers.length} Üye
                    </div>
                  </div>

                  {loadingMembers ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Üyeler Getiriliyor...</p>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100">
                      <UserCircle2 className="mx-auto text-gray-200 mb-3" size={48} />
                      <p className="text-gray-400 font-bold text-sm">Bu ekipte henüz üye bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {teamMembers.map(tm => (
                        <div key={tm.id} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl group hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 font-bold border border-gray-100 shadow-sm">
                              {tm.user?.email?.[0].toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-gray-800 truncate">{tm.user?.email || 'Bilinmeyen Üye'}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{tm.role || 'Üye'}</div>
                            </div>
                          </div>
                          {canManage && (
                            <button onClick={() => handleRemoveMember(tm.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <UserMinus size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
