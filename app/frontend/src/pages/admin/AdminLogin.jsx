import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/common/Button';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Info,
  ArrowRight,
  Database
} from 'lucide-react';

export const AdminLogin = () => {
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

    // Sadece admin@admin.com giriş yapabilsin
    if (email !== 'admin@admin.com') {
      setError('Bu sayfa sadece sistem yöneticileri içindir.');
      setLoading(false);
      return;
    }

    try {
      const user = await login({ email, password });
      if (user && user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        setError('Yetkisiz erişim. Lütfen admin bilgilerini kontrol edin.');
      }
    } catch (err) {
      setError('Giriş başarısız. Şifrenizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-red-200 ring-4 ring-white">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sistem Admin</h1>
          <p className="text-gray-500 mt-2 font-medium">Sistem yönetici paneline giriş yapın</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-red-600 to-red-800"></div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-center gap-3">
              <Info size={18} className="shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Mail size={14} className="text-red-500" /> Admin E-posta
              </label>
              <input 
                type="email"
                placeholder="admin@admin.com" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white outline-none transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Lock size={14} className="text-red-500" /> Şifre
                </label>
              </div>
              <input 
                type="password"
                placeholder="••••••••" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white outline-none transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className={`w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl text-base font-black shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
              disabled={loading}
            >
              {loading ? 'Bağlanıyor...' : (
                <>
                  Sisteme Giriş Yap
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4 pt-6 text-center border-t border-gray-50">
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Geri Dön
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Database size={12}/> V.1.0.4</span>
            <span>Secure System Access</span>
        </div>
      </div>
    </div>
  );
};
