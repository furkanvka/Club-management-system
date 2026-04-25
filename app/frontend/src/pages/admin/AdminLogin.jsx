import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle,
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 selection:bg-red-100">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <div 
            className="w-12 h-12 bg-red-600 rounded-xl mx-auto mb-6 flex items-center justify-center text-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sistem Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Merkezi denetim paneline giriş yapın</p>
        </div>

        <Card className="shadow-xl shadow-red-900/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Admin E-posta"
              type="email"
              placeholder="admin@admin.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Şifre"
              type="password"
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button 
              type="submit" 
              loading={loading}
              className="w-full py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-red-100"
              icon={ArrowRight}
            >
              Yönetim Paneline Gir
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center gap-2 text-gray-400 font-bold text-xs hover:text-gray-900 transition-colors py-2"
            >
              <ArrowLeft size={14} />
              Ana Sayfaya Dön
            </button>
          </div>
        </Card>
        
        <div className="flex justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Database size={10}/> V.1.0.4</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full mt-1.5"></span>
            <span>SECURE ACCESS</span>
        </div>
      </div>
    </div>
  );
};
