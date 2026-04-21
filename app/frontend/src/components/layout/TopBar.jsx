import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm shrink-0">
      <div className="text-sm text-gray-500 font-medium">Dashboard</div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">{user?.email || 'User'}</span>
        <button 
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900 font-medium transition"
        >
          Çıkış
        </button>
      </div>
    </header>
  );
};
