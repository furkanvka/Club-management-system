import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../store/AuthContext';
import { useClub } from '../../store/ClubContext';
import { 
  Building2, 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  Mail,
  Lock,
  Globe,
  Tag
} from 'lucide-react';

export const ClubRegister = () => {
  const { user, clubLogin } = useAuth();
  const { refreshClubs } = useClub();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [university, setUniversity] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [clubPassword, setClubPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Create the club
      await api.post('/clubs', {
        name,
        category,
        description: `Üniversite: ${university}, İletişim: ${contactEmail}`,
        contactEmail: contactEmail,
        password: clubPassword,
        isOpen: true
      });
      
      // If NOT logged in, log them in to the new club account
      if (!user) {
        await clubLogin({ email: contactEmail, password: clubPassword });
      } else {
        // If already logged in as a student, just refresh clubs to see the new one
        await refreshClubs();
      }
      
      alert('Kulüp başvuru talebiniz başarıyla alındı! Yönetici onayından sonra giriş yapabilirsiniz.');
      navigate('/');
    } catch (err) {
      console.error("Club Registration Error: ", err);
      setError('Başvuru gönderilirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-indigo-200 ring-4 ring-white">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Kulüp Başvurusu</h1>
          <p className="text-gray-500 mt-2 font-medium">Topluluğunuzu yönetmeye hemen başlayın</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 md:p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
              <Info size={18} className="shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}
          
          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-2">
             <button onClick={() => navigate('/club-login')} className="flex-1 py-3 text-center text-gray-500 hover:text-gray-900 font-bold text-sm transition-all rounded-xl">Giriş Yap</button>
             <button className="flex-1 py-3 text-center bg-white text-indigo-600 shadow-sm font-bold text-sm rounded-xl transition-all">Yeni Kulüp Başvurusu</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-500" /> Kulüp Adı
                </label>
                <input 
                  placeholder="Örn: Yazılım Topluluğu" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <Tag size={14} className="text-indigo-500" /> Kategori
                </label>
                <input 
                  placeholder="Örn: Teknoloji" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Globe size={14} className="text-indigo-500" /> Üniversite / Kurum
              </label>
              <input 
                placeholder="Kurumunuzun tam adını girin" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <Mail size={14} className="text-indigo-500" /> İletişim E-posta
                </label>
                <input 
                  type="email"
                  placeholder="kulup@unv.edu.tr" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <Lock size={14} className="text-indigo-500" /> Kulüp Giriş Şifresi
                </label>
                <input 
                  type="password"
                  placeholder="••••••••" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                  value={clubPassword}
                  onChange={(e) => setClubPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Kulüp Tüzüğü (Opsiyonel)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-100 border-dashed rounded-[2rem] hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                <div className="space-y-2 text-center">
                  <UploadCloud className="mx-auto h-10 w-10 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  <div className="flex text-sm text-gray-600 justify-center font-bold">
                    <span className="text-indigo-600 hover:text-indigo-500">Dosya Yükle</span>
                    <p className="pl-1 text-gray-400 font-medium">veya sürükle bırak</p>
                  </div>
                  <p className="text-xs text-gray-400">PDF, DOCX (Maks. 10MB)</p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className={`w-full py-4 rounded-2xl text-base font-black shadow-lg shadow-indigo-200 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
              disabled={loading}
            >
              {loading ? 'Başvuru Gönderiliyor...' : 'Kulüp Başvurusunu Tamamla'}
            </Button>
          </form>

          <div className="pt-6 text-center border-t border-gray-50">
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-6 text-gray-400">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
            <CheckCircle2 size={14} className="text-emerald-500" /> Güvenli Kayıt
          </div>
          <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
            <CheckCircle2 size={14} className="text-emerald-500" /> Hızlı Onay
          </div>
        </div>
      </div>
    </div>
  );
};
