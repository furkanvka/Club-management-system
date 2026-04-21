import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClub } from '../../store/ClubContext';

export const ClubSelect = () => {
  const { clubs, selectClub } = useClub();
  const navigate = useNavigate();

  const handleSelect = (id) => {
    selectClub(id);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kulüp Seçimi</h1>
          <p className="text-sm text-gray-500 mt-2">Devam etmek istediğiniz kulübü seçin.</p>
        </div>
        <div className="space-y-3">
          {clubs.length === 0 ? (
            <div className="text-center p-8 bg-white border border-gray-200 rounded-xl">
              <p className="text-gray-500">Üyesi olduğunuz kulüp bulunamadı.</p>
            </div>
          ) : (
            clubs.map((club) => (
              <button
                key={club.id}
                onClick={() => handleSelect(club.id)}
                className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{club.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{club.category || 'Kategori Yok'}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    →
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
