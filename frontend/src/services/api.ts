const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.error ?? `Erro HTTP ${response.status}`);
  }

  return body as T;
}

export const api = {
  // Auth endpoints
  login: (email: string, password: string) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string, role: string) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    }),

  changePassword: (userId: number, oldPassword: string, newPassword: string) => request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ userId, oldPassword, newPassword }),
    }),

  // Student endpoints
  getStudentProfile: (userId: number) => request(`/students/${userId}`),

  getStudentGrades: (studentId: number) => request(`/grades/student/${studentId}`),

  getStudentAverage: (studentId: number) => request(`/grades/student/${studentId}/average`),

  // Teacher endpoints
  getTeacherProfile: (userId: number) => request(`/teachers/${userId}`),

  // Admin endpoints
  getPendingRegistrations: () => request('/admin/registrations/pending'),

  approveRegistration: (registrationId: number) => request(`/admin/registrations/${registrationId}/approve`, { method: 'PUT' }),

  rejectRegistration: (registrationId: number) => request(`/admin/registrations/${registrationId}/reject`, { method: 'PUT' }),
};