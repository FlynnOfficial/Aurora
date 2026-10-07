export interface MultipleChoiceQuestion {
  type: 'multiple_choice';
  id: string;
  statement: string;
  options: { id: string; text: string }[];
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
  questions: Question[];
}