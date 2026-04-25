import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { 
  Database, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Info,
  Loader2,
  Calendar
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const AdminDashboard = () => {
  const [pendingClubs, setPendingClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPendingClubs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/clubs/pending');
      setPendingClubs(response.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/');
    } else {
      fetchPendingClubs();
    }
  }, [user, navigate]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/clubs/${id}/approve`);
      alert('Kulüp başarıyla onaylandı!');
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
    <div className="min-h-screen bg-gray-50 p-8 font-sans selection:bg-red-100">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sistem Denetimi</h1>
              <p className="text-gray-500 font-medium">Merkezi yönetim ve kulüp başvuru kontrolü</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleBackup} icon={Database}>
              SİSTEM YEDEĞİ
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} icon={ArrowLeft}>
              ANA SAYFA
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} />
              Bekleyen Kulüp Başvuruları
            </h2>
            <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
              {pendingClubs.length} TALEP
            </span>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                <p className="text-sm font-medium text-gray-500">Başvurular yükleniyor...</p>
             </div>
          ) : pendingClubs.length === 0 ? (
            <Card className="p-20 text-center border-dashed">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <CheckCircle size={32} />
               </div>
               <p className="text-gray-400 font-bold">Bekleyen herhangi bir kulüp başvurusu bulunmuyor.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingClubs.map(club => (
                <Card key={club.id} noPadding className="group hover:border-red-200 transition-all duration-300">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-xl">
                          {club.name[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">{club.name}</h3>
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{club.category}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                         <div className="flex items-start gap-2 mb-2">
                            <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-600 leading-relaxed italic">"{club.description || 'Açıklama belirtilmemiş.'}"</p>
                         </div>
                         <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(club.createdAt).toLocaleDateString('tr-TR')}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>E-posta: {club.contactEmail || 'Belirtilmemiş'}</span>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3 shrink-0">
                      <Button 
                        variant="danger" 
                        size="md"
                        onClick={() => handleReject(club.id)}
                        className="flex-1 md:w-32 bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                        icon={XCircle}
                      >
                        REDDET
                      </Button>
                      <Button 
                        variant="primary" 
                        size="md"
                        onClick={() => handleApprove(club.id)}
                        className="flex-1 md:w-32 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 border-emerald-600"
                        icon={CheckCircle}
                      >
                        ONAYLA
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-200">
           <div className="flex items-center gap-4">
              <span>SYSTEM STATUS: OK</span>
              <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
              <span>ADMIN PANEL V.1.0.4</span>
           </div>
           <p>© {new Date().getFullYear()} ClubMS PLATFORM SERVICES</p>
        </div>
      </div>
    </div>
  );
};
