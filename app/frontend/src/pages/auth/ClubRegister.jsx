import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../store/AuthContext';

export const ClubRegister = () => {
  const { clubLogin } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [university, setUniversity] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [clubPassword, setClubPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create the club without needing to be logged in (since POST /api/clubs is public)
      await api.post('/clubs', {
        name,
        category,
        description: `Üniversite: ${university}, İletişim: ${contactEmail}`,
        contactEmail: contactEmail,
        password: clubPassword,
        isOpen: true
      });
      
      // Log them in to the new club account
      await clubLogin({ email: contactEmail, password: clubPassword });
      
      alert('Kulüp başvuru talebiniz alındı. Yönetici onayından sonra tam yetki alacaksınız.');
      navigate('/dashboard'); // Go directly to dashboard
    } catch (err) {
      console.error("Club Registration Error: ", err);
      setError('Başvuru gönderilirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
            KY
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Kulüp Kaydı</h1>
          <p className="text-sm text-gray-500 mt-2">Yeni bir kulüp başvurusunda bulunun</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">{error}</div>}
          
          <div className="flex border-b border-gray-200 mb-4">
             <button onClick={() => navigate('/club-login')} className="flex-1 py-2 text-center text-gray-500 hover:text-gray-700 font-medium">Giriş Yap</button>
             <button className="flex-1 py-2 text-center text-indigo-600 border-b-2 border-indigo-600 font-medium">Yeni Kulüp Kur</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input 
                label="Kulüp Adı" 
                placeholder="Örn: IEEE Öğrenci Kolu" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input 
                label="Kategori" 
                placeholder="Örn: Teknik, Spor" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <Input 
              label="Üniversite / Kurum" 
              placeholder="Üniversitenizin adını girin" 
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input 
                label="İletişim E-posta Adresi" 
                type="email" 
                placeholder="kulup@universite.edu.tr" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
              <Input 
                label="Kulüp Şifresi (Giriş İçin)" 
                type="password" 
                placeholder="Üyeler için şifre belirleyin" 
                value={clubPassword}
                onChange={(e) => setClubPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">Kulüp Tüzüğü (PDF/DOCX)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>Dosya Yükle</span>
                    </span>
                    <p className="pl-1">veya sürükle bırak</p>
                  </div>
                  <p className="text-xs text-gray-500">10MB'a kadar PDF veya DOCX</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full py-2.5 mt-2">Başvuruyu Gönder</Button>
          </form>
          <div className="border-t border-gray-100 pt-5 text-center">
            <p className="text-sm text-gray-500">
              <span onClick={() => navigate('/')} className="text-gray-500 font-medium hover:text-gray-800 cursor-pointer">&larr; Ana Sayfaya Dön</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
