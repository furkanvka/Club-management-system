import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NAV_CONFIG = {
  uye: [
    { label: "Profilim",    items: ["Profil Goruntule", "Profil Duzenle"] },
    { label: "Etkinlikler", items: ["Duyurular", "Basvurularim"] },
    { label: "Belgeler",    items: ["Genel Belgeler"] },
  ],
  "ekip-uyesi": [
    { label: "Profilim",    items: ["Profil Goruntule", "Profil Duzenle"] },
    { label: "Gorevlerim",  items: ["Atanan Gorevler", "Durum Guncelle"] },
    { label: "Projem",      items: ["Proje Detaylari"] },
    { label: "Etkinlikler", items: ["Duyurular", "Basvurularim"] },
    { label: "Belgeler",    items: ["Proje Belgeleri", "Belge Yukle"] },
  ],
  "ekip-lideri": [
    { label: "Profilim",         items: ["Profil Goruntule", "Profil Duzenle"] },
    { label: "Ekibim",           items: ["Uye Listesi", "Uye Bilgileri"] },
    { label: "Proje & Gorevler", items: ["Proje Olustur", "Proje Detaylari", "Gorev Atama", "Gorev Ozeti"] },
    { label: "Etkinlikler",      items: ["Duyurular", "Etkinlik Detaylari", "Basvurular"] },
    { label: "Belgeler",         items: ["Yetkili Belgeler", "Belge Onay"] },
    { label: "Toplantilar",      items: ["Toplanti Raporu", "Organizasyon"] },
  ],
  baskan: [
    { label: "Profilim",          items: ["Profil Goruntule", "Profil Duzenle"] },
    { label: "Uye Yonetimi",      items: ["Uye Listesi", "Uye Gecmisi"] },
    { label: "Ekip & Lider",      items: ["Ekip Tanimla", "Lider Ata", "Flag Yonetimi"] },
    { label: "Etkinlik Yonetimi", items: ["Etkinlik Olustur", "Takvim", "Gecmis Etkinlikler"] },
    { label: "Finans",            items: ["Gelir/Gider Kaydi", "Fis Yukleme", "Finans Raporu"], flag: "F" },
    { label: "Belgeler",          items: ["Tum Belgeler", "Belge Onay", "Yedekleme"], flag: "D" },
    { label: "Sistem",            items: ["Yedekleme Periyodu"] },
  ],
  sayman: [
    { label: "Profilim",          items: ["Profil Goruntule", "Profil Duzenle"] },
    { label: "Uye Yonetimi",      items: ["Uye Listesi", "Uye Gecmisi"] },
    { label: "Ekip & Lider",      items: ["Ekip Tanimla", "Lider Ata", "Flag Yonetimi"] },
    { label: "Etkinlik Yonetimi", items: ["Etkinlik Olustur", "Takvim", "Gecmis Etkinlikler"] },
    { label: "Finans",            items: ["Gelir/Gider Kaydi", "Fis Yukleme", "Finans Raporu"], flag: "F" },
    { label: "Sistem",            items: ["Yedekleme Periyodu"] },
  ],
  sekreter: [
    { label: "Profilim",          items: ["Profil Goruntule", "Profil Duzenle"] },
    { label: "Uye Yonetimi",      items: ["Uye Listesi", "Uye Gecmisi"] },
    { label: "Ekip & Lider",      items: ["Ekip Tanimla", "Lider Ata", "Flag Yonetimi"] },
    { label: "Etkinlik Yonetimi", items: ["Etkinlik Olustur", "Takvim", "Gecmis Etkinlikler"] },
    { label: "Belgeler",          items: ["Tum Belgeler", "Belge Onay", "Yedekleme"], flag: "D" },
    { label: "Sistem",            items: ["Yedekleme Periyodu"] },
  ],
};

const ROLE_LABEL = {
  uye: "Uye", "ekip-uyesi": "Ekip Uyesi", "ekip-lideri": "Ekip Lideri",
  baskan: "Kulup Baskani", sayman: "Sayman", sekreter: "Sekreter",
};

const ROLE_FLAGS = {
  baskan: ["Yonetici","Finans","Docs"],
  sayman: ["Yonetici","Finans"],
  sekreter: ["Yonetici","Docs"],
};

function Sidebar({ role, active, onSelect }) {
  const nav = NAV_CONFIG[role] || [];
  const [open, setOpen] = useState(() => Object.fromEntries(nav.map(s => [s.label, true])));
  return (
    <aside className="w-48 border-r border-gray-300 bg-gray-50 flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-gray-300">
        <div className="text-gray-400 uppercase tracking-widest mb-0.5" style={{fontSize:"9px"}}>Kulup</div>
        <div className="text-xs font-semibold text-gray-700 truncate">IEEE Ogrenci Kolu</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {nav.map(section => (
          <div key={section.label} className="mb-0.5">
            <button onClick={() => setOpen(p => ({...p, [section.label]: !p[section.label]}))}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-200">
              <span className="flex items-center gap-1.5 font-bold text-gray-500 uppercase tracking-widest" style={{fontSize:"9px"}}>
                {section.label}
                {section.flag && <span className="border border-gray-400 rounded px-1 font-bold text-gray-500" style={{fontSize:"8px"}}>{section.flag}</span>}
              </span>
              <span className="text-gray-400" style={{fontSize:"9px"}}>{open[section.label] ? "v" : ">"}</span>
            </button>
            {open[section.label] && (
              <div className="mb-1">
                {section.items.map(item => (
                  <button key={item} onClick={() => onSelect(item)}
                    className={`w-full text-left px-4 py-1.5 text-xs transition ${active === item ? "bg-gray-800 text-white font-medium" : "text-gray-600 hover:bg-gray-200"}`}>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="border-t border-gray-300 px-3 py-2.5 flex items-center gap-2">
        <div className="w-6 h-6 border border-gray-400 rounded-full bg-gray-200 shrink-0 flex items-center justify-center font-bold text-gray-500" style={{fontSize:"9px"}}>A</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-700 truncate">Kullanici</div>
          <div className="text-gray-400" style={{fontSize:"9px"}}>{ROLE_LABEL[role]}</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, section, role }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const flags = ROLE_FLAGS[role] || [];
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="border-b border-gray-300 bg-white px-5 py-3 flex items-center justify-between shrink-0">
      <div>
        <div className="text-gray-400 mb-0.5" style={{fontSize:"10px"}}>{section} / {title}</div>
        <div className="text-sm font-semibold text-gray-800">{title}</div>
      </div>
      <div className="flex items-center gap-2">
        {flags.map(f => (
          <span key={f} className="border border-gray-400 rounded px-2 py-0.5 font-bold text-gray-500 uppercase tracking-wide" style={{fontSize:"9px"}}>{f}</span>
        ))}
        <div className="w-6 h-6 border border-gray-300 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500" style={{fontSize:"9px"}}>A</div>
        <span onClick={handleLogout} className="text-gray-400 cursor-pointer hover:text-gray-700" style={{fontSize:"10px"}}>Cikis</span>
      </div>
    </div>
  );
}

export default function DashboardLayout({ role, children }) {
  const nav = NAV_CONFIG[role] || [];
  const [active, setActive] = useState(nav[0]?.items[0]);
  const getSection = () => { for (const s of nav) if (s.items.includes(active)) return s.label; return ""; };
  
  return (
    <div className="flex bg-white font-mono h-screen">
      <Sidebar role={role} active={active} onSelect={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={active} section={getSection()} role={role}/>
        <main className="flex-1 overflow-y-auto p-5 bg-white">
          {children({ active, role })}
        </main>
      </div>
    </div>
  );
}
