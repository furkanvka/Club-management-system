import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { User, Phone, BookOpen, GraduationCap, Save, Camera, Clock, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const { activeClub } = useClub();
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    department: '',
    classYear: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!activeClub?.id) return;
    setLoading(true);
    api.get(`/clubs/${activeClub.id}/members/me/profile`)
      .then(r => {
        if (r.data) setProfile(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeClub]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.post(`/clubs/${activeClub.id}/members/me/profile`, profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profil Bilgilerim</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">{activeClub?.name} bünyesindeki üyelik profiliniz</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-indigo-200 overflow-hidden">
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : profile.fullName?.[0] || user?.email?.[0].toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-white border border-gray-100 rounded-2xl shadow-lg text-indigo-600 hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight">{profile.fullName || 'İsimsiz Üye'}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{user?.email}</p>
            
            <div className="mt-8 w-full space-y-2">
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Durum</span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">Aktif</span>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg shadow-gray-200/40">
             <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 mb-4">
                <Clock size={16} className="text-indigo-500" /> Üyelik Geçmişi
             </h3>
             <div className="space-y-4">
                <div className="border-l-2 border-indigo-100 pl-4 relative">
                   <div className="absolute w-2 h-2 rounded-full bg-indigo-500 -left-[5px] top-1"></div>
                   <p className="text-xs font-black text-gray-800">Topluluğa Katıldı</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ocak 2024</p>
                </div>
                <div className="border-l-2 border-indigo-100 pl-4 relative opacity-50">
                   <div className="absolute w-2 h-2 rounded-full bg-gray-300 -left-[5px] top-1"></div>
                   <p className="text-xs font-bold text-gray-500">Etkinlik Katılımı (Yakında)</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 ml-1 flex items-center gap-2">
                  <User size={14} className="text-indigo-500" /> Ad Soyad
                </label>
                <input 
                  value={profile.fullName}
                  onChange={e => setProfile({...profile, fullName: e.target.value})}
                  placeholder="Ali Yılmaz" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 ml-1 flex items-center gap-2">
                  <Phone size={14} className="text-indigo-500" /> Telefon
                </label>
                <input 
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  placeholder="05xx ..." 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 ml-1 flex items-center gap-2">
                  <BookOpen size={14} className="text-indigo-500" /> Bölüm
                </label>
                <input 
                  value={profile.department}
                  onChange={e => setProfile({...profile, department: e.target.value})}
                  placeholder="Bilgisayar Mühendisliği" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 ml-1 flex items-center gap-2">
                  <GraduationCap size={14} className="text-indigo-500" /> Sınıf
                </label>
                <select 
                  value={profile.classYear}
                  onChange={e => setProfile({...profile, classYear: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-semibold"
                >
                  <option value="">Seçiniz</option>
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>{y}. Sınıf</option>)}
                  <option value="99">Mezun</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button 
                type="submit" 
                disabled={saving}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-base font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
              >
                {saving ? 'Kaydediliyor...' : (
                  <>
                    <Save size={18} /> Değişiklikleri Kaydet
                  </>
                )}
              </button>
              
              {success && (
                <div className="flex items-center gap-2 text-emerald-500 animate-in slide-in-from-left-2 duration-300">
                  <CheckCircle2 size={24} />
                  <span className="text-xs font-black uppercase tracking-widest">Başarılı</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
