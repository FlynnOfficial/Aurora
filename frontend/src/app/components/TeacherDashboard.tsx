import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  LogOut,
  Users,
  BookOpen,
  LayoutDashboard,
  PlusCircle,
  ClipboardCheck,
  Trash2,
  Plus,
  CheckCircle,
  ArrowLeft,
  KeyRound,
  FileText,
  Eye,
  Calendar,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { mockTeachers, Activity, Question } from '../data/mockData';
import { api } from '../../services/api';

interface TeacherDashboardProps {
  user: any;
  onLogout: () => void;
}

type Page = 'dashboard' | 'create' | 'grade' | 'myActivities';

// ── Types for activity creation ───────────────────────────────────────────────

interface DraftQuestion {
  id: string;
  type: 'multiple_choice' | 'essay';
  statement: string;
  options: { id: string; text: string }[];
  placeholder: string;
  correctAnswer?: string; // for multiple choice: option id, for essay: free text
  points: number;
}

const OPTION_LETTERS = ['a', 'b', 'c', 'd', 'e'];

function newQuestion(type: 'multiple_choice' | 'essay'): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    type,
    statement: '',
    options:
      type === 'multiple_choice'
        ? OPTION_LETTERS.slice(0, 4).map((id) => ({ id, text: '' }))
        : [],
    placeholder: '',
    points: 1,
  };
}

