import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Database } from 'lucide-react';

export const AdminDashboard = () => {
  const [pendingClubs, setPendingClubs] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPendingClubs = async () => {
    try {
      const response = await api.get('/admin/clubs/pending');
      setPendingClubs(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // If not admin, redirect.
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/');
    } else {
      fetchPendingClubs();
    }
  }, [user, navigate]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/clubs/${id}/approve`);
      alert('Kulüp onaylandı!');
      fetchPendingClubs();
    } catch (err) {
      alert('Onaylama sırasında hata oluştu.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) return;
    try {
      await api.put(`/admin/clubs/${id}/reject`);
      alert('Kulüp başvurusu reddedildi.');
      fetchPendingClubs();
    } catch (err) {
      alert('Reddetme sırasında hata oluştu.');
    }
  };

  const handleBackup = async () => {
    try {
      const res = await api.get('/admin/backup/download');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `clubms_backup_${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err) {
      alert('Yedek alınırken hata oluştu.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistem Yönetimi (Admin)</h1>
            <p className="text-gray-500 mt-2">Onay bekleyen kulüp başvurularını buradan yönetebilirsiniz.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBackup}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition font-semibold"
            >
              <Database size={18} /> Sistem Yedeği Al
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 font-semibold"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Bekleyen Başvurular ({pendingClubs.length})</h2>
          </div>

          {pendingClubs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Şu an onay bekleyen herhangi bir başvuru bulunmuyor.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingClubs.map(club => (
                <div key={club.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{club.name}</h3>
                    <p className="text-sm text-indigo-600 font-medium mb-2">{club.category}</p>
                    <p className="text-sm text-gray-600">{club.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Başvuru Tarihi: {new Date(club.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => handleReject(club.id)}
                      className="px-4 py-2 border-2 border-red-500 text-red-600 font-medium rounded-lg hover:bg-red-50 transition"
                    >
                      Reddet
                    </button>
                    <button
                      onClick={() => handleApprove(club.id)}
                      className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
                    >
                      Onayla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
