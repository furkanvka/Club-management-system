import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { W, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/club-select');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-mono">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="w-10 h-10 border-2 border-gray-800 rounded mx-auto mb-4"/>
          <h1 className="text-lg font-bold text-gray-800">KulupYonet</h1>
          <p className="text-xs text-gray-400 mt-1">Hesabiniza giris yapin</p>
        </div>
        
        <form onSubmit={handleSubmit} className="border border-gray-300 rounded bg-white p-5 space-y-4">
          {error && <div className="text-red-500 text-xs text-center">{error}</div>}
          
          <Field 
            label="Kullanici Adi / E-posta" 
            placeholder="ornek@edu.tr" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field 
            label="Sifre" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="text-gray-400 cursor-pointer hover:text-gray-600" style={{fontSize:"10px"}}>
            Sifremi unuttum
          </div>
          
          <button type="submit" disabled={loading} className={`${W.btnFill} w-full`}>
            {loading ? 'Giris Yapiliyor...' : 'Giris Yap'}
          </button>
          
          <div className="border-t border-gray-200 pt-3">
            <p className="text-gray-400 text-center" style={{fontSize:"10px"}}>
              Hesabiniz yok mu? <Link to="/register" className="text-gray-700 underline cursor-pointer">Bir kulube basvurun</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
