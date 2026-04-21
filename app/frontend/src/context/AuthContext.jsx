import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Optional: Fetch user profile using the token here if an endpoint exists
      // e.g. api.get('/auth/me').then(res => setUser(res.data)).catch(() => logout())
      // For now, we will assume token presence means logged in.
      setUser({ authenticated: true });
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      setToken(response.data.accessToken);
      return true;
    }
    return false;
  };

  const register = async (email, password) => {
    await api.post('/auth/register', { email, password });
    return login(email, password);
  };

  const logout = () => {
    setToken(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
