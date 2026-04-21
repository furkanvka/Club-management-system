import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Users, Building2, LogIn } from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <header className="border-b border-gray-200 px-8 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
            KY
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">KulüpYönet</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/login')} className="flex items-center gap-2">
            <Users size={18} />
            Öğrenci
          </Button>
          <Button onClick={() => navigate('/club-login')} className="flex items-center gap-2">
            <Building2 size={18} />
            Kulüp
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Kulübünüzü Tek Bir Yerden Yönetin
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Etkinlikler, görevler, belgeler ve finans yönetimini tek bir platformda birleştirin.
              Üyelerinizle etkileşimi artırın ve kulübünüzü bir adım öteye taşıyın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
            <div 
              onClick={() => navigate('/login')}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-500 hover:shadow-md transition cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Öğrenci Portalı</h3>
              <p className="text-base text-gray-500 text-center">Öğrenci olarak giriş yapın veya yeni kayıt oluşturarak üniversitenizdeki kulüpleri keşfedin.</p>
            </div>

            <div 
              onClick={() => navigate('/club-login')}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-500 hover:shadow-md transition cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
                <Building2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Kulüp Yönetimi</h3>
              <p className="text-base text-gray-500 text-center">Kulübünüzü yönetmek için giriş yapın veya yeni bir kulüp başvurusu oluşturun.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500 bg-white">
        &copy; {new Date().getFullYear()} KulüpYönet. Tüm hakları saklıdır.
      </footer>
    </div>
  );
};
