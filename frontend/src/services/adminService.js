import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },

  async getContracts() {
    const response = await api.get('/admin/contracts');
    return response.data;
  },

  async getTickets() {
    const response = await api.get('/admin/tickets');
    return response.data;
  }
};