import api from './api';

// Safe JWT decode for UTF-8 characters
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      const payload = parseJwt(response.data.accessToken);
      const isAdmin = payload?.role === 'ROLE_ADMIN';
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

  resetPassword: async ({ email, newPassword, newPasswordConfirm }) => {
    const response = await api.post('/auth/reset-password', { email, newPassword, newPasswordConfirm });
    return response.data;
  },

  changePassword: async ({ currentPassword, newPassword, newPasswordConfirm }) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword, newPasswordConfirm });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginType');
    localStorage.removeItem('activeClub');
    localStorage.removeItem('activeRole');
    localStorage.removeItem('activeMembershipId');
    localStorage.removeItem('activeMembershipStatus');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = parseJwt(token);
    if (!payload) return null;
    const loginType = localStorage.getItem('loginType') || 'user';
    return { ...payload, loginType };
  }
};

