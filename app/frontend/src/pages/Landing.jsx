import React from 'react';
import { Link } from 'react-router-dom';
import { W, ImgBox } from '../components/ui';

export default function Landing() {
  const clubs = [
    {name:"IEEE Ogrenci Kolu",   cat:"Teknik",    members:124, open:true},
    {name:"Fotografi Kulubu",    cat:"Sanat",     members:87,  open:true},
    {name:"Girisimcilik Kulubu", cat:"Is Dunyasi",members:203, open:false},
    {name:"Satranc Kulubu",      cat:"Spor",      members:56,  open:true},
    {name:"Muzik Toplulugu",     cat:"Sanat",     members:145, open:false},
    {name:"Yapay Zeka Kulubu",   cat:"Teknik",    members:98,  open:true},
  ];

  return (
    <div className={W.page}>
      <header className="border-b border-gray-300 px-8 py-3 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-800 rounded"/>
          <span className="text-sm font-bold text-gray-800 tracking-tight">KulupYonet</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/register" className={W.btn}>Kulubunuzu Kaydedin</Link>
          <Link to="/login" className={W.btnFill}>Giris Yap</Link>
        </div>
      </header>
      
      <div className="border-b border-gray-200 px-8 py-14 text-center bg-gray-50">
        <div className="text-gray-400 uppercase tracking-widest mb-3" style={{fontSize:"9px"}}>— Universite Kulup Platformu —</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Kulubu Yonet. Odaklan.</h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">Etkinlik, gorev, belge ve finans yonetimini tek cercevede birlestiren platform.</p>
        <div className="flex justify-center gap-2">
          <Link to="/login" className={W.btnFill}>Giris Yap</Link>
          <Link to="/register" className={W.btn}>Kulubunuzu Kaydedin</Link>
        </div>
      </div>
      
      <div className="px-8 py-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-800">Kayitli Kulupler</h2>
          <input placeholder="Ara..." className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-400 w-48 outline-none focus:border-gray-500" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {clubs.map((c,i) => (
            <div key={i} className="border border-gray-300 rounded p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-3">
                <ImgBox w="w-10" h="h-10"/>
                <span className={`${W.tag}`} style={{fontSize:"10px"}}>{c.open ? "Acik" : "Kapali"}</span>
              </div>
              <div className="text-sm font-semibold text-gray-800 mb-0.5">{c.name}</div>
              <div className="text-xs text-gray-400 mb-3">{c.cat}</div>
              <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
                <span className="text-gray-400" style={{fontSize:"10px"}}>{c.members} uye</span>
                <span className="text-gray-500 hover:text-gray-800 transition-colors" style={{fontSize:"10px"}}>Detay &gt;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <footer className="border-t border-gray-200 px-8 py-4 text-center text-gray-400" style={{fontSize:"10px"}}>
        KulupYonet · Universite Kulup Yonetim Sistemi
      </footer>
    </div>
  );
}
