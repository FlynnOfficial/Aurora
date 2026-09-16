import { LoginResponse } from '../types';

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
  login: (email: string, password: string) => request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  register: (email: string, password: string, name: string, organizationKey: string) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, organizationKey }),
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

  getTeacherActivities: () => request('/activities/teacher'),
  getTeacherOverview: () => request('/activities/teacher/overview'),

  createActivity: (activity: unknown) => request('/activities', {
    method: 'POST',
    body: JSON.stringify(activity),
  }),

  getActivitySubmissions: (activityId: number) => request(`/activities/${activityId}/submissions`),

  gradeSubmission: (submissionId: number, grade: unknown) => request(`/activities/submissions/${submissionId}/grade`, {
    method: 'PUT',
    body: JSON.stringify(grade),
  }),

  getStudentActivities: () => request('/activities/student'),

  submitActivity: (activityId: number, answers: unknown[]) => request(`/activities/${activityId}/submit`, {
    method: 'POST',
    body: JSON.stringify(answers),
  }),

  // Admin endpoints
  getPendingRegistrations: () => request('/admin/registrations/pending'),

  getRegistrations: () => request('/admin/registrations'),

  approveRegistration: (registrationId: number) => request(`/admin/registrations/${registrationId}/approve`, { method: 'PUT' }),

  rejectRegistration: (registrationId: number) => request(`/admin/registrations/${registrationId}/reject`, { method: 'PUT' }),
  getAdminUsers: () => request('/admin/users'),
  deactivateUser: (userId: number) => request(`/admin/users/${userId}`, { method: 'DELETE' }),
  createAdminUser: (input: unknown) => request('/admin/users', { method: 'POST', body: JSON.stringify(input) }),
  getClasses: () => request('/admin/classes'),
  createClass: (name: string, schoolYear: number) => request('/admin/classes', { method: 'POST', body: JSON.stringify({ name, schoolYear }) }),
  deleteClass: (id: number) => request(`/admin/classes/${id}`, { method: 'DELETE' }),
  getSubjects: () => request('/admin/subjects'),
  createSubject: (name: string) => request('/admin/subjects', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteSubject: (id: number) => request(`/admin/subjects/${id}`, { method: 'DELETE' }),

  // Support endpoints
  getSupportChats: () => request('/support/chats'),
  createSupportChat: (content: string) => request('/support/chats', {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
  sendSupportMessage: (chatId: number, content: string) => request(`/support/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
  closeSupportChat: (chatId: number) => request(`/support/chats/${chatId}/close`, { method: 'PUT' }),
};
