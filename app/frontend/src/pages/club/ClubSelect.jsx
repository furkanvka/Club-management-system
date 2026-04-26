import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClub } from '../../store/ClubContext';
import { clubService } from '../../services/clubService';
import { 
  Search, 
  Building2, 
  Users, 
  Sparkles, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
  Star,
  UserCheck,
  Repeat,
  Plus
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const ClubSelect = () => {
  const { myClubs, allClubs, myMemberships, selectClub, refreshClubs } = useClub();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const memberships = myMemberships || [];

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
    setLoading(true);
    try {
      await clubService.joinClub(club.id);
      alert('Kulübe başarıyla katıldınız!');
      await refreshClubs();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) alert('Zaten bu kulübün üyesisiniz.');
      else alert('Katılırken hata oluştu: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const otherClubs = (allClubs || []).filter(c => 
    !(myClubs || []).find(mc => mc.id === c.id) &&
    ((c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
     (c.category || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadge = (clubId) => {
    const role = getRoleForClub(clubId);
    const normalized = (role || '').toUpperCase();
    if (normalized === 'BASKAN' || normalized === 'KULUP_BASKANI') 
      return { text: 'Başkan', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: ShieldCheck };
    if (normalized === 'EKIP_LIDERI' || normalized === 'LIDER')
      return { text: 'Lider', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Star };
    if (normalized === 'EKIP_UYESI')
      return { text: 'Ekip Üyesi', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: UserCheck };
    return { text: 'Üye', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: User };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">ClubMS</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">Yönetim Paneli</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { logout(); navigate('/login'); }}
          className="text-gray-500 hover:text-rose-600 hover:bg-rose-50"
          icon={LogOut}
        >
          Çıkış Yap
        </Button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="mb-16 text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Kulüp Seçimi Yapın</h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Hangi kulüpte işlem yapmak istiyorsanız onu seçin veya yeni bir kulübe katılarak dünyanızı genişletin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* My Clubs Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={16} />
                Üyesi Olduğunuz Kulüpler
              </h3>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold">
                {myClubs.length} TOPLAM
              </span>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 font-medium">Kulüpler yükleniyor...</p>
              </div>
            ) : myClubs.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 border border-dashed border-gray-200 text-center space-y-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center text-gray-300">
                  <Building2 size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-gray-900">Henüz Bir Kulübe Üye Değilsiniz</h4>
                  <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
                    Sağ taraftaki listeden kulüpleri keşfedebilir veya kendi kulübünüzü kurmak için başvuruda bulunabilirsiniz.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {myClubs.map((club) => {
                  const badge = getRoleBadge(club.id);
                  const Icon = badge.icon;
                  return (
                    <button
                      key={club.id}
                      onClick={() => handleSelect(club)}
                      className="w-full text-left bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                            {club.logoUrl ? (
                              <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Building2 size={28} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{club.name}</span>
                              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
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
                        <div className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Discover Section */}
          <div className="lg:col-span-5 space-y-6">
             <Card className="shadow-lg shadow-indigo-900/5 h-fit sticky top-28">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      Keşfet & Katıl
                    </h3>
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="Kulüp veya kategori ara..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                    {otherClubs.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-xs text-gray-400 font-medium italic">Aramanızla eşleşen kulüp bulunamadı.</p>
                      </div>
                    ) : (
                      otherClubs.map((club) => (
                        <div
                          key={club.id}
                          className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all"
                        >
                          <div className="min-w-0 mr-4">
                            <div className="text-sm font-bold text-gray-900 truncate">{club.name}</div>
                            <div className="text-[11px] text-gray-400 font-medium mt-0.5">{club.category || 'Genel'}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleJoin(club)}
                            className="shrink-0 text-[11px] hover:border-indigo-600 hover:text-indigo-600"
                            icon={Plus}
                          >
                            Katıl
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
