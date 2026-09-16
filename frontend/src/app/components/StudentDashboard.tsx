import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
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
  BookOpen,
  Award,
  LayoutDashboard,
  ClipboardList,
  CheckCircle,
  Clock,
  Star,
  ArrowLeft,
  ChevronRight,
  Send,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { Activity, Question } from '../types/activity';
import { api } from '../../services/api';

interface StudentDashboardProps {
  user: any;
  onLogout: () => void;
}

type Page = 'dashboard' | 'activities' | 'activity_detail';

const statusMeta: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  submitted: { label: 'Entregue', color: 'bg-blue-500' },
  graded: { label: 'Corrigida', color: 'bg-green-500' },
};

// ── Activity solver page ──────────────────────────────────────────────────────

function ActivitySolver({
  activity,
  onBack,
}: {
  activity: Activity;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries((activity as any).submission?.answers?.map((answer: any) => [String(answer.questionId), answer.answer ?? '']) ?? [])
  );
  const [submitted, setSubmitted] = useState(activity.status !== 'pending');

  const isReadOnly = activity.status !== 'pending';
  const isGraded = activity.status === 'graded';
  const total = activity.questions.length;
  const answered = Object.keys(answers).filter((k) => answers[k]?.trim()).length;

  const setAnswer = (qid: string, value: string) => {
    if (isReadOnly) return;
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (answered < total) return;
    await api.submitActivity(Number(activity.id), Object.entries(answers).map(([questionId, answer]) => ({
      questionId: Number(questionId), answer,
    })));
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Back bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar às atividades
        </button>
      </div>

      {/* Header card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">{activity.subject} • {activity.teacher}</p>
              <CardTitle className="text-lg">{activity.title}</CardTitle>
              <CardDescription className="mt-1">{activity.description}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge className={`${statusMeta[activity.status].color} text-white`}>
                {statusMeta[activity.status].label}
              </Badge>
              {activity.grade !== undefined && (
                <span className="text-sm font-semibold text-green-700">Nota: {activity.grade.toFixed(1)}</span>
              )}
              <span className="text-xs text-gray-400">
                Entrega: {new Date(activity.dueDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questions */}
      {submitted && !isReadOnly && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="size-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">Atividade enviada com sucesso! Aguarde a correção do professor.</p>
        </div>
      )}

      <div className="space-y-4">
        {activity.questions.map((q: Question, idx: number) => (
          <Card key={q.id} className="overflow-hidden">
            <div className="flex">
              <div className="w-1 shrink-0 bg-blue-400" />
              <div className="flex-1 p-5">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                  Questão {idx + 1}
                  {q.type === 'essay' ? ' — Dissertativa' : ' — Múltipla Escolha'}
                </p>
                <p className="text-sm leading-relaxed mb-4">{q.statement}</p>

                {q.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const selected = answers[q.id] === opt.id;
                      const correct = isGraded && (q as any).correctAnswer === opt.id;
                      return (
                        <button
                          key={opt.id}
                          disabled={isReadOnly || submitted}
                          onClick={() => setAnswer(q.id, opt.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-colors ${
                            correct
                              ? 'border-green-500 bg-green-50 text-green-900'
                              : selected
                              ? 'border-blue-500 bg-blue-50 text-blue-800'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${isReadOnly || submitted ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                              correct
                                ? 'border-green-500 bg-green-500 text-white'
                                : selected
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-300 text-gray-400'
                            }`}
                          >
                            {opt.id.toUpperCase()}
                          </span>
                          {opt.text}
                          {selected && <Badge className="ml-auto bg-blue-600">Sua resposta</Badge>}
                          {correct && <Badge className="ml-auto bg-green-600">Resposta correta</Badge>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'essay' && (
                  <Textarea
                    placeholder={isReadOnly || submitted ? 'Resposta enviada.' : (q.placeholder ?? 'Escreva sua resposta aqui...')}
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    disabled={isReadOnly || submitted}
                    rows={6}
                    className="resize-none text-sm"
                  />
                )}
                {q.type === 'essay' && isGraded && (activity as any).submission?.answers?.find((answer: any) => String(answer.questionId) === q.id)?.teacherFeedback && (
                  <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    Feedback: {(activity as any).submission.answers.find((answer: any) => String(answer.questionId) === q.id).teacherFeedback}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Submit bar */}
      {!isReadOnly && !submitted && (
        <div className="sticky bottom-0 bg-white border-t py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {answered} de {total} {total === 1 ? 'questão respondida' : 'questões respondidas'}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={answered < total}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="size-4" />
            Enviar atividade
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Activities list page ──────────────────────────────────────────────────────

function ActivitiesPage({ onOpen }: { onOpen: (a: Activity) => void }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const parseOptions = (value: unknown) => {
    if (typeof value !== 'string' || !value.trim()) return [];
    try { return JSON.parse(value); } catch { return []; }
  };

  useEffect(() => {
    api.getStudentActivities()
      .then((items: any[]) => setActivities(items.map((activity) => ({
        id: String(activity.id), title: activity.title, subject: activity.subject,
        teacher: activity.teacherName, description: activity.description ?? '', dueDate: activity.dueDate,
        status: activity.submission?.status?.toLowerCase() ?? 'pending',
        grade: activity.submission?.totalScore == null ? undefined : Number(activity.submission.totalScore),
        submission: activity.submission,
        questions: (activity.questions ?? []).map((question: any) => ({
          id: String(question.id), type: question.type === 'ESSAY' ? 'essay' : 'multiple_choice',
          statement: question.prompt, placeholder: '',
          options: parseOptions(question.options),
          correctAnswer: question.correctAnswer,
        })),
      }))))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Erro ao carregar atividades'));
  }, []);

  const activitiesBySubject = Array.from(new Set(activities.map((activity) => activity.subject))).map((subject) => ({
    subject, items: activities.filter((activity) => activity.subject === subject && (filter === 'all' || activity.status === filter)),
  }));

  const now = new Date();
  const pendingCount = activities.filter((a) => a.status === 'pending' && new Date(a.dueDate) >= now).length;
  const encerradoCount = activities.filter((a) => a.status === 'pending' && new Date(a.dueDate) < now).length;
  const submittedCount = activities.filter((a) => a.status === 'submitted').length;
  const gradedCount = activities.filter((a) => a.status === 'graded').length;

  if (error) return <div className="py-16 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Atividades</h2>
        <p className="text-sm text-gray-500">Atividades geradas pelos seus professores, organizadas por disciplina</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Mostrar:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="pending">Não enviadas</SelectItem>
            <SelectItem value="submitted">Enviadas / aguardando</SelectItem>
            <SelectItem value="graded">Corrigidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 text-xs text-yellow-800">
          <Clock className="size-3" />
          {pendingCount} pendentes
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs text-blue-800">
          <CheckCircle className="size-3" />
          {submittedCount} entregues
        </div>
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1 text-xs text-red-800">
          <AlertCircle className="size-3" />
          {encerradoCount} encerradas
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-800">
          <Star className="size-3" />
          {gradedCount} corrigidas
        </div>
      </div>

      {/* Grouped by subject */}
      {activitiesBySubject.filter(({ items }) => items.length > 0).map(({ subject, items }) => (
        <div key={subject}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="size-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">{subject}</h3>
            <span className="text-xs text-gray-400">({items.length})</span>
          </div>

          <div className="space-y-2">
            {items.map((activity) => {
              const meta = statusMeta[activity.status];
              const due = new Date(activity.dueDate);
              const isPastDue = due < new Date() && activity.status === 'pending';
              return (
                <button
                  key={activity.id}
                  onClick={() => onOpen(activity)}
                  className="w-full text-left"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex">
                      <div
                        className={`w-1 shrink-0 ${
                          activity.status === 'pending'
                            ? isPastDue ? 'bg-red-400' : 'bg-yellow-400'
                            : activity.status === 'submitted'
                            ? 'bg-blue-400'
                            : 'bg-green-400'
                        }`}
                      />
                      <div className="flex-1 px-4 py-3 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-blue-700 transition-colors">
                            {activity.title}
                          </p>
                          <p className={`text-xs mt-0.5 ${isPastDue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {activity.teacher} • Entrega: {due.toLocaleDateString('pt-BR')}
                            {isPastDue && ' — Prazo encerrado'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {activity.grade !== undefined && (
                            <span className="text-sm font-semibold text-green-700">{activity.grade.toFixed(1)}</span>
                          )}
                          <Badge className={`${isPastDue ? 'bg-red-500' : meta.color} text-white text-xs`}>{isPastDue ? 'Encerrado' : meta.label}</Badge>
                          <ChevronRight className="size-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const studentId = Number(user.id);
    Promise.all([api.getStudentProfile(studentId), api.getStudentGrades(studentId), api.getStudentActivities()])
      .then(([profile, loadedGrades, loadedActivities]: any[]) => {
        setStudent(profile);
        const groupedGrades = loadedGrades.reduce((groups: any[], grade: any) => {
          const group = groups.find((item) => item.subject === grade.subject);
          if (group) group.grades.push(grade);
          else groups.push({ subject: grade.subject, grades: [grade] });
          return groups;
        }, []);
        loadedActivities.forEach((activity: any) => {
          const submission = activity.submission;
          if (!submission || submission.status !== 'GRADED' || submission.totalScore == null) return;
          const group = groupedGrades.find((item: any) => item.subject === activity.subject);
          const activityGrade = { period: 'Atividades', value: Number(submission.totalScore), weight: 1 };
          if (group) group.grades.push(activityGrade);
          else groupedGrades.push({ subject: activity.subject, grades: [activityGrade] });
        });
        setGrades(groupedGrades.map((group: any) => {
          const average = group.grades.reduce((sum: number, grade: any) => sum + Number(grade.value), 0) / group.grades.length;
          return { ...group, average, status: average > 6 ? 'approved' : average === 6 ? 'recovering' : 'failed' };
        }));
        setActivities(loadedActivities);
      })
      .catch(() => { setStudent(null); });
  }, [user.id]);

  if (!student) return <div className="min-h-screen flex items-center justify-center text-gray-400">Carregando dados do aluno...</div>;

  const overallAverage =
    grades.length ? grades.reduce((sum, g) => sum + g.average, 0) / grades.length : 0;

  const now = new Date();
  const pendingCount = activities.filter((a) => !a.submission && new Date(a.dueDate) >= now).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500">Aprovado</Badge>;
      case 'failed': return <Badge className="bg-red-500">Reprovado</Badge>;
      case 'recovering': return <Badge className="bg-yellow-500">Recuperação</Badge>;
      default: return <Badge>Pendente</Badge>;
    }
  };

  const openActivity = (a: Activity) => {
    setSelectedActivity(a);
    setPage('activity_detail');
  };

  const backToActivities = () => {
    setSelectedActivity(null);
    setPage('activities');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}

      {/* Top Header */}
      <header className="bg-white border-b shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 bg-blue-600">
              <AvatarFallback className="text-white text-sm">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500">{student.className} • {student.enrollment}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowChangePwd(true)} className="flex items-center gap-2">
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

          <button
            onClick={() => setPage('dashboard')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
              page === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="size-4 shrink-0" />
            Dashboard
          </button>

          <button
            onClick={() => { setSelectedActivity(null); setPage('activities'); }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
              page === 'activities' || page === 'activity_detail'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="size-4 shrink-0" />
            <span className="flex-1">Atividades</span>
            {pendingCount > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                {pendingCount}
              </span>
            )}
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* ── Dashboard ── */}
          {page === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Média Geral</CardTitle>
                    <Award className="size-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-semibold ${overallAverage > 6 ? 'text-green-600' : overallAverage === 6 ? 'text-yellow-600' : 'text-red-600'}`}>{overallAverage.toFixed(1)}</div>
                    <p className="text-xs text-gray-500">
                      {overallAverage > 6 ? 'Desempenho aprovado' : overallAverage === 6 ? 'Média mínima' : 'Atenção necessária'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Disciplinas</CardTitle>
                    <BookOpen className="size-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{grades.length}</div>
                    <p className="text-xs text-gray-500">Total de matérias</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Aprovações</CardTitle>
                    <Award className="size-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">
                      {grades.filter((g) => g.status === 'approved').length}
                    </div>
                    <p className="text-xs text-gray-500">Disciplinas aprovadas</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Minhas Notas</CardTitle>
                  <CardDescription>Acompanhe seu desempenho em todas as disciplinas</CardDescription>
                </CardHeader>
                <CardContent>
                  {grades.length === 0 ? <p className="text-sm text-gray-500">Nenhuma nota registrada.</p> : <Tabs defaultValue={grades[0].subject}>
                    <TabsList className="mb-4 flex-wrap h-auto">
                      {grades.map((grade) => (
                        <TabsTrigger key={grade.subject} value={grade.subject}>
                          {grade.subject}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {grades.map((grade) => (
                      <TabsContent key={grade.subject} value={grade.subject}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-medium">{grade.subject}</h3>
                              <p className="text-sm text-gray-500">Média: {grade.average.toFixed(1)}</p>
                            </div>
                            {getStatusBadge(grade.status)}
                          </div>

                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Período</TableHead>
                                <TableHead>Nota</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {grade.grades.map((g, i) => (
                                <TableRow key={i}>
                                  <TableCell>{g.period}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`font-medium ${
                                        Number(g.value) > 6
                                          ? 'text-green-600'
                                          : Number(g.value) === 6
                                          ? 'text-yellow-600'
                                          : 'text-red-600'
                                      }`}
                                    >
                                      {Number(g.value).toFixed(1)}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          {grade.status === 'recovering' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-sm text-yellow-800">
                                Você está em recuperação nesta disciplina. Foque nos estudos para melhorar sua média!
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Activities list ── */}
          {page === 'activities' && (
            <ActivitiesPage onOpen={openActivity} />
          )}

          {/* ── Activity detail / solver ── */}
          {page === 'activity_detail' && selectedActivity && (
            <ActivitySolver activity={selectedActivity} onBack={backToActivities} />
          )}
        </main>
      </div>
    </div>
  );
}


