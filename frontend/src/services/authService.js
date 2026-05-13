import api from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Salvar no localStorage
      localStorage.setItem('aurora_token', token);
      localStorage.setItem('aurora_user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('aurora_token', token);
      localStorage.setItem('aurora_user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao registrar');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('Erro ao carregar usuário');
    }
  },

  logout() {
    localStorage.removeItem('aurora_token');
    localStorage.removeItem('aurora_user');
    window.location.href = '/login';
  },

  getStoredUser() {
    const userStr = localStorage.getItem('aurora_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('aurora_token');
  },

  getUserRole() {
    const user = this.getStoredUser();
    return user?.role || null;
  }
};