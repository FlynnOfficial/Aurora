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

// Helper functions for localStorage-based auth
function findUserByEmail(email: string) {
  // Check super admins FIRST (highest priority)
  const superAdmins = JSON.parse(localStorage.getItem('super_admins') || '[]');
  const superAdmin = superAdmins.find((a: any) => a.email?.toLowerCase() === email.toLowerCase());
  if (superAdmin) return { ...superAdmin, userType: 'SUPER_ADMIN' };

  // Check admins
  const admins = JSON.parse(localStorage.getItem('admins') || '[]');
  const admin = admins.find((a: any) => a.email?.toLowerCase() === email.toLowerCase());
  if (admin) return { ...admin, userType: 'ADMIN' };

  // Check teachers
  const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
  const teacher = teachers.find((t: any) => t.email?.toLowerCase() === email.toLowerCase());
  if (teacher) return { ...teacher, userType: 'TEACHER' };

  // Check students
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const student = students.find((s: any) => s.email?.toLowerCase() === email.toLowerCase());
  if (student) return { ...student, userType: 'STUDENT' };

  return null;
}

function loginLocal(email: string, password: string) {
  const user = findUserByEmail(email);
  console.log('DEBUG - Trying to login:', { email, password, foundUser: user });
  if (!user || user.password !== password) {
    console.log('DEBUG - Login failed. User found:', !!user, 'Password match:', user?.password === password);
    throw new Error('E-mail ou senha incorretos');
  }

  const token = btoa(`${email}:${password}`);
  return {
    accessToken: token,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.userType,
  };
}

export const api = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    try {
      return await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      // Fallback to localStorage
      return loginLocal(email, password);
    }
  },

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
