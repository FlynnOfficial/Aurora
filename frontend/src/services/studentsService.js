import api from './api';

export const studentsService = {
  async getAll(filters = {}) {
    const response = await api.get('/students', { params: filters });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async create(studentData) {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  async update(id, studentData) {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/students/${id}`);
  },

  async getGrades(id, period) {
    const response = await api.get(`/students/${id}/grades`, { 
      params: { period } 
    });
    return response.data;
  },

  async getAttendance(id, startDate, endDate) {
    const response = await api.get(`/students/${id}/attendance`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};