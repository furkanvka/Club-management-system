import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { 
  ArrowLeft, 
  AlertCircle,
  ArrowRight,
  UserPlus
} from 'lucide-react';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
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
      await authService.register({ 
        email, 
        password, 
        firstName, 
        lastName, 
        studentNumber 
      });
      alert('Kaydınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 selection:bg-indigo-100">
      <div className="w-full max-w-[480px] space-y-8">
        <div className="text-center">
          <div 
            className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto mb-6 flex items-center justify-center text-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Yeni Hesap Oluştur</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Öğrenci topluluğuna katılın</p>
        </div>

        <Card className="shadow-xl shadow-indigo-900/5">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}
          
          <div className="flex bg-gray-100/50 p-1 rounded-xl mb-8">
             <button onClick={() => navigate('/login')} className="flex-1 py-2 text-center text-gray-500 hover:text-gray-900 font-bold text-xs transition-all rounded-lg">Giriş Yap</button>
             <button className="flex-1 py-2 text-center bg-white text-indigo-600 shadow-sm font-bold text-xs rounded-lg transition-all">Kayıt Ol</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Ad"
                placeholder="Ahmet" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input 
                label="Soyad"
                placeholder="Yılmaz" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input 
              label="Öğrenci Numarası"
              placeholder="202101001" 
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              required
            />

            <Input 
              label="E-posta Adresi (.edu.tr)"
              type="email"
              placeholder="ornek@universite.edu.tr" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Şifre"
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input 
                label="Şifre Tekrar"
                type="password"
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              loading={loading}
              className="w-full py-2.5 rounded-xl font-bold"
              icon={ArrowRight}
            >
              Hesabımı Oluştur
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center space-y-4">
            <p className="text-xs text-gray-500 font-medium">
              Zaten hesabınız var mı? <span onClick={() => navigate('/login')} className="text-indigo-600 font-bold hover:text-indigo-700 cursor-pointer">Giriş Yapın</span>
            </p>
            
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
