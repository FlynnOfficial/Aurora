import api from './api';

export const teachersService = {
  async getAll(filters = {}) {
    const response = await api.get('/teachers', { params: filters });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  async create(teacherData) {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  },

  async update(id, teacherData) {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/teachers/${id}`);
  },

  async getSchedule(id, period) {
    const response = await api.get(`/teachers/${id}/schedule`, {
      params: { period }
    });
    return response.data;
  }
};