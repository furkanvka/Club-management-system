import api from './api';

export const clubService = {
  getAllClubs: async () => {
    const response = await api.get('/clubs');
    return response.data;
  },
  
  getClubById: async (id) => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },

  createClub: async (clubData) => {
    const response = await api.post('/clubs', clubData);
    return response.data;
  },

  getMyClubs: async () => {
    const response = await api.get('/clubs/my');
    return response.data;
  },

  joinClub: async (clubId) => {
    const response = await api.post(`/clubs/${clubId}/members`);
    return response.data;
  }
};
