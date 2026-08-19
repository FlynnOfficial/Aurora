const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (email: string, password: string, name: string, role: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });
    return response.json();
  },

  changePassword: async (userId: number, oldPassword: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, oldPassword, newPassword }),
    });
    return response.json();
  },

  // Student endpoints
  getStudentProfile: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/students/${userId}`);
    return response.json();
  },

  getStudentGrades: async (studentId: number) => {
    const response = await fetch(`${API_BASE_URL}/grades/student/${studentId}`);
    return response.json();
  },

  getStudentAverage: async (studentId: number) => {
    const response = await fetch(`${API_BASE_URL}/grades/student/${studentId}/average`);
    return response.json();
  },

  // Teacher endpoints
  getTeacherProfile: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/teachers/${userId}`);
    return response.json();
  },

  // Admin endpoints
  getPendingRegistrations: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/registrations/pending`);
    return response.json();
  },

  approveRegistration: async (registrationId: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/registrations/${registrationId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  rejectRegistration: async (registrationId: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/registrations/${registrationId}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
};