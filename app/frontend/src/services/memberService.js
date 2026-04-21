import api from './api';

export const memberService = {
  getMembers: async (clubId) => {
    const response = await api.get(`/clubs/${clubId}/members`);
    return response.data;
  },
  
  addMember: async (clubId, memberData) => {
    const response = await api.post(`/clubs/${clubId}/members`, memberData);
    return response.data;
  },

  removeMember: async (clubId, memberId) => {
    await api.delete(`/clubs/${clubId}/members/${memberId}`);
  }
};
