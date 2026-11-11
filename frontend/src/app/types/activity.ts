export interface MultipleChoiceQuestion {
  type: 'multiple_choice';
  id: string;
  statement: string;
  options: { id: string; text: string }[];
  correctAnswer?: string | null;
}

export interface EssayQuestion {
  type: 'essay';
  id: string;
  statement: string;
  placeholder?: string;
}

export type Question = MultipleChoiceQuestion | EssayQuestion;

export interface Activity {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  submission?: Submission | null;
  questions: Question[];
}

export interface ApiQuestion {
  id: number;
  position: number;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
  prompt: string;
  points: number;
  options: string | null;
  correctAnswer?: string | null;
}

export interface Answer {
  questionId: number;
  answer: string | null;
  score: number | null;
  teacherFeedback: string | null;
}

export interface Submission {
  id: number;
  status: 'SUBMITTED' | 'GRADED';
  studentName: string;
  studentId: number;
  submittedAt: string;
  totalScore: number | null;
  answers?: Answer[];
}

export interface ApiActivity {
  id: number;
  title: string;
  subject: string;
  className: string;
  teacherName: string;
  description: string | null;
  dueDate: string;
  submission: Submission | null;
  questions: ApiQuestion[];
}

export interface ActivityWithSubmissions extends ApiActivity {
  submissions: Submission[];
}

export interface TeacherOverview {
  students: { id: number; name: string; enrollment: string; className: string }[];
  activities: ActivityWithSubmissions[];
}

export function parseOptions(value: string | null | undefined): { id: string; text: string }[] {
  if (!value) return [];
  try {
    const options: unknown = JSON.parse(value);
    if (!Array.isArray(options)) return [];
    return options.filter((option): option is { id: string; text: string } =>
      option != null && typeof option.id === 'string' && typeof option.text === 'string');
  } catch {
    return [];
  }
}