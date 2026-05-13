import api from './api';

export const chatBotService = {
  async sendMessage(message, userRole = 'student') {
    const response = await api.post('/chatbot/message', {
      message,
      role: userRole
    });
    return response.data;
  },

  async getQuickStats(userId) {
    const response = await api.get(`/chatbot/quick-stats/${userId}`);
    return response.data;
  }
};