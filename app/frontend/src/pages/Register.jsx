import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { W, Field, Select, UploadBox, Textarea } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await register(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={W.page}>
      <header className="border-b border-gray-300 px-8 py-3 flex items-center gap-4 bg-white">
        <Link to="/" className={W.btn}>&lt; Ana Sayfa</Link>
        <div className="w-px h-4 bg-gray-300"/>
        <span className="text-sm font-semibold text-gray-800">Kulup Kaydi</span>
      </header>
      
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Kulubunuzu Kaydedin</h1>
        <p className="text-xs text-gray-400 mb-6">Basvurunuz sistem yoneticisi tarafindan incelenecektir.</p>
        
        <div className="flex items-center gap-0 mb-6" style={{fontSize:"10px"}}>
          {["1  Kulup Bilgileri","2  Yetkili","3  Belge Yukleme"].map((s,i) => (
            <div key={i} className="flex items-center">
              {i > 0 && <div className="w-5 h-px bg-gray-300"/>}
              <span className={`border rounded px-2.5 py-1 ${i===0 ? "border-gray-700 text-gray-700 font-bold" : "border-gray-300 text-gray-400"}`}>{s}</span>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="border border-gray-300 rounded bg-white p-5 space-y-4">
          {error && <div className="text-red-500 text-xs">{error}</div>}
          
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kulup Adi" placeholder="Kulup Adiniz"/>
            <Select label="Kategori" options={["Teknik","Sanat","Spor","Is Dunyasi"]}/>
          </div>
          
          <Field label="Kurum / Universite" placeholder="Universite Adi"/>
          
          <div className="grid grid-cols-2 gap-3">
            <Field label="Yetkili Ad Soyad" placeholder="Ad Soyad"/>
            <Field label="Gorevi" placeholder="Gorev (Baskan vb.)"/>
          </div>
          
          <Field 
            label="Kurumsal E-posta (.edu zorunlu)" 
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
          
          <UploadBox label="Kulup Tuzugu (zorunlu)"/>
          <Textarea label="Kulup Aciklamasi" placeholder="Hakkinda kisa bilgi"/>
          
          <button type="submit" disabled={loading} className={`${W.btnFill} w-full`}>
            {loading ? 'Gonderiliyor...' : 'Basvuruyu Gonder'}
          </button>
        </form>
        
        <div className="mt-4 border border-gray-400 rounded px-4 py-3 bg-gray-50 text-gray-600" style={{fontSize:"10px"}}>
          ! Hesabiniz sistem yoneticisi onaylayana kadar pasif kalacaktir.
        </div>
      </div>
    </div>
  );
}
