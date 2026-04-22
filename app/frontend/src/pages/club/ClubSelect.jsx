import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClub } from '../../store/ClubContext';
import { clubService } from '../../services/clubService';
import api from '../../services/api';
import { 
  PlusCircle, 
  ArrowRight, 
  Search, 
  Building2, 
  Users, 
  Sparkles, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  User
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export const ClubSelect = () => {
  const { myClubs, allClubs, selectClub, refreshClubs } = useClub();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/clubs/my-memberships')
      .then(r => setMemberships(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [myClubs]);

  const getRoleForClub = (clubId) => {
    const m = memberships.find(m => m.club?.id === clubId);
    return m?.role || 'uye';
  };

  const handleSelect = (club) => {
    const role = getRoleForClub(club.id);
    selectClub(club, role);
    navigate('/dashboard');
  };

  const handleJoin = async (club) => {
    if (!window.confirm(`"${club.name}" kulübüne katılmak istediğinize emin misiniz?`)) return;
    try {
      await clubService.joinClub(club.id);
      alert('Kulübe başarıyla katıldınız!');
      refreshClubs();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) alert('Zaten bu kulübün üyesisiniz.');
      else alert('Katılırken hata oluştu: ' + (err.response?.data || err.message));
    }
  };

  const otherClubs = allClubs.filter(c => 
    !myClubs.find(mc => mc.id === c.id) &&
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const roleLabel = (clubId) => {
    const role = getRoleForClub(clubId);
    if (role === 'baskan') return { text: 'Başkan', color: 'bg-indigo-100 text-indigo-700', icon: ShieldCheck };
    return { text: 'Üye', color: 'bg-emerald-100 text-emerald-700', icon: User };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100">
      {/* Top Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Kulüp Yönetimi</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Hoş Geldiniz</p>
          </div>
        </div>
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={16} />
          <span>Çıkış Yap</span>
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Kulüp Seçimi Yapın</h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Hangi kulüpte işlem yapmak istiyorsanız onu seçin veya yeni bir kulübe katılarak dünyanızı genişletin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sol Kolon - Mevcut Kulüpler */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" />
                Üyesi Olduğunuz Kulüpler
              </h3>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                {myClubs.length} Toplam
              </span>
            </div>

            {loading ? (
              <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium italic">Kulüpler yükleniyor...</p>
              </div>
            ) : myClubs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-dashed border-gray-200 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center text-gray-300">
                  <Building2 size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Henüz Bir Kulübe Üye Değilsiniz</h4>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                    Sağ taraftaki listeden kulüpleri keşfedebilir veya kendi kulübünüzü kurmak için başvuruda bulunabilirsiniz.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {myClubs.map((club) => {
                  const badge = roleLabel(club.id);
                  const Icon = badge.icon;
                  return (
                    <button
                      key={club.id}
                      onClick={() => handleSelect(club)}
                      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute right-0 top-0 h-full w-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                            {club.logoUrl ? (
                              <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Building2 size={24} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-lg font-bold text-gray-900 group-hover:text-indigo-700">{club.name}</span>
                              <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${badge.color}`}>
                                <Icon size={12} />
                                {badge.text}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                              {club.category || 'Genel Kategori'}
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              {club.status === 'APPROVED' ? 'Onaylı' : 'Beklemede'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 shadow-sm">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sağ Kolon - Keşfet */}
          <div className="lg:col-span-5 space-y-6">
             <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" />
                    Keşfet & Katıl
                  </h3>
                </div>

                {/* Arama */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Kulüp veya kategori ara..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {otherClubs.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-400 text-sm font-medium italic">Aramanızla eşleşen kulüp bulunamadı.</p>
                    </div>
                  ) : (
                    otherClubs.map((club) => (
                      <div
                        key={club.id}
                        className="group flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all"
                      >
                        <div className="min-w-0 mr-4">
                          <div className="text-sm font-bold text-gray-900 truncate">{club.name}</div>
                          <div className="text-[11px] text-gray-500 font-medium mt-0.5">{club.category || 'Genel'}</div>
                        </div>
                        <button
                          onClick={() => handleJoin(club)}
                          className="shrink-0 px-5 py-2 bg-indigo-600 text-white text-[12px] font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 group/btn"
                        >
                          Katıl
                          <PlusCircle size={14} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-gray-50">
                   <button 
                     onClick={() => navigate('/club-register')}
                     className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-200 transition-all group"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                         <PlusCircle size={20} />
                       </div>
                       <div className="text-left">
                         <div className="text-sm font-bold">Kendi Kulübünü Kur</div>
                         <div className="text-[11px] text-indigo-100">Başvuru formunu doldur</div>
                       </div>
                     </div>
                     <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

