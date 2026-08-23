import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
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
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { mockStudents, mockActivities, Activity, Question } from '../data/mockData';

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(activity.status !== 'pending');

  const isReadOnly = activity.status !== 'pending';
  const total = activity.questions.length;
  const answered = Object.keys(answers).filter((k) => answers[k]?.trim()).length;

  const setAnswer = (qid: string, value: string) => {
    if (isReadOnly) return;
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = () => {
    if (answered < total) return;
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
                      return (
                        <button
                          key={opt.id}
                          disabled={isReadOnly || submitted}
                          onClick={() => setAnswer(q.id, opt.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-colors ${
                            selected
                              ? 'border-blue-500 bg-blue-50 text-blue-800'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${isReadOnly || submitted ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                              selected
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-300 text-gray-400'
                            }`}
                          >
                            {opt.id.toUpperCase()}
                          </span>
                          {opt.text}
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
  const student = mockStudents[0];
  const subjects = student.grades.map((g) => g.subject);

  const activitiesBySubject = subjects.map((subject) => ({
    subject,
    items: mockActivities.filter((a) => a.subject === subject),
  })).filter((group) => group.items.length > 0);

  const pendingCount = mockActivities.filter((a) => a.status === 'pending').length;
  const submittedCount = mockActivities.filter((a) => a.status === 'submitted').length;
  const gradedCount = mockActivities.filter((a) => a.status === 'graded').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Atividades</h2>
        <p className="text-sm text-gray-500">Atividades geradas pelos seus professores, organizadas por disciplina</p>
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
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-800">
          <Star className="size-3" />
          {gradedCount} corrigidas
        </div>
      </div>

      {/* Grouped by subject */}
      {activitiesBySubject.map(({ subject, items }) => (
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
                          <Badge className={`${meta.color} text-white text-xs`}>{meta.label}</Badge>
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
  const student = mockStudents[0];

  const overallAverage =
    student.grades.reduce((sum, g) => sum + g.average, 0) / student.grades.length;

  const pendingCount = mockActivities.filter((a) => a.status === 'pending').length;

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
              <p className="text-xs text-gray-500">{student.class} • {student.enrollment}</p>
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
                    <div className="text-2xl font-semibold">{overallAverage.toFixed(1)}</div>
                    <p className="text-xs text-gray-500">
                      {overallAverage >= 7 ? 'Desempenho aprovado' : 'Atenção necessária'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Disciplinas</CardTitle>
                    <BookOpen className="size-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{student.grades.length}</div>
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
                      {student.grades.filter((g) => g.status === 'approved').length}
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
                  <Tabs defaultValue={student.grades[0].subject}>
                    <TabsList className="mb-4 flex-wrap h-auto">
                      {student.grades.map((grade) => (
                        <TabsTrigger key={grade.subject} value={grade.subject}>
                          {grade.subject}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {student.grades.map((grade) => (
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
                                        g.grade >= 7
                                          ? 'text-green-600'
                                          : g.grade >= 5
                                          ? 'text-yellow-600'
                                          : 'text-red-600'
                                      }`}
                                    >
                                      {g.grade.toFixed(1)}
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
                  </Tabs>
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
