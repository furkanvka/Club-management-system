import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

import { useClub } from '../../store/ClubContext';
import api from '../../services/api';

export const ClubLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { clubLogin } = useAuth();
  const { selectClub } = useClub();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await clubLogin({ email, password });
      // Fetch the club data for this contact email and set it as active
      try {
        const res = await api.get('/clubs/my');
        if (res.data?.length > 0) {
          selectClub(res.data[0], 'baskan');
        }
      } catch (e) {}
      navigate('/dashboard');
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
            KY
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Kulüp Yönetici Girişi</h1>
          <p className="text-sm text-gray-500 mt-2">Kulübünüzü yönetmek için giriş yapın</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5 relative">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">{error}</div>}
          
          <div className="flex border-b border-gray-200 mb-4">
             <button className="flex-1 py-2 text-center text-indigo-600 border-b-2 border-indigo-600 font-medium">Giriş Yap</button>
             <button onClick={() => navigate('/club-register')} className="flex-1 py-2 text-center text-gray-500 hover:text-gray-700 font-medium">Yeni Kulüp Kur</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-posta Adresi"
              type="email"
              placeholder="kulup@universite.edu.tr"
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
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
              </label>
              <span className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-800 font-medium">Şifremi unuttum</span>
            </div>
            <Button type="submit" className="w-full py-2.5">Giriş Yap</Button>
          </form>
          <div className="border-t border-gray-100 pt-5 text-center flex flex-col gap-2">
            <p className="text-sm text-gray-500">
              <span onClick={() => navigate('/')} className="text-gray-500 font-medium hover:text-gray-800 cursor-pointer">&larr; Ana Sayfaya Dön</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
