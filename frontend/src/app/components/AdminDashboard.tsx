import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from './ui/table';
import {
  LogOut, Users, GraduationCap, BookOpen, ShieldCheck, TrendingUp,
  AlertCircle, CheckCircle, Plus, X, Copy, KeyRound,
  ChevronDown, FlaskConical,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { mockStudents, mockTeachers, mockAdmins } from '../data/mockData';

interface AdminDashboardProps { user: any; onLogout: () => void; }

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_SUBJECTS = [
  'Matemática', 'Português', 'História', 'Ciências', 'Educação Física',
  'Geografia', 'Inglês', 'Arte', 'Física', 'Química', 'Biologia',
  'Filosofia', 'Sociologia',
];

const ALL_CLASSES = [
  '6º Ano A', '6º Ano B', '7º Ano A', '7º Ano B',
  '8º Ano A', '8º Ano B', '9º Ano A', '9º Ano B',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%&*';
  const all = upper + lower + digits + special;
  const rand = (s: string) => s[Math.floor(Math.random() * s.length)];
  const base = [rand(upper), rand(lower), rand(digits), rand(special)];
  for (let i = 0; i < 6; i++) base.push(rand(all));
  return base.sort(() => Math.random() - 0.5).join('');
}


// ── Reusable: MultiSelect checkbox dropdown ────────────────────────────────────

function MultiSelect({
  label, options, selected, onChange,
}: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between border rounded-md px-3 h-10 text-sm bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="truncate text-left">
          {selected.length === 0 ? label : selected.join(', ')}
        </span>
        <ChevronDown className={`size-4 text-gray-400 shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-52 overflow-y-auto">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-purple-600"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reusable: Generated password display ─────────────────────────────────────

function GeneratedPasswordBox({ password }: { password: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(password).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3 space-y-1">
      <p className="text-xs font-semibold text-green-700">Senha gerada — envie ao usuário por e-mail</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 font-mono text-sm text-green-800 bg-green-100 px-2 py-1 rounded select-all">
          {password}
        </code>
        <button onClick={copy} className="text-green-600 hover:text-green-800 transition-colors" title="Copiar">
          {copied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Add Teacher panel ─────────────────────────────────────────────────────────

interface NewTeacher {
  id: string; registro: string; name: string; email: string;
  subjects: string[]; classes: string[]; password: string;
}

function AddTeacherPanel({
  availableSubjects, onAdd, onClose,
}: { availableSubjects: string[]; onAdd: (t: NewTeacher) => void; onClose: () => void }) {
  const [fields, setFields] = useState({ registro: '', name: '', email: '' });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<NewTeacher | null>(null);

  const set = (k: string, v: string) => { setFields((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!fields.registro.trim()) errs.registro = 'Obrigatório';
    if (!fields.name.trim()) errs.name = 'Obrigatório';
    if (!fields.email.includes('@')) errs.email = 'E-mail inválido';
    if (subjects.length === 0) errs.subjects = 'Selecione ao menos uma disciplina';
    if (classes.length === 0) errs.classes = 'Selecione ao menos uma turma';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const t: NewTeacher = { id: crypto.randomUUID(), ...fields, subjects, classes, password: generatePassword() };
    setCreated(t);
    onAdd(t);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Adicionar Professor</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="size-4" /></button>
        </div>

        {!created ? (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Número de Registro *</Label>
              <Input placeholder="REG-0001" value={fields.registro} onChange={(e) => set('registro', e.target.value)}
                className={errors.registro ? 'border-red-400' : ''} />
              {errors.registro && <p className="text-xs text-red-500">{errors.registro}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nome Completo *</Label>
              <Input placeholder="Prof. João da Silva" value={fields.name} onChange={(e) => set('name', e.target.value)}
                className={errors.name ? 'border-red-400' : ''} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">E-mail *</Label>
              <Input type="email" placeholder="professor@escola.com" value={fields.email}
                onChange={(e) => set('email', e.target.value)} className={errors.email ? 'border-red-400' : ''} />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Disciplinas *</Label>
              <MultiSelect label="Selecionar disciplinas" options={availableSubjects}
                selected={subjects} onChange={setSubjects} />
              {errors.subjects && <p className="text-xs text-red-500">{errors.subjects}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Turmas *</Label>
              <MultiSelect label="Selecionar turmas" options={ALL_CLASSES}
                selected={classes} onChange={setClasses} />
              {errors.classes && <p className="text-xs text-red-500">{errors.classes}</p>}
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSave}>
              Criar Professor
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <p><span className="text-gray-500">Registro:</span> {created.registro}</p>
              <p><span className="text-gray-500">Nome:</span> {created.name}</p>
              <p><span className="text-gray-500">E-mail:</span> {created.email}</p>
              <p><span className="text-gray-500">Disciplinas:</span> {created.subjects.join(', ')}</p>
              <p><span className="text-gray-500">Turmas:</span> {created.classes.join(', ')}</p>
            </div>
            <GeneratedPasswordBox password={created.password} />
            <p className="text-xs text-amber-600 font-medium">
              ⚠ Envie a senha acima ao professor por e-mail antes de fechar.
            </p>
            <Button variant="outline" className="w-full" onClick={onClose}>Fechar</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Student panel ─────────────────────────────────────────────────────────

interface NewStudent {
  id: string; ra: string; name: string; email: string; turma: string; password: string;
}

function AddStudentPanel({ onAdd, onClose }: { onAdd: (s: NewStudent) => void; onClose: () => void }) {
  const [fields, setFields] = useState({ ra: '', name: '', email: '', turma: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<NewStudent | null>(null);

  const set = (k: string, v: string) => { setFields((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!fields.ra.trim()) errs.ra = 'Obrigatório';
    if (!fields.name.trim()) errs.name = 'Obrigatório';
    if (!fields.email.includes('@')) errs.email = 'E-mail inválido';
    if (!fields.turma) errs.turma = 'Selecione uma turma';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const s: NewStudent = { id: crypto.randomUUID(), ...fields, password: generatePassword() };
    setCreated(s);
    onAdd(s);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Adicionar Aluno</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="size-4" /></button>
        </div>

        {!created ? (
          <>
            <div className="space-y-1">
              <Label className="text-xs">RA (Registro do Aluno) *</Label>
              <Input placeholder="2025001" value={fields.ra} onChange={(e) => set('ra', e.target.value)}
                className={errors.ra ? 'border-red-400' : ''} />
              {errors.ra && <p className="text-xs text-red-500">{errors.ra}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nome Completo *</Label>
              <Input placeholder="Ana Paula Santos" value={fields.name} onChange={(e) => set('name', e.target.value)}
                className={errors.name ? 'border-red-400' : ''} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">E-mail *</Label>
              <Input type="email" placeholder="aluno@escola.com" value={fields.email}
                onChange={(e) => set('email', e.target.value)} className={errors.email ? 'border-red-400' : ''} />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Turma *</Label>
              <select value={fields.turma} onChange={(e) => set('turma', e.target.value)}
                className={`w-full border rounded-md h-10 px-3 text-sm bg-white ${errors.turma ? 'border-red-400' : 'border-input'}`}>
                <option value="">Selecione a turma</option>
                {ALL_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.turma && <p className="text-xs text-red-500">{errors.turma}</p>}
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSave}>
              Criar Aluno
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <p><span className="text-gray-500">RA:</span> {created.ra}</p>
              <p><span className="text-gray-500">Nome:</span> {created.name}</p>
              <p><span className="text-gray-500">E-mail:</span> {created.email}</p>
              <p><span className="text-gray-500">Turma:</span> {created.turma}</p>
            </div>
            <GeneratedPasswordBox password={created.password} />
            <p className="text-xs text-amber-600 font-medium">
              ⚠ Envie a senha acima ao aluno por e-mail antes de fechar.
            </p>
            <Button variant="outline" className="w-full" onClick={onClose}>Fechar</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Admin panel ───────────────────────────────────────────────────────────

interface NewAdmin { id: string; name: string; email: string; role: string; password: string; }

function AddAdminPanel({ onAdd, onClose }: { onAdd: (a: NewAdmin) => void; onClose: () => void }) {
  const [fields, setFields] = useState({ name: '', email: '', role: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<NewAdmin | null>(null);

  const set = (k: string, v: string) => { setFields((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!fields.name.trim()) errs.name = 'Obrigatório';
    if (!fields.email.includes('@')) errs.email = 'E-mail inválido';
    if (!fields.role.trim()) errs.role = 'Obrigatório';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const a: NewAdmin = { id: crypto.randomUUID(), ...fields, password: generatePassword() };
    setCreated(a);
    onAdd(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Adicionar Administrador</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="size-4" /></button>
        </div>

        {!created ? (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Nome Completo *</Label>
              <Input placeholder="Nome Sobrenome" value={fields.name} onChange={(e) => set('name', e.target.value)}
                className={errors.name ? 'border-red-400' : ''} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">E-mail *</Label>
              <Input type="email" placeholder="admin@escola.com" value={fields.email}
                onChange={(e) => set('email', e.target.value)} className={errors.email ? 'border-red-400' : ''} />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cargo / Função *</Label>
              <Input placeholder="Coordenador(a), Diretor(a)..." value={fields.role}
                onChange={(e) => set('role', e.target.value)} className={errors.role ? 'border-red-400' : ''} />
              {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSave}>
              Criar Administrador
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <p><span className="text-gray-500">Nome:</span> {created.name}</p>
              <p><span className="text-gray-500">E-mail:</span> {created.email}</p>
              <p><span className="text-gray-500">Cargo:</span> {created.role}</p>
            </div>
            <GeneratedPasswordBox password={created.password} />
            <p className="text-xs text-amber-600 font-medium">
              ⚠ Envie a senha acima ao administrador por e-mail antes de fechar.
            </p>
            <Button variant="outline" className="w-full" onClick={onClose}>Fechar</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main AdminDashboard ───────────────────────────────────────────────────────

type Modal = { type: 'add_teacher' } | { type: 'add_student' } | { type: 'add_admin' };

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [modal, setModal] = useState<Modal | null>(null);
  const [showChangePwd, setShowChangePwd] = useState(false);

  // Mutable local lists
  const [students, setStudents] = useState(() => mockStudents.map((s) => ({ ...s })));
  const [teachers, setTeachers] = useState(() => mockTeachers.map((t) => ({ ...t })));
  const [admins, setAdmins] = useState(() => mockAdmins.map((a) => ({ ...a })));
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [newSubject, setNewSubject] = useState('');
  const [subjectError, setSubjectError] = useState('');

  const allGrades = students.flatMap((s) => s.grades);
  const approvedCount = allGrades.filter((g) => g.status === 'approved').length;
  const recoveringCount = allGrades.filter((g) => g.status === 'recovering').length;
  const failedCount = allGrades.filter((g) => g.status === 'failed').length;
  const overallAverage = allGrades.reduce((s, g) => s + g.average, 0) / (allGrades.length || 1);

  const addSubject = () => {
    const trimmed = newSubject.trim();
    if (!trimmed) { setSubjectError('Digite o nome da matéria.'); return; }
    if (subjects.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setSubjectError('Essa matéria já existe.'); return;
    }
    setSubjects((p) => [...p, trimmed]);
    setNewSubject('');
    setSubjectError('');
  };

  const removeSubject = (s: string) => {
    if (DEFAULT_SUBJECTS.includes(s)) return; // protect defaults
    setSubjects((p) => p.filter((x) => x !== s));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
      {modal?.type === 'add_teacher' && (
        <AddTeacherPanel
          availableSubjects={subjects}
          onAdd={(t) => setTeachers((p) => [...p, { id: t.id, name: t.name, email: t.email, password: t.password, subject: t.subjects[0], classes: t.classes }])}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'add_student' && (
        <AddStudentPanel
          onAdd={(s) => setStudents((p) => [...p, { id: s.id, name: s.name, email: s.email, password: s.password, class: s.turma, enrollment: s.ra, grades: [] }])}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'add_admin' && (
        <AddAdminPanel
          onAdd={(a) => setAdmins((p) => [...p, { id: a.id, name: a.name, email: a.email, password: a.password, role: a.role }])}
          onClose={() => setModal(null)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 bg-purple-600">
                <AvatarFallback className="text-white">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl">{user.name}</h1>
                <div className="flex items-center gap-1 text-sm text-purple-600">
                  <ShieldCheck className="size-3" />
                  <span>{user.role || 'Administrador'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowChangePwd(true)} className="flex items-center gap-2">
                <KeyRound className="size-4" />
                Trocar Senha
              </Button>
              <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
                <LogOut className="size-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Alunos</CardTitle>
              <Users className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{students.length}</div>
              <p className="text-xs text-gray-500">Total cadastrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Professores</CardTitle>
              <GraduationCap className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{teachers.length}</div>
              <p className="text-xs text-gray-500">Total cadastrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Média Geral</CardTitle>
              <TrendingUp className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{overallAverage.toFixed(1)}</div>
              <p className="text-xs text-gray-500">Todos os alunos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Recuperação</CardTitle>
              <AlertCircle className="size-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-yellow-600">{recoveringCount}</div>
              <p className="text-xs text-gray-500">Situações abertas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="size-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="size-4" /> Alunos
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <GraduationCap className="size-4" /> Professores
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <ShieldCheck className="size-4" /> Administradores
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <FlaskConical className="size-4" /> Matérias
            </TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho Geral</CardTitle>
                  <CardDescription>Status de aprovação por disciplina</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><CheckCircle className="size-4 text-green-500" /><span className="text-sm">Aprovados</span></div>
                    <Badge className="bg-green-500">{approvedCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><AlertCircle className="size-4 text-yellow-500" /><span className="text-sm">Em Recuperação</span></div>
                    <Badge className="bg-yellow-500">{recoveringCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><AlertCircle className="size-4 text-red-500" /><span className="text-sm">Reprovados</span></div>
                    <Badge className="bg-red-500">{failedCount}</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Turmas Ativas</CardTitle>
                  <CardDescription>Turmas com alunos cadastrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(new Set(students.map((s) => s.class))).map((cls) => {
                      const count = students.filter((s) => s.class === cls).length;
                      return (
                        <div key={cls} className="flex items-center justify-between pb-2 border-b last:border-0">
                          <span className="text-sm">{cls}</span>
                          <Badge variant="outline">{count} aluno{count !== 1 ? 's' : ''}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Students ── */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>Alunos</CardTitle>
                    <CardDescription>Lista completa de alunos cadastrados</CardDescription>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    onClick={() => setModal({ type: 'add_student' })}>
                    <Plus className="size-4" /> Adicionar Aluno
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Matrícula / RA</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Média Geral</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const avg = student.grades.length
                        ? student.grades.reduce((s, g) => s + g.average, 0) / student.grades.length
                        : null;
                      const hasRecovery = student.grades.some((g) => g.status === 'recovering');
                      const hasFailed = student.grades.some((g) => g.status === 'failed');
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-8"><AvatarFallback>{student.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback></Avatar>
                              {student.name}
                            </div>
                          </TableCell>
                          <TableCell>{student.enrollment}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell>
                            {avg !== null ? (
                              <span className={`font-medium ${avg >= 7 ? 'text-green-600' : avg >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {avg.toFixed(1)}
                              </span>
                            ) : <span className="text-gray-400">—</span>}
                          </TableCell>
                          <TableCell>
                            {avg === null ? <Badge variant="outline">Novo</Badge>
                              : hasFailed ? <Badge className="bg-red-500">Reprovado</Badge>
                              : hasRecovery ? <Badge className="bg-yellow-500">Recuperação</Badge>
                              : <Badge className="bg-green-500">Regular</Badge>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Teachers ── */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>Professores</CardTitle>
                    <CardDescription>Lista completa do corpo docente</CardDescription>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    onClick={() => setModal({ type: 'add_teacher' })}>
                    <Plus className="size-4" /> Adicionar Professor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professor</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Disciplina</TableHead>
                      <TableHead>Turmas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-8"><AvatarFallback>{teacher.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback></Avatar>
                            {teacher.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{teacher.email}</TableCell>
                        <TableCell>{teacher.subject}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.classes.map((cls) => (
                              <Badge key={cls} variant="outline" className="text-xs">{cls}</Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Admins ── */}
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>Administradores</CardTitle>
                    <CardDescription>Contas administrativas do sistema</CardDescription>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    onClick={() => setModal({ type: 'add_admin' })}>
                    <Plus className="size-4" /> Adicionar Administrador
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Administrador</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Cargo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-8"><AvatarFallback>{admin.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback></Avatar>
                            {admin.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{admin.email}</TableCell>
                        <TableCell>{admin.role}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Subjects ── */}
          <TabsContent value="subjects">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Matéria</CardTitle>
                  <CardDescription>Cadastre disciplinas que não estão na lista padrão</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label>Nome da matéria</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: Física, Sociologia, Espanhol..."
                        value={newSubject}
                        onChange={(e) => { setNewSubject(e.target.value); setSubjectError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
                        className={subjectError ? 'border-red-400' : ''}
                      />
                      <Button onClick={addSubject} className="bg-purple-600 hover:bg-purple-700 shrink-0">
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    {subjectError && <p className="text-xs text-red-500">{subjectError}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matérias cadastradas</CardTitle>
                  <CardDescription>{subjects.length} no total — padrão + personalizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => {
                      const isDefault = DEFAULT_SUBJECTS.includes(s);
                      return (
                        <div key={s} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm border ${isDefault ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                          {!isDefault && <FlaskConical className="size-3 text-purple-500" />}
                          {s}
                          {!isDefault && (
                            <button onClick={() => removeSubject(s)} className="text-purple-400 hover:text-red-500 transition-colors ml-0.5">
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
