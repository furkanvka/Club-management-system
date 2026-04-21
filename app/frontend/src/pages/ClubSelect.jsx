import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClubSelect() {
  const navigate = useNavigate();

  // Simulated fetched clubs for the logged-in user
  const userClubs = [
    {id: 1, name: "IEEE Ogrenci Kolu", role: "baskan"},
    {id: 2, name: "Yapay Zeka Kulubu", role: "uye"}
  ];

  const handleSelect = (clubId, role) => {
    // In a real app, you might save this to Context/LocalStorage
    // and fetch the specific club data. For now, navigate.
    navigate(`/dashboard?club=${clubId}&role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-mono">
      <div className="w-full max-w-xs">
        <div className="text-center mb-6">
          <h1 className="text-base font-bold text-gray-800">Kulup Sec</h1>
          <p className="text-xs text-gray-400 mt-1">Devam etmek istediginiz kulubu secin.</p>
        </div>
        <div className="space-y-2">
          {userClubs.map((c,i) => (
            <button key={i} onClick={() => handleSelect(c.id, c.role)} 
              className="w-full text-left border border-gray-300 rounded p-4 bg-white hover:bg-gray-50 hover:border-gray-500 transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">{c.name}</div>
                  <div className="text-gray-400 mt-0.5" style={{fontSize:"10px"}}>{c.role === 'baskan' ? 'Kulup Baskani' : 'Uye'}</div>
                </div>
                <span className="text-gray-400 text-xs">&gt;</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
