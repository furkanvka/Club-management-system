import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Info,
  ArrowRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await authService.register({ email, password });
      alert('Kaydınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err) {
      setError('Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-indigo-200 ring-4 ring-white">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Yeni Hesap</h1>
          <p className="text-gray-500 mt-2 font-medium">Öğrenci topluluğuna katılın</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-indigo-600"></div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-center gap-3">
              <Info size={18} className="shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}
          
          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-2">
             <button onClick={() => navigate('/login')} className="flex-1 py-3 text-center text-gray-500 hover:text-gray-900 font-bold text-sm transition-all rounded-xl">Giriş Yap</button>
             <button className="flex-1 py-3 text-center bg-white text-indigo-600 shadow-sm font-bold text-sm rounded-xl transition-all">Kayıt Ol</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Mail size={14} className="text-indigo-500" /> E-posta Adresi (.edu.tr)
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
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Lock size={14} className="text-indigo-500" /> Şifre
              </label>
              <input 
                type="password"
                placeholder="••••••••" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-500" /> Şifre Tekrar
              </label>
              <input 
                type="password"
                placeholder="••••••••" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className={`w-full py-4 rounded-2xl text-base font-black shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : (
                <>
                  Hesabımı Oluştur
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4 pt-6 text-center border-t border-gray-50">
            <p className="text-sm text-gray-400 font-bold">
              Zaten hesabınız var mı? <span onClick={() => navigate('/login')} className="text-indigo-600 hover:underline cursor-pointer">Giriş Yapın</span>
            </p>
            
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
