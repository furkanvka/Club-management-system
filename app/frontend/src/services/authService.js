import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      const isAdmin = credentials.email === 'admin@admin.com';
      localStorage.setItem('loginType', isAdmin ? 'admin' : 'user');
    }
    return response.data;
  },

  clubLogin: async (credentials) => {
    const response = await api.post('/auth/club-login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('loginType', 'club');
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginType');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const loginType = localStorage.getItem('loginType') || 'user';
      return { ...payload, loginType };
    } catch (e) {
      return null;
    }
  }
};
