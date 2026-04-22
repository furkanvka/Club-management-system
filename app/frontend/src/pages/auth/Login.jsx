import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/common/Button';
import { 
  Building2, 
  ArrowLeft, 
  Mail, 
  Lock, 
  UserCircle, 
  Info,
  ChevronRight,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
      if (email === 'admin@admin.com') {
        navigate('/admin');
      } else {
        navigate('/select-club');
      }
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-indigo-200 ring-4 ring-white">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">KulüpYönet</h1>
          <p className="text-gray-500 mt-2 font-medium">Öğrenci hesabınıza giriş yapın</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600"></div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-center gap-3">
              <Info size={18} className="shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}
          
          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-2">
             <button className="flex-1 py-3 text-center bg-white text-indigo-600 shadow-sm font-bold text-sm rounded-xl transition-all">Giriş Yap</button>
             <button onClick={() => navigate('/register')} className="flex-1 py-3 text-center text-gray-500 hover:text-gray-900 font-bold text-sm transition-all rounded-xl">Kayıt Ol</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Mail size={14} className="text-indigo-500" /> E-posta Adresi
              </label>
              <input 
                type="email"
                placeholder="ornek@universite.edu.tr" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Lock size={14} className="text-indigo-500" /> Şifre
                </label>
                <button type="button" className="text-[11px] font-bold text-indigo-600 hover:underline">Şifremi Unuttum</button>
              </div>
              <input 
                type="password"
                placeholder="••••••••" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="remember" className="text-xs font-bold text-gray-500 cursor-pointer">Beni Hatırla</label>
            </div>

            <Button 
              type="submit" 
              className={`w-full py-4 rounded-2xl text-base font-black shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
              disabled={loading}
            >
              {loading ? 'Giriş Yapılıyor...' : (
                <>
                  Hesabıma Gir
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4 pt-6 text-center border-t border-gray-50">
            <button 
              onClick={() => navigate('/club-login')} 
              className="w-full py-3 border-2 border-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <Building2 size={16} className="text-indigo-500" />
              Kulüp Yönetici Girişi
              <ChevronRight size={14} />
            </button>
            
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
