import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { 
  Building2, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const ClubLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { clubLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await clubLogin({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 selection:bg-indigo-100">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <div 
            className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto mb-6 flex items-center justify-center text-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kulüp Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Kulübünüzü yönetmek için giriş yapın</p>
        </div>

        <Card className="shadow-xl shadow-indigo-900/5">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}
          
          <div className="flex bg-gray-100/50 p-1 rounded-xl mb-8">
             <button className="flex-1 py-2 text-center bg-white text-indigo-600 shadow-sm font-bold text-xs rounded-lg transition-all">Giriş Yap</button>
             <button onClick={() => navigate('/club-register')} className="flex-1 py-2 text-center text-gray-500 hover:text-gray-900 font-bold text-xs transition-all rounded-lg">Başvuru Yap</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="E-posta Adresi"
              type="email"
              placeholder="kulup@unv.edu.tr" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="space-y-1">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-sm font-bold text-gray-700">Şifre</label>
                <button type="button" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Şifremi Unuttum
                </button>
              </div>
              <Input 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              loading={loading}
              className="w-full py-2.5 rounded-xl font-bold"
              icon={ArrowRight}
            >
              Yönetici Paneline Gir
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
            <button 
              onClick={() => navigate('/login')} 
              className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
            >
              <Building2 size={14} className="text-gray-400" />
              Öğrenci Girişine Geç
            </button>
            
            <button 
              onClick={() => navigate('/')} 
              className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors py-2"
            >
              <ArrowLeft size={14} />
              Ana Sayfaya Dön
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
