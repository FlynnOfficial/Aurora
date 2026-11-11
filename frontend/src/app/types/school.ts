import type { AuthenticatedUser, Teacher } from '../../types';

export interface Subject {
  id: number;
  name: string;
}

export interface SchoolClass {
  id: number;
  name: string;
  schoolYear: number;
}

export interface AdminUser extends AuthenticatedUser {
  className: string | null;
  enrollment: string | null;
  assignedSubject: string | null;
  assignedSubjects: string[];
  assignedClasses: string[];
  average: number | null;
  status: string | null;
  gradeCount: number;
  approvedCount: number;
  recoveringCount: number;
  failedCount: number;
}

export interface Registration {
  id: number;
  name: string;
  email: string;
  organizationKey: string;
  submittedAt: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type TeacherProfile = Teacher & { subjects?: (Subject | string)[] };
