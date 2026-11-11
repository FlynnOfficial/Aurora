import type { Grade, LoginResponse, StudentData } from '../types';
import type { ApiActivity, TeacherOverview } from '../app/types/activity';
import type { AdminUser, Registration, SchoolClass, Subject, TeacherProfile } from '../app/types/school';
import type { Chat, ChatContact, ChatMessage, MessageDraft } from '../app/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

let refreshInFlight: Promise<unknown> | undefined;

function refreshSession() {
  refreshInFlight ??= request('/auth/refresh-token', { method: 'POST' }, false)
    .catch((error: unknown) => {
      window.dispatchEvent(new Event('aurora:session-expired'));
      throw error;
    })
    .finally(() => { refreshInFlight = undefined; });
  return refreshInFlight;
}

async function request<T>(path: string, init: RequestInit = {}, retryOnUnauthorized = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: 'include' });
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 && retryOnUnauthorized && (path === '/auth/me' || !path.startsWith('/auth/'))) {
      await refreshSession();
      return request<T>(path, init, false);
    }
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

  getCurrentUser: () => request<LoginResponse>('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }, false),

  register: (email: string, password: string, name: string, organizationKey: string) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, organizationKey }),
    }),

  changePassword: (oldPassword: string, newPassword: string) => request('/auth/change-password', {
      method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
    }),

  // Student endpoints
  getStudentProfile: (userId: number) => request<StudentData>(`/students/${userId}`),

  getStudentGrades: (studentId: number) => request<Grade[]>(`/grades/student/${studentId}`),

  getStudentAverage: (studentId: number) => request(`/grades/student/${studentId}/average`),

  // Teacher endpoints
  getTeacherProfile: (userId: number) => request<TeacherProfile>(`/teachers/${userId}`),

  getTeacherActivities: () => request<ApiActivity[]>('/activities/teacher'),
  getTeacherOverview: () => request<TeacherOverview>('/activities/teacher/overview'),

  createActivity: (activity: unknown) => request('/activities', {
    method: 'POST',
    body: JSON.stringify(activity),
  }),

  getActivitySubmissions: (activityId: number) => request(`/activities/${activityId}/submissions`),

  gradeSubmission: (submissionId: number, grade: unknown) => request(`/activities/submissions/${submissionId}/grade`, {
    method: 'PUT',
    body: JSON.stringify(grade),
  }),

  getStudentActivities: () => request<ApiActivity[]>('/activities/student'),

  submitActivity: (activityId: number, answers: unknown[]) => request(`/activities/${activityId}/submit`, {
    method: 'POST',
    body: JSON.stringify(answers),
  }),

  // Admin endpoints
  getPendingRegistrations: () => request('/admin/registrations/pending'),

  getRegistrations: () => request<Registration[]>('/admin/registrations'),

  approveRegistration: (registrationId: number) => request(`/admin/registrations/${registrationId}/approve`, { method: 'PUT' }),

  rejectRegistration: (registrationId: number) => request(`/admin/registrations/${registrationId}/reject`, { method: 'PUT' }),
  getAdminUsers: () => request<AdminUser[]>('/admin/users'),
  deactivateUser: (userId: number) => request(`/admin/users/${userId}`, { method: 'DELETE' }),
  createAdminUser: (input: unknown) => request<AdminUser>('/admin/users', { method: 'POST', body: JSON.stringify(input) }),
  getClasses: () => request<SchoolClass[]>('/admin/classes'),
  createClass: (name: string, schoolYear: number) => request<SchoolClass>('/admin/classes', { method: 'POST', body: JSON.stringify({ name, schoolYear }) }),
  deleteClass: (id: number) => request(`/admin/classes/${id}`, { method: 'DELETE' }),
  getSubjects: () => request<Subject[]>('/admin/subjects'),
  createSubject: (name: string) => request<Subject>('/admin/subjects', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteSubject: (id: number) => request(`/admin/subjects/${id}`, { method: 'DELETE' }),

  getSupportChats: (signal?: AbortSignal) => request<Chat[]>('/support/chats', { signal }),
  getChatContacts: (signal?: AbortSignal) => request<ChatContact[]>('/support/contacts', { signal }),
  getChatMessages: (chatId: number, afterId: number, signal: AbortSignal) =>
    request<ChatMessage[]>(`/support/chats/${chatId}/messages?afterId=${afterId}`, { signal }),
  createSupportChat: (draft: MessageDraft) => request<Chat>('/support/chats', {
    method: 'POST', body: JSON.stringify(draft),
  }),
  startDirectChat: (contactId: number, draft: MessageDraft) => request<Chat>(`/support/direct/${contactId}`, {
    method: 'POST', body: JSON.stringify(draft),
  }),
  sendSupportMessage: (chatId: number, draft: MessageDraft) => request<ChatMessage>(`/support/chats/${chatId}/messages`, {
    method: 'POST', body: JSON.stringify(draft),
  }),
  closeSupportChat: (chatId: number) => request<Chat>(`/support/chats/${chatId}/close`, { method: 'PUT' }),
};
