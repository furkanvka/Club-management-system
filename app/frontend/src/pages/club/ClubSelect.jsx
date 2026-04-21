import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClub } from '../../store/ClubContext';
import { clubService } from '../../services/clubService';

export const ClubSelect = () => {
  const { myClubs, allClubs, selectClub, refreshClubs } = useClub();
  const navigate = useNavigate();
  const handleSelect = (club) => {
    selectClub(club);
    navigate('/dashboard');
  };

  const handleJoin = async (clubId) => {
    try {
      await clubService.joinClub(clubId);
      alert('Kulübe katılım talebiniz alındı (veya doğrudan katıldınız).');
      refreshClubs();
    } catch (err) {
      alert('Katılırken hata oluştu.');
    }
  };

  const otherClubs = allClubs.filter(c => !myClubs.find(mc => mc.id === c.id));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Kulüp Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-2">Devam etmek istediğiniz kulübü seçin veya yeni birine katılın.</p>
        </div>

        {/* Üyesi Olduğum Kulüpler */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Üyesi Olduğum Kulüpler</h2>
          <div className="space-y-3">
            {myClubs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz bir kulübe üye değilsiniz.</p>
            ) : (
              myClubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => handleSelect(club)}
                  className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="text-base font-semibold text-gray-900 group-hover:text-indigo-600">{club.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{club.category || 'Kategori Yok'}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-indigo-600">
                    →
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Diğer Kulüpler */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Keşfet & Katıl</h2>
          <div className="space-y-3">
            {otherClubs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Şu an katılabileceğiniz yeni bir kulüp yok.</p>
            ) : (
              otherClubs.map((club) => (
                <div
                  key={club.id}
                  className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div>
                    <div className="text-base font-semibold text-gray-900">{club.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{club.category || 'Kategori Yok'}</div>
                  </div>
                  <button 
                    onClick={() => handleJoin(club.id)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                  >
                    Katıl
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Yeni Kulüp Oluştur */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600 mb-3">Aradığınız kulübü bulamadınız mı?</p>
          <button 
            onClick={() => navigate('/club-register')}
            className="px-6 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition"
          >
            Yeni Kulüp Başvurusu Yap
          </button>
        </div>

      </div>
    </div>
  );
};
