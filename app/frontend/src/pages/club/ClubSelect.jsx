import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClub } from '../../store/ClubContext';
import { clubService } from '../../services/clubService';
import api from '../../services/api';

export const ClubSelect = () => {
  const { myClubs, allClubs, selectClub, refreshClubs } = useClub();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    api.get('/clubs/my-memberships').then(r => setMemberships(r.data)).catch(() => {});
  }, [myClubs]);

  const getRoleForClub = (clubId) => {
    const m = memberships.find(m => m.club?.id === clubId);
    return m?.role || 'uye';
  };

  const handleSelect = (club) => {
    const role = getRoleForClub(club.id);
    selectClub(club, role);
    navigate('/dashboard');
  };

  const handleJoin = async (club) => {
    const pwd = prompt(`"${club.name}" kulübüne katılmak için kulüp şifresini girin:`);
    if (pwd === null) return;
    try {
      await clubService.joinClub(club.id, pwd);
      alert('Kulübe başarıyla katıldınız!');
      refreshClubs();
    } catch (err) {
      const msg = err.response?.data || err.message;
      alert('Katılırken hata oluştu: ' + msg);
    }
  };

  const otherClubs = allClubs.filter(c => !myClubs.find(mc => mc.id === c.id));

  const roleLabel = (clubId) => {
    const role = getRoleForClub(clubId);
    if (role === 'baskan') return { text: 'Başkan', color: 'bg-purple-100 text-purple-700' };
    return { text: 'Üye', color: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-lg mb-4 text-2xl font-bold">KY</div>
          <h1 className="text-3xl font-extrabold text-gray-900">Kulüp Seçimi</h1>
          <p className="text-sm text-gray-500 mt-2">Devam etmek istediğiniz kulübü seçin.</p>
        </div>

        {/* Üyesi Olduğum Kulüpler */}
        <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
            Üyesi Olduğum Kulüpler
          </h2>
          <div className="space-y-3">
            {myClubs.length === 0 ? (
              <p className="text-gray-400 text-center py-6 italic">Henüz bir kulübe üye değilsiniz.</p>
            ) : (
              myClubs.map((club) => {
                const badge = roleLabel(club.id);
                return (
                  <button
                    key={club.id}
                    onClick={() => handleSelect(club)}
                    className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-gray-900 group-hover:text-indigo-700">{club.name}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>{badge.text}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">{club.category || 'Kategori Yok'}</div>
                    </div>
                    <div className="text-gray-400 group-hover:text-indigo-600 text-xl">→</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Diğer Kulüpler */}
        {otherClubs.length > 0 && (
          <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              Keşfet & Katıl
            </h2>
            <div className="space-y-3">
              {otherClubs.map((club) => (
                <div
                  key={club.id}
                  className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4"
                >
                  <div>
                    <div className="text-base font-semibold text-gray-900">{club.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{club.category || 'Kategori Yok'}</div>
                  </div>
                  <button
                    onClick={() => handleJoin(club)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                  >
                    Katıl
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yeni Kulüp */}
        <div className="text-center pt-2">
          <p className="text-gray-500 text-sm mb-3">Aradığınız kulübü bulamadınız mı?</p>
          <button
            onClick={() => navigate('/club-register')}
            className="px-6 py-2.5 bg-white border-2 border-indigo-500 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition"
          >
            + Yeni Kulüp Başvurusu Yap
          </button>
        </div>
      </div>
    </div>
  );
};
