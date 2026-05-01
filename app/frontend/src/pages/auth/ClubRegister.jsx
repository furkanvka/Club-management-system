import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../store/AuthContext';
import { useClub } from '../../store/ClubContext';
import {
  Building2,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ClubRegister = () => {
  const { user, clubLogin } = useAuth();
  const { refreshClubs } = useClub();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [university, setUniversity] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [clubPassword, setClubPassword] = useState('');
  const [statuteFile, setStatuteFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Lütfen sadece PDF dosyası yükleyin.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStatuteFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!statuteFile) {
      setError('Lütfen kulüp tüzüğünü PDF olarak yükleyin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/clubs', {
        name,
        category,
        description: `Üniversite: ${university}, İletişim: ${contactEmail}`,
        contactEmail: contactEmail,
        password: clubPassword,
        statuteFileData: statuteFile,
        isOpen: true
      });

      if (!user) {
        await clubLogin({ email: contactEmail, password: clubPassword });
      } else {
        await refreshClubs();
      }

      alert('Kulüp başvuru talebiniz başarıyla alındı! Yönetici onayından sonra giriş yapabilirsiniz.');
      navigate('/');
    } catch (err) {
      setError('Başvuru gönderilirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 selection:bg-indigo-100">
      <div className="w-full max-w-[600px] space-y-8">
        <div className="text-center">
          <div
            className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto mb-6 flex items-center justify-center text-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <Building2 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kulüp Başvurusu</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Topluluğunuzu yönetmeye hemen başlayın</p>
        </div>

        <Card className="shadow-xl shadow-indigo-900/5">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex bg-gray-100/50 p-1 rounded-xl mb-8">
            <button onClick={() => navigate('/club-login')} className="flex-1 py-2 text-center text-gray-500 hover:text-gray-900 font-bold text-xs transition-all rounded-lg">Giriş Yap</button>
            <button className="flex-1 py-2 text-center bg-white text-indigo-600 shadow-sm font-bold text-xs rounded-lg transition-all">Başvuru Yap</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Kulüp Adı"
                placeholder="Örn: Yazılım Topluluğu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Kategori"
                placeholder="Örn: Teknoloji"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <Input
              label="Üniversite / Kurum"
              placeholder="Kurumunuzun tam adını girin"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="İletişim E-posta"
                type="email"
                placeholder="kulup@unv.edu.tr"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
              <Input
                label="Giriş Şifresi"
                type="password"
                placeholder="••••••••"
                value={clubPassword}
                onChange={(e) => setClubPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Kulüp Tüzüğü (Zorunlu PDF)</label>
              <div className="relative flex justify-center px-6 py-8 border-2 border-gray-100 border-dashed rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />
                <div className="text-center">
                  <UploadCloud className={`mx-auto h-10 w-10 mb-2 ${statuteFile ? 'text-emerald-500' : 'text-gray-300'} group-hover:text-indigo-500 transition-colors`} />
                  <p className="text-xs font-bold text-indigo-600 mb-1">{statuteFile ? 'Dosya Seçildi' : 'Dosya Yükle'}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{statuteFile ? 'Tüzük başarıyla eklendi' : 'Sadece PDF (Maks. 1MB)'}</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-2.5 rounded-xl font-bold"
            >
              Kulüp Başvurusunu Tamamla
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={14} />
              Ana Sayfaya Dön
            </button>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-6 text-gray-400">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={12} className="text-emerald-500" /> Güvenli Kayıt
          </div>
          <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={12} className="text-emerald-500" /> Hızlı Onay
          </div>
        </div>
      </div>
    </div>
  );
};
