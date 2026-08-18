import { useState } from 'react';
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
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { mockStudents, mockTeachers, mockActivities, Activity, Question } from '../data/mockData';

interface TeacherDashboardProps {
  user: any;
  onLogout: () => void;
}

type Page = 'dashboard' | 'create' | 'grade';

// ── Types for activity creation ───────────────────────────────────────────────

interface DraftQuestion {
  id: string;
  type: 'multiple_choice' | 'essay';
  statement: string;
  options: { id: string; text: string }[];
  placeholder: string;
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
  };
}

// ── Create Activity page ──────────────────────────────────────────────────────

function CreateActivityPage({ teacher }: { teacher: typeof mockTeachers[0] }) {
  const [selectedClass, setSelectedClass] = useState(teacher.classes[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion('multiple_choice')]);
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    if (!title.trim() || !dueDate || questions.length === 0) return;
    setSaved(true);
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
              <Label>Turma</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teacher.classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
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
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ex: Prova Bimestral — Funções"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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

                {q.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Alternativas</Label>
                    {q.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="size-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
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
        <Button variant="outline" size="sm" onClick={() => addQuestion('multiple_choice')} className="flex items-center gap-2">
          <PlusCircle className="size-4" />
          Múltipla Escolha
        </Button>
        <Button variant="outline" size="sm" onClick={() => addQuestion('essay')} className="flex items-center gap-2">
          <PlusCircle className="size-4" />
          Dissertativa
        </Button>
      </div>

      {/* Save */}
      <div className="sticky bottom-0 bg-white border-t py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">{questions.length} questão(ões) criada(s)</p>
        <Button
          onClick={handleSave}
          disabled={!title.trim() || !dueDate}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Publicar atividade
        </Button>
      </div>
    </div>
  );
}

// ── Grade Activities page ─────────────────────────────────────────────────────

function GradeActivitiesPage({ teacher }: { teacher: typeof mockTeachers[0] }) {
  const [selectedClass, setSelectedClass] = useState(teacher.classes[0]);
  const [openActivity, setOpenActivity] = useState<Activity | null>(null);
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  // Filter activities for the teacher's subject that are submitted or graded
  const classActivities = mockActivities.filter(
    (a) => a.subject === teacher.subject && (a.status === 'submitted' || a.status === 'graded')
  );

  const studentsInClass = mockStudents.filter((s) => s.class === selectedClass);

  const setGrade = (activityId: string, studentId: string, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [activityId]: { ...(prev[activityId] ?? {}), [studentId]: value },
    }));
  };

  const handleSaveGrades = (activityId: string) => {
    setSaved((prev) => ({ ...prev, [activityId]: true }));
    setOpenActivity(null);
  };

  if (openActivity) {
    const actGrades = grades[openActivity.id] ?? {};
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
          <p className="text-xs text-gray-500 mb-0.5">{selectedClass} • {teacher.subject}</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lançar notas — {selectedClass}</CardTitle>
            <CardDescription>Atribua uma nota de 0 a 10 para cada aluno</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead className="w-36">Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsInClass.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-gray-400 py-6">
                      Nenhum aluno cadastrado nesta turma.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentsInClass.map((student) => (
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
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          placeholder="—"
                          value={actGrades[student.id] ?? ''}
                          onChange={(e) => setGrade(openActivity.id, student.id, e.target.value)}
                          className="h-8 w-24 text-sm"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 bg-white border-t py-4 flex justify-end">
          <Button
            onClick={() => handleSaveGrades(openActivity.id)}
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
          <p className="text-sm text-gray-500">Selecione a turma e corrija as atividades entregues</p>
        </div>
        <div className="w-48">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teacher.classes.map((cls) => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            const submittedCount = studentsInClass.length;
            const isSaved = saved[activity.id];
            return (
              <Card
                key={activity.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setOpenActivity(activity)}
              >
                <div className="flex">
                  <div
                    className={`w-1 shrink-0 ${
                      isSaved || activity.status === 'graded' ? 'bg-green-400' : 'bg-blue-400'
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
                        isSaved || activity.status === 'graded' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    >
                      {isSaved || activity.status === 'graded' ? 'Corrigida' : 'Aguardando correção'}
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
  const teacher = mockTeachers[0];
  const studentsInClasses = mockStudents;

  const toCorrectCount = mockActivities.filter(
    (a) => a.subject === teacher.subject && a.status === 'submitted'
  ).length;

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
              <p className="text-xs text-gray-500">{teacher.subject}</p>
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

          {(
            [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'create', label: 'Criar Atividade', icon: PlusCircle },
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
                    <div className="text-lg font-semibold">{teacher.subject}</div>
                    <p className="text-xs text-gray-500">Matéria lecionada</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Minhas Turmas</CardTitle>
                  <CardDescription>Desempenho dos alunos por turma</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={teacher.classes[0]}>
                    <TabsList className="mb-4">
                      {teacher.classes.map((cls) => (
                        <TabsTrigger key={cls} value={cls}>{cls}</TabsTrigger>
                      ))}
                    </TabsList>

                    {teacher.classes.map((cls) => (
                      <TabsContent key={cls} value={cls}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium">{cls}</h3>
                            <Badge variant="outline">
                              {studentsInClasses.filter((s) => s.class === cls).length} alunos
                            </Badge>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Matrícula</TableHead>
                                <TableHead>Média em {teacher.subject}</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentsInClasses
                                .filter((s) => s.class === cls)
                                .map((student) => {
                                  const sg = student.grades.find((g) => g.subject === teacher.subject);
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
                                        {sg ? (
                                          <span className={`font-medium ${sg.average >= 7 ? 'text-green-600' : sg.average >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {sg.average.toFixed(1)}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">N/A</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {sg ? (
                                          sg.status === 'approved' ? (
                                            <Badge className="bg-green-500">Aprovado</Badge>
                                          ) : sg.status === 'recovering' ? (
                                            <Badge className="bg-yellow-500">Recuperação</Badge>
                                          ) : (
                                            <Badge className="bg-red-500">Reprovado</Badge>
                                          )
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

          {/* ── Grade activities ── */}
          {page === 'grade' && <GradeActivitiesPage teacher={teacher} />}
        </main>
      </div>
    </div>
  );
}