function parseOptions(options: unknown): { id: string; text: string }[] {
  if (typeof options !== 'string' || !options.trim()) return [];
  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function automaticScore(question: any, answer: any): number | null {
  if (question?.type !== 'MULTIPLE_CHOICE' || !question.correctAnswer) return null;
  return answer.answer === question.correctAnswer ? Number(question.points ?? 0) : 0;
}

// ── View Activities page ──────────────────────────────────────────────────────

function MyActivitiesPage({ teacher }: { teacher: any }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [teacherActivities, setTeacherActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(teacher.subjects?.[0] ?? teacher.subject ?? '');

  useEffect(() => {
    api.getTeacherActivities()
      .then((items: any[]) => setTeacherActivities(items.map((activity) => ({
        ...activity,
        teacher: activity.teacherName,
        dueDate: activity.dueDate,
        status: activity.submission?.status?.toLowerCase() ?? 'pending',
        questions: (activity.questions ?? []).map((question: any) => ({
            ...question,
          statement: question.prompt,
          type: question.type.toLowerCase(),
          points: Number(question.points),
            options: parseOptions(question.options),
        })),
      }))))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Erro ao carregar atividades'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-16 text-center text-gray-400">Carregando atividades...</div>;
  if (error) return <div className="py-16 text-center text-red-500">{error}</div>;

  if (teacherActivities.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Minhas Atividades</h2>
          <p className="text-sm text-gray-500">Visualize todas as atividades que você criou</p>
        </div>
        <div className="text-center py-16 text-gray-400">
          <FileText className="size-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Você ainda não criou nenhuma atividade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Minhas Atividades</h2>
        <p className="text-sm text-gray-500">Você criou {teacherActivities.length} atividade(s)</p>
      </div>

      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
        <SelectTrigger className="w-56"><SelectValue placeholder="Filtrar por matéria" /></SelectTrigger>
        <SelectContent>{(teacher.subjects ?? [teacher.subject]).filter(Boolean).map((subject: string) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}</SelectContent>
      </Select>

      <div className="space-y-3">
        {teacherActivities.filter((activity) => !selectedSubject || activity.subject === selectedSubject).map((activity) => {
          const isExpanded = expandedId === activity.id;
          const statusColor =
            activity.status === 'pending'
              ? 'bg-gray-100 border-gray-200'
              : activity.status === 'submitted'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-green-50 border-green-200';

          const statusBadge =
            activity.status === 'pending'
              ? 'bg-gray-500'
              : activity.status === 'submitted'
              ? 'bg-blue-500'
              : 'bg-green-500';

          return (
            <Card key={activity.id} className={`border transition-all ${statusColor}`}>
              <div
                onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                className="p-4 cursor-pointer hover:bg-white/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{activity.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <Calendar className="size-3.5" />
                      Entrega: {new Date(activity.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.questions.length} questão(ões)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={`text-white ${statusBadge}`}>
                      {activity.status === 'pending'
                        ? 'Aguardando'
                        : activity.status === 'submitted'
                        ? 'Entregue'
                        : 'Corrigida'}
                    </Badge>
                    <Eye className="size-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-white p-4 space-y-4">
                  {activity.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Descrição:</p>
                      <p className="text-sm text-gray-700">{activity.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Questões:</p>
                    <div className="space-y-3">
                      {activity.questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <p className="text-xs font-semibold text-indigo-600 mb-1">
                            Questão {idx + 1} — {q.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa'}
                          </p>
                          <p className="text-sm text-gray-700 mb-2">{q.statement}</p>

                          {q.type === 'multiple_choice' && (
                            <div className="space-y-1.5 mb-2">
                              <p className="text-xs text-gray-600">Alternativas:</p>
                              {q.options.map((opt) => (
                                <div key={opt.id} className="flex items-start gap-2 text-xs">
                                  <span className="font-semibold text-gray-500 uppercase">
                                    {opt.id}.
                                  </span>
                                  <span className="text-gray-700">{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === 'multiple_choice' && 'correctAnswer' in q && q.correctAnswer && (
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                              <p className="text-xs font-semibold text-green-700">
                                ✓ Resposta Correta: Alternativa {q.correctAnswer.toUpperCase()}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Create Activity page ──────────────────────────────────────────────────────

function CreateActivityPage({ teacher }: { teacher: any }) {
  const [selectedClass, setSelectedClass] = useState(teacher.classes?.[0] ?? '');
  const [selectedSubject, setSelectedSubject] = useState(teacher.subjects?.[0] ?? teacher.subject ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion('multiple_choice')]);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState('');

  const minDueDate = new Date();
  minDueDate.setDate(minDueDate.getDate() + 1);
  const maxDueDate = new Date();
  maxDueDate.setFullYear(maxDueDate.getFullYear() + 1);
  const formatDate = (value: Date) => value.toISOString().slice(0, 10);

  const addQuestion = (type: 'multiple_choice' | 'essay') => {
    setQuestions((prev) => [...prev, newQuestion(type)]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const updateOption = (qid: string, optId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid
          ? { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)) }
          : q
      )
    );
  };

  const addOption = (qid: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qid) return q;
        const nextLetter = OPTION_LETTERS[q.options.length] ?? String.fromCharCode(97 + q.options.length);
        return { ...q, options: [...q.options, { id: nextLetter, text: '' }] };
      })
    );
  };

  const removeOption = (qid: string, optId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, options: q.options.filter((o) => o.id !== optId) } : q
      )
    );
  };

  const handleSave = async () => {
    if (submitting || !title.trim() || !dueDate || questions.length === 0) return;
    const selected = new Date(`${dueDate}T23:59:59`);
    const tomorrow = new Date(); tomorrow.setHours(23, 59, 59, 999); tomorrow.setDate(tomorrow.getDate() + 1);
    const limit = new Date(); limit.setFullYear(limit.getFullYear() + 1);
    if (selected < tomorrow || selected > limit) { setSaveError('Escolha uma data entre amanhã e um ano a partir de hoje.'); return; }
    setSubmitting(true);
    setSaveError('');
    try {
      await api.createActivity({ title: title.trim(), subject: selectedSubject, className: selectedClass, description: description.trim(), dueDate: selected.toISOString(), questions: questions.map((q) => ({ type: q.type === 'essay' ? 'ESSAY' : 'MULTIPLE_CHOICE', prompt: q.statement, points: q.points, correctAnswer: q.correctAnswer, options: JSON.stringify(q.options) })) });
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível publicar a atividade.');
    } finally { setSubmitting(false); }
  };

  const handleNew = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setQuestions([newQuestion('multiple_choice')]);
    setSaved(false);
  };

  if (saved) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Criar Atividade</h2>
          <p className="text-sm text-gray-500">Nova atividade para {selectedClass}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center gap-3 text-center">
          <CheckCircle className="size-10 text-green-500" />
          <p className="font-medium text-green-800">Atividade publicada com sucesso!</p>
          <p className="text-sm text-green-700">
            "{title}" foi enviada para a turma <strong>{selectedClass}</strong>.
          </p>
          <Button onClick={handleNew} className="mt-2 bg-indigo-600 hover:bg-indigo-700">
            Criar outra atividade
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Criar Atividade</h2>
        <p className="text-sm text-gray-500">Monte a atividade e publique para uma turma</p>
      </div>

      {/* Meta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Matéria</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger><SelectValue placeholder="Selecione a matéria" /></SelectTrigger>
                <SelectContent>{(teacher.subjects ?? [teacher.subject]).filter(Boolean).map((subject: string) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Turma</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teacher.classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due">Data de entrega</Label>
              <Input
                id="due"
                type="date"
                value={dueDate}
                min={formatDate(minDueDate)}
                max={formatDate(maxDueDate)}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <div className="flex gap-2">
              <Input
                id="title"
                placeholder="Ex: Prova Bimestral — Funções"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Descrição / instrução (opcional)</Label>
            <Textarea
              id="desc"
              placeholder="Instruções gerais para o aluno..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <Card key={q.id} className="overflow-hidden">
            <div className="flex">
              <div className="w-1 shrink-0 bg-indigo-400" />
              <div className="flex-1 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                    Questão {idx + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <Select
                      value={q.type}
                      onValueChange={(v) =>
                        updateQuestion(q.id, {
                          type: v as 'multiple_choice' | 'essay',
                          options:
                            v === 'multiple_choice'
                              ? OPTION_LETTERS.slice(0, 4).map((id) => ({ id, text: '' }))
                              : [],
                          correctAnswer: undefined,
                        })
                      }
                    >
                      <SelectTrigger className="h-7 text-xs w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                        <SelectItem value="essay">Dissertativa</SelectItem>
                      </SelectContent>
                    </Select>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Enunciado</Label>
                  <Textarea
                    placeholder="Digite o enunciado da questão..."
                    value={q.statement}
                    onChange={(e) => updateQuestion(q.id, { statement: e.target.value })}
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>

                <div className="space-y-1.5 max-w-32">
                  <Label className="text-xs">Pontos da questão</Label>
                  <Input type="number" min={0.1} step={0.1} value={q.points}
                    onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })} className="h-8 text-sm" />
                </div>

                {q.type === 'multiple_choice' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Resposta Correta</Label>
                      <Select value={q.correctAnswer ?? ''} onValueChange={(v) => updateQuestion(q.id, { correctAnswer: v })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecione a resposta correta" />
                        </SelectTrigger>
                        <SelectContent>
                          {q.options.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              Alternativa {opt.id.toUpperCase()}: {opt.text || '(vazio)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Label className="text-xs">Alternativas</Label>
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2 p-2 rounded transition-all ${
                            q.correctAnswer === opt.id
                              ? 'bg-green-50 border-2 border-green-400'
                              : 'border-2 border-transparent'
                          }`}
                        >
                          <span
                            className={`size-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                              q.correctAnswer === opt.id
                                ? 'border-green-400 bg-green-100 text-green-700'
                                : 'border-gray-300 text-gray-500'
                            }`}
                          >
                            {opt.id.toUpperCase()}
                          </span>
                          <Input
                            placeholder={`Alternativa ${opt.id.toUpperCase()}`}
                            value={opt.text}
                            onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                            className="text-sm h-8"
                          />
                          {q.options.length > 2 && (
                            <button
                              onClick={() => removeOption(q.id, opt.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {q.options.length < 5 && (
                        <button
                          onClick={() => addOption(q.id)}
                          className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors mt-1"
                        >
                          <Plus className="size-3.5" />
                          Adicionar alternativa
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {q.type === 'essay' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Placeholder (instrução no campo de resposta)</Label>
                    <Input
                      placeholder="Ex: Escreva seu desenvolvimento aqui..."
                      value={q.placeholder}
                      onChange={(e) => updateQuestion(q.id, { placeholder: e.target.value })}
                      className="text-sm h-8"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add question buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => addQuestion('multiple_choice')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="size-4" />
          Múltipla Escolha
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addQuestion('essay')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="size-4" />
          Dissertativa
        </Button>
      </div>

      {/* Save */}
      <div className="sticky bottom-0 bg-white border-t py-4 flex items-center justify-between gap-4">
        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        <p className="text-sm text-gray-500">{questions.length} questão(ões) criada(s)</p>
        <Button
          onClick={handleSave}
          disabled={!title.trim() || !dueDate || submitting}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {submitting ? 'Publicando...' : 'Publicar atividade'}
        </Button>
      </div>
    </div>
  );
}

// ── Grade Activities page ──────────────────────────────────────────────

function GradeActivitiesPage({ teacher }: { teacher: any }) {
  const [selectedClass, setSelectedClass] = useState(teacher.classes?.[0] ?? '');
  const [selectedSubject, setSelectedSubject] = useState(teacher.subjects?.[0] ?? teacher.subject ?? '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openActivity, setOpenActivity] = useState<Activity | null>(null);
  const [overview, setOverview] = useState<any>({ students: [], activities: [] });
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => { api.getTeacherOverview().then(setOverview).catch(() => {}); }, []);
  const studentsInClass: any[] = overview.students.filter((student: any) => student.className === selectedClass);
  const classActivities: any[] = overview.activities.filter((activity: any) => {
    if (activity.subject !== selectedSubject || activity.className !== selectedClass || !activity.submissions?.length) return false;
    const allGraded = activity.submissions.every((submission: any) => submission.status === 'GRADED');
    return statusFilter === 'all' || (statusFilter === 'graded' ? allGraded : !allGraded);
  });

  const setGrade = (activityId: string, studentId: string, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [activityId]: { ...(prev[activityId] ?? {}), [studentId]: value },
    }));
  };

  const handleSaveGrades = async (activity: any) => {
    const submissions = activity.submissions ?? [];
    try {
      await Promise.all(submissions.map((submission: any) => {
        const submissionGrades = grades[submission.id] ?? {};
        return api.gradeSubmission(Number(submission.id), {
          feedback: '',
          questions: (submission.answers ?? []).map((answer: any) => ({
            questionId: answer.questionId,
            score: submissionGrades[answer.questionId] == null || submissionGrades[answer.questionId] === ''
              ? answer.score ?? automaticScore(activity.questions?.find((question: any) => question.id === answer.questionId), answer) ?? 0
              : Number(submissionGrades[answer.questionId]),
          })),
        });
      }));
      setSaved((prev) => ({ ...prev, [activity.id]: true }));
      setOpenActivity(null);
    } catch (error) {
      setSaved((prev) => ({ ...prev, [activity.id]: false }));
    }
  };

  if (openActivity) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setOpenActivity(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar às atividades
        </button>

        <div>
          <p className="text-xs text-gray-500 mb-0.5">
            {selectedClass} • {selectedSubject}
          </p>
          <h2 className="text-lg font-semibold">{openActivity.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Entrega: {new Date(openActivity.dueDate).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {saved[openActivity.id] && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="size-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800">Notas salvas com sucesso!</p>
          </div>
        )}

        {(openActivity as any).submissions?.map((submission: any) => (
          <Card key={submission.id}>
            <CardHeader>
              <CardTitle className="text-base">{submission.studentName}</CardTitle>
              <CardDescription>Entrega enviada em {new Date(submission.submittedAt).toLocaleString('pt-BR')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const submissionGrades = grades[submission.id] ?? {};
                return (submission.answers ?? []).map((answer: any, index: number) => {
                const question = (openActivity as any).questions?.find((item: any) => item.id === answer.questionId);
                const options = parseOptions(question?.options);
                const autoScore = automaticScore(question, answer);
                return (
                  <div key={answer.questionId} className="rounded-lg border p-4 space-y-2">
                    <p className="text-sm font-medium">Questão {question?.position ?? index + 1}: {question?.prompt}</p>
                    {options.length > 0 ? (
                      <div className="space-y-2">
                        {options.map((option) => (
                          <div key={option.id} className={`rounded-md border px-3 py-2 text-sm ${answer.answer === option.id ? 'border-blue-500 bg-blue-50 text-blue-900' : 'bg-gray-50'}`}>
                            <span className="font-semibold mr-2">{option.id.toUpperCase()}.</span>
                            {option.text}
                            {answer.answer === option.id && <Badge className="ml-2 bg-blue-600">Resposta do aluno</Badge>}
                          </div>
                        ))}
                        {autoScore !== null && <p className="text-xs text-gray-500">Resposta correta: alternativa {question.correctAnswer.toUpperCase()} | Nota automática: {autoScore}</p>}
                      </div>
                    ) : (
                      <div className="rounded-md bg-gray-50 px-3 py-2 text-sm whitespace-pre-wrap">
                        {answer.answer || 'O aluno não enviou resposta.'}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Label className="text-sm">Nota</Label>
                      <Input
                        type="number"
                        min={0}
                        max={Number(question?.points ?? 10)}
                        step={0.1}
                        placeholder={`0 a ${question?.points ?? 10}`}
                        value={submissionGrades[answer.questionId] ?? answer.score ?? autoScore ?? ''}
                        onChange={(e) => setGrade(String(submission.id), String(answer.questionId), e.target.value)}
                        className="h-8 w-24 text-sm"
                      />
                      <span className="text-xs text-gray-500">máximo: {question?.points ?? 10}</span>
                    </div>
                  </div>
                );
                });
              })()}
            </CardContent>
          </Card>
        ))}

        <div className="sticky bottom-0 bg-white border-t py-4 flex justify-end">
          <Button
            onClick={() => handleSaveGrades(openActivity)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Salvar notas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Corrigir Atividades</h2>
          <p className="text-sm text-gray-500">
            Selecione a turma e corrija as atividades entregues
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Matéria" /></SelectTrigger>
            <SelectContent>{(teacher.subjects ?? [teacher.subject]).filter(Boolean).map((subject: string) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Não corrigidas</SelectItem>
              <SelectItem value="graded">Corrigidas</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-48">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teacher.classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
      </div>

      {classActivities.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardCheck className="size-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma atividade entregue para corrigir.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classActivities.map((activity) => {
            const submittedCount = activity.submissions?.length ?? 0;
            const isSaved = saved[activity.id];
            const allGraded = submittedCount > 0 && activity.submissions.every((submission: any) => submission.status === 'GRADED');
            return (
              <Card
                key={activity.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setOpenActivity(activity)}
              >
                <div className="flex">
                  <div
                    className={`w-1 shrink-0 ${
                      isSaved || allGraded ? 'bg-green-400' : 'bg-blue-400'
                    }`}
                  />
                  <div className="flex-1 px-4 py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-indigo-700 transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {submittedCount} aluno{submittedCount !== 1 ? 's' : ''} em {selectedClass} •{' '}
                        Entrega: {new Date(activity.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge
                      className={`shrink-0 text-white ${
                        isSaved || allGraded ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    >
                      {isSaved || allGraded ? 'Corrigida' : 'Aguardando correção'}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [page, setPage] = useState<Page>('dashboard');
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [overview, setOverview] = useState<any>({ students: [], activities: [] });
  const [selectedDashboardSubject, setSelectedDashboardSubject] = useState('');

  useEffect(() => {
    api.getTeacherProfile(Number(user.id)).then((profile: any) => setTeacher({
      ...profile,
      name: profile.user?.name ?? user.name,
      email: profile.user?.email ?? user.email,
      subject: profile.subject,
      classes: profile.classes ?? [],
      subjects: profile.subjects?.length ? profile.subjects.map((subject: any) => typeof subject === 'string' ? subject : subject.name) : (profile.subject ? [profile.subject] : []),
    })).catch(() => setTeacher({ name: user.name, subject: '', classes: [] }));
  }, [user.id, user.name, user.email]);
  useEffect(() => { if (teacher && page === 'dashboard') api.getTeacherOverview().then(setOverview).catch(() => {}); }, [teacher, page]);

  if (!teacher) return <div className="min-h-screen flex items-center justify-center text-gray-400">Carregando perfil...</div>;
  const subjects: string[] = teacher.subjects ?? [teacher.subject].filter(Boolean);
  const dashboardSubject = selectedDashboardSubject || subjects[0] || '';
  const studentsInClasses: any[] = overview.students;
  const toCorrectCount = overview.activities.reduce((count: number, activity: any) => count + (activity.submissions?.filter((submission: any) => submission.status === 'SUBMITTED').length ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}

      {/* Header */}
      <header className="bg-white border-b shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 bg-indigo-600">
              <AvatarFallback className="text-white text-sm">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500">{subjects.join(' • ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangePwd(true)}
              className="flex items-center gap-2"
            >
              <KeyRound className="size-4" />
              Trocar Senha
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="size-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r shrink-0 flex flex-col py-4 gap-1 px-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider px-2 mb-2">Menu</p>

          {(
            [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'create', label: 'Criar Atividade', icon: PlusCircle },
              { id: 'myActivities', label: 'Minhas Atividades', icon: FileText },
              { id: 'grade', label: 'Corrigir Atividades', icon: ClipboardCheck, badge: toCorrectCount },
            ] as const
          ).map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
                page === id
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* ── Dashboard ── */}
          {page === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Turmas</CardTitle>
                    <BookOpen className="size-4 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{teacher.classes.length}</div>
                    <p className="text-xs text-gray-500">Total de turmas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Alunos</CardTitle>
                    <Users className="size-4 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{studentsInClasses.length}</div>
                    <p className="text-xs text-gray-500">Total de alunos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Disciplina</CardTitle>
                    <BookOpen className="size-4 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{subjects.length}</div>
                    <p className="text-xs text-gray-500">Matérias lecionadas</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Minhas Turmas</CardTitle>
                  <CardDescription>Desempenho dos alunos por turma</CardDescription>
                  <Select value={dashboardSubject} onValueChange={setSelectedDashboardSubject}>
                    <SelectTrigger className="w-56"><SelectValue placeholder="Selecione a matéria" /></SelectTrigger>
                    <SelectContent>{subjects.map((subject) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}</SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={teacher.classes[0]}>
                    <TabsList className="mb-4">
                      {teacher.classes.map((cls) => (
                        <TabsTrigger key={cls} value={cls}>
                          {cls}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {teacher.classes.map((cls) => (
                      <TabsContent key={cls} value={cls}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium">{cls}</h3>
                            <Badge variant="outline">
                              {studentsInClasses.filter((s) => s.className === cls).length} alunos
                            </Badge>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Matrícula</TableHead>
                                <TableHead>Média em {dashboardSubject}</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentsInClasses
                                .filter((s) => s.className === cls)
                                .map((student) => {
                                  const subjectActivities = overview.activities.filter((activity: any) => activity.subject === dashboardSubject && activity.className === cls);
                                  const submissions = subjectActivities.flatMap((activity: any) => activity.submissions ?? []).filter((submission: any) => submission.studentName === student.name && submission.status === 'GRADED' && submission.totalScore != null);
                                  const average = submissions.length ? submissions.reduce((sum: number, submission: any) => sum + Number(submission.totalScore), 0) / submissions.length : null;
                                  return (
                                    <TableRow key={student.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Avatar className="size-8">
                                            <AvatarFallback>
                                              {student.name.split(' ').map((n) => n[0]).join('')}
                                            </AvatarFallback>
                                          </Avatar>
                                          {student.name}
                                        </div>
                                      </TableCell>
                                      <TableCell>{student.enrollment}</TableCell>
                                      <TableCell>
                                        {average != null ? (
                                          <span
                                            className={`font-medium ${
                                              average > 6
                                                ? 'text-green-600'
                                                : average === 6
                                                ? 'text-yellow-600'
                                                : 'text-red-600'
                                            }`}
                                          >
                                            {average.toFixed(1)}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">N/A</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {average != null ? (
                                          average > 6 ? <Badge className="bg-green-500">Aprovado</Badge> : average === 6 ? <Badge className="bg-yellow-500">Média mínima</Badge> : <Badge className="bg-red-500">Atenção</Badge>
                                        ) : (
                                          <Badge variant="outline">Sem dados</Badge>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Create activity ── */}
          {page === 'create' && <CreateActivityPage teacher={teacher} />}

          {/* ── My activities ── */}
          {page === 'myActivities' && <MyActivitiesPage teacher={teacher} />}

          {/* ── Grade activities ── */}
          {page === 'grade' && <GradeActivitiesPage teacher={teacher} />}
        </main>
      </div>
    </div>
  );
}
