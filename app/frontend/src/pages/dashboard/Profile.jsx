import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { 
  User, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  Save, 
  Camera, 
  CheckCircle2, 
  Shield, 
  Star, 
  Crown, 
  UserCheck, 
  Hash, 
  Mail,
  Loader2,
  Building2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const Profile = () => {
  const { activeClub, activeRole, activeMembershipStatus } = useClub();
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    studentNumber: '',
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
        if (r.data) {
          setProfile(r.data);
        } else {
          setProfile(prev => ({
            ...prev,
            fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
            studentNumber: user?.studentNumber || ''
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeClub, user]);

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

  const roleDisplay = (role) => {
    const normalized = (role || '').toUpperCase().replace('-', '_');
    switch (normalized) {
      case 'KULUP_BASKANI':
      case 'BASKAN':
        return { label: 'Kulüp Başkanı', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: Crown };
      case 'EKIP_LIDERI':
        return { label: 'Ekip Lideri', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Star };
      case 'EKIP_UYESI':
        return { label: 'Ekip Üyesi', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: Shield };
      default:
        return { label: 'Kulüp Üyesi', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: UserCheck };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Profil yükleniyor...</p>
      </div>
    );
  }

  const rd = roleDisplay(activeRole);
  const RoleIcon = rd.icon;
  const initial = user?.firstName?.[0] || profile.fullName?.[0] || user?.email?.[0].toUpperCase();
  const displayName = profile.fullName || (user?.firstName ? `${user.firstName} ${user.lastName}` : 'İsimsiz Üye');
  const displayStudentNumber = profile.studentNumber || user?.studentNumber || '—';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="pb-6 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profil Bilgilerim</h1>
        <p className="text-gray-500 font-medium mt-1">
          {activeClub?.name} bünyesindeki üyelik profiliniz
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary Sidebar */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-100 overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : initial}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-indigo-600 hover:scale-110 transition-all">
                <Camera size={16} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 truncate w-full">{displayName}</h2>
            <div className="space-y-1 mt-2">
              <p className="text-xs font-medium text-gray-400 flex items-center justify-center gap-1.5">
                <Mail size={12} /> {user?.email}
              </p>
              <p className="text-xs font-bold text-indigo-600 flex items-center justify-center gap-1.5">
                <Hash size={12} /> NO: {displayStudentNumber}
              </p>
            </div>

            <div className="mt-8 w-full border-t border-gray-50 pt-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wider">Yetki</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border ${rd.color}`}>
                  <RoleIcon size={12} /> {rd.label.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wider">Durum</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold border ${
                  activeMembershipStatus === 'active' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {activeMembershipStatus === 'active' ? 'AKTİF' : 'PASİF'}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Hesap Özeti">
             <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                   <div>
                      <p className="text-sm font-bold text-gray-800 leading-none">Üyelik Kaydı</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-tight">Doğrulandı</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                   <div>
                      <p className="text-sm font-bold text-gray-800 leading-none">Hesap Tipi</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-tight">Üniversite Öğrencisi</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                   <div>
                      <p className="text-sm font-bold text-gray-800 leading-none">Aktif Kulüp</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-tight truncate max-w-[160px]">{activeClub?.name}</p>
                   </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="p-8">
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Ad Soyad"
                    value={profile.fullName}
                    onChange={e => setProfile({...profile, fullName: e.target.value})}
                    placeholder="Ali Yılmaz" 
                    icon={User}
                  />
                  <Input 
                    label="Öğrenci Numarası"
                    value={profile.studentNumber}
                    onChange={e => setProfile({...profile, studentNumber: e.target.value})}
                    placeholder="202101001" 
                    icon={Hash}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Telefon Numarası"
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="05xx ..." 
                    icon={Phone}
                  />
                  <Input 
                    label="Bölüm / Fakülte"
                    value={profile.department}
                    onChange={e => setProfile({...profile, department: e.target.value})}
                    placeholder="Bilgisayar Mühendisliği" 
                    icon={BookOpen}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <GraduationCap size={14} className="text-gray-400" /> Sınıf
                    </label>
                    <select 
                      value={profile.classYear}
                      onChange={e => setProfile({...profile, classYear: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    >
                      <option value="">Seçiniz...</option>
                      {[1,2,3,4,5,6].map(y => <option key={y} value={y}>{y}. Sınıf</option>)}
                      <option value="99">Mezun</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sistem E-postası</p>
                      <p className="text-sm font-bold text-gray-700">{user?.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">DEĞİŞTİRİLEMEZ</span>
                </div>

                <div className="pt-4 flex items-center gap-6 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    loading={saving}
                    className="px-10 py-2.5 rounded-xl font-bold"
                    icon={Save}
                  >
                    Profilimi Güncelle
                  </Button>
                  
                  {success && (
                    <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
                      <CheckCircle2 size={20} />
                      <span className="text-xs font-bold uppercase tracking-wider">Güncellendi</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
