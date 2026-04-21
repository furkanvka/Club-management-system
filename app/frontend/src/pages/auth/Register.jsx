import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    
    try {
      await authService.register({ email, password });
      navigate('/login');
    } catch (err) {
      setError('Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
            KY
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Öğrenci Kaydı</h1>
          <p className="text-sm text-gray-500 mt-2">Yeni bir hesap oluşturun</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">{error}</div>}
          
          <div className="flex border-b border-gray-200 mb-4">
             <button onClick={() => navigate('/login')} className="flex-1 py-2 text-center text-gray-500 hover:text-gray-700 font-medium">Giriş Yap</button>
             <button className="flex-1 py-2 text-center text-indigo-600 border-b-2 border-indigo-600 font-medium">Kayıt Ol</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="E-posta Adresi (.edu.tr uzantılı)" 
              type="email" 
              placeholder="ornek@universite.edu.tr" 
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
            <Input 
              label="Şifre Tekrar" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full py-2.5 mt-2">Öğrenci Olarak Kayıt Ol</Button>
          </form>
          <div className="border-t border-gray-100 pt-5 text-center flex flex-col gap-2">
            <p className="text-sm text-gray-500">
              Zaten hesabınız var mı? <span onClick={() => navigate('/login')} className="text-indigo-600 font-medium hover:text-indigo-800 cursor-pointer">Giriş Yap</span>
            </p>
            <p className="text-sm text-gray-500">
              <span onClick={() => navigate('/')} className="text-gray-500 font-medium hover:text-gray-800 cursor-pointer">&larr; Ana Sayfaya Dön</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
