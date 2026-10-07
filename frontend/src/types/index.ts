export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin';

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: Uppercase<UserRole>;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  userId: number;
  email: string;
  name: string;
  role: Uppercase<UserRole>;
}

export interface StudentData {
  id: number;
  user: {
    id: number;
    email: string;
    name: string;
  };
  className: string;
  enrollment: string;
  cpf?: string;
  phone?: string;
  address?: string;
}

export interface Grade {
  id: number;
  subject: string;
  period: string;
  value: number;
  weight: number;
  status: 'APPROVED' | 'FAILED' | 'RECOVERING';
}

export interface Teacher {
  id: number;
  user: {
    id: number;
    email: string;
    name: string;
  };
  subject: string;
  classes: string[];
}