import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { 
  KeyRound, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = email, 2 = new password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ email, newPassword, newPasswordConfirm });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Şifre sıfırlama başarısız. Lütfen bilgilerinizi kontrol edin.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 selection:bg-indigo-100">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg shadow-emerald-200 animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Şifre Güncellendi!</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.
            </p>
          </div>

          <Card className="shadow-xl shadow-emerald-900/5">
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ArrowRight size={16} />
                Giriş Sayfasına Git
              </button>
              <button
                onClick={() => navigate('/club-login')}
                className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
              >
                Kulüp Girişine Git
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 selection:bg-indigo-100">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <div 
            className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto mb-6 flex items-center justify-center text-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Şifremi Unuttum</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {step === 1 
              ? 'Hesabınıza kayıtlı e-posta adresinizi girin' 
              : 'Yeni şifrenizi belirleyin'}
          </p>
        </div>

        <Card className="shadow-xl shadow-indigo-900/5">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-500' : 'bg-gray-200'}`} />
          </div>

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <Input 
                label="E-posta Adresi"
                type="email"
                placeholder="ornek@universite.edu.tr" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />
              
              <Button 
                type="submit" 
                className="w-full py-2.5 rounded-xl font-bold"
                icon={ArrowRight}
              >
                Devam Et
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              {/* Show selected email */}
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2">
                <Mail size={14} className="text-indigo-500 shrink-0" />
                <span className="text-xs font-bold text-indigo-700 truncate">{email}</span>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="ml-auto text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors shrink-0"
                >
                  DEĞİŞTİR
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Lock size={14} className="text-gray-400" /> Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="En az 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Lock size={14} className="text-gray-400" /> Yeni Şifre (Tekrar)
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Şifrenizi tekrar girin"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    required
                    minLength={6}
                    className={`w-full px-3 py-2 pr-10 text-sm bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium ${
                      newPasswordConfirm && newPassword !== newPasswordConfirm 
                        ? 'border-red-300 focus:border-red-500' 
                        : newPasswordConfirm && newPassword === newPasswordConfirm 
                          ? 'border-emerald-300 focus:border-emerald-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPasswordConfirm && newPassword === newPasswordConfirm && (
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 size={12} /> Şifreler eşleşiyor
                  </p>
                )}
                {newPasswordConfirm && newPassword !== newPasswordConfirm && (
                  <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> Şifreler eşleşmiyor
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                loading={loading}
                className="w-full py-2.5 rounded-xl font-bold"
                icon={KeyRound}
              >
                Şifremi Güncelle
              </Button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
            <button 
              onClick={() => navigate('/login')} 
              className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors py-2"
            >
              <ArrowLeft size={14} />
              Giriş Sayfasına Dön
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
