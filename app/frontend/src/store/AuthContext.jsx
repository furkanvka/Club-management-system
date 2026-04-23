import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());

  const login = async (credentials) => {
    await authService.login(credentials);
    const u = authService.getCurrentUser();
    setUser(u);
    return u;
  };

  const clubLogin = async (credentials) => {
    await authService.clubLogin(credentials);
    const u = authService.getCurrentUser();
    setUser(u);
    return u;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, clubLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
