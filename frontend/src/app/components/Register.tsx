import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft,
  User,
  Building2,
  Eye,
  EyeOff,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

interface RegisterProps {
  onBack: () => void;
}

// ── Mask helpers ──────────────────────────────────────────────────────────────

function maskCPF(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskCNPJ(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
}

// ── Password strength ─────────────────────────────────────────────────────────

interface PasswordRule {
  label: string;
  test: (p: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Letra minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Número', test: (p) => /\d/.test(p) },
  { label: 'Caractere especial', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = passwordRules.filter((r) => r.test(password)).length;
  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= passed
                ? passed <= 2
                  ? 'bg-red-400'
                  : passed <= 3
                  ? 'bg-yellow-400'
                  : 'bg-green-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        {passwordRules.map((rule) => (
          <p
            key={rule.label}
            className={`text-xs flex items-center gap-1 ${
              rule.test(password) ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span>{rule.test(password) ? '✓' : '○'}</span>
            {rule.label}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Simple CAPTCHA ────────────────────────────────────────────────────────────

function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const ops = ['+', '-', '×'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { question: `${a} ${op} ${b} = ?`, answer: String(answer) };
}

function CaptchaField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error: boolean;
}) {
  const [captcha, setCaptcha] = useState(generateCaptcha);

  return (
    <div className="space-y-1.5">
      <Label>CAPTCHA</Label>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-100 border rounded-md px-4 py-2 flex items-center justify-between select-none">
          <span className="font-mono text-base tracking-widest text-gray-700">
            {captcha.question}
          </span>
          <button
            type="button"
            onClick={() => { setCaptcha(generateCaptcha()); onChange(''); }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Novo CAPTCHA"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
        <Input
          placeholder="Resposta"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-28 ${error ? 'border-red-400' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-red-500">Resposta incorreta. Tente novamente.</p>}
      <input type="hidden" data-captcha-answer={captcha.answer} />
    </div>
  );
}

// ── Success step ──────────────────────────────────────────────────────────────

function SuccessStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="text-center space-y-5 py-4">
      <div className="flex justify-center">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle className="size-10 text-green-600" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-lg">Cadastro Realizado!</p>
        <p className="text-sm text-gray-500">
          Sua solicitação de administrador foi enviada.
          <br />
          Um Super Admin precisa aprová-la antes do primeiro acesso.
        </p>
      </div>
      <Button onClick={onBack} className="w-full bg-purple-600 hover:bg-purple-700">
        Voltar ao login
      </Button>
    </div>
  );
}

// ── Admin registration form ───────────────────────────────────────────────────

function AdminForm({ onSubmit }: { onSubmit: (fields: { email: string; password: string; name: string; organizationKey: string }) => void }) {
  const [fields, setFields] = useState({
    name: '',
    email: '',
    organizationKey: '',
    password: '',
    confirma: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirma, setShowConfirma] = useState(false);
  const [termos, setTermos] = useState(false);
  const [captchaVal, setCaptchaVal] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const captchaRef = useRef<HTMLDivElement>(null);

  const set = (k: string, v: string) => {
    setFields((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const allPasswordRulesPassed = passwordRules.every((r) => r.test(fields.password));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!fields.name.trim()) errs.name = 'Obrigatório';
    if (!fields.email.includes('@')) errs.email = 'E-mail inválido';
    if (!fields.organizationKey.trim()) errs.organizationKey = 'Informe a organização/escola';
    if (!allPasswordRulesPassed) errs.password = 'Senha não atende os requisitos';
    if (fields.password !== fields.confirma) errs.confirma = 'As senhas não coincidem';
    if (!termos) errs.termos = 'Aceite os termos para continuar';

    const answerEl = captchaRef.current?.querySelector('[data-captcha-answer]') as HTMLInputElement | null;
    const correctAnswer = answerEl?.dataset.captchaAnswer ?? '';
    if (captchaVal.trim() !== correctAnswer) {
      setCaptchaError(true);
      errs.captcha = 'CAPTCHA incorreto';
    } else {
      setCaptchaError(false);
    }

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ email: fields.email, password: fields.password, name: fields.name, organizationKey: fields.organizationKey });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>Nome Completo *</Label>
        <Input
          placeholder="Seu Nome"
          value={fields.name}
          onChange={(e) => set('name', e.target.value)}
          className={errors.name ? 'border-red-400' : ''}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>E-mail *</Label>
        <Input
          type="email"
          placeholder="admin@escola.com"
          value={fields.email}
          onChange={(e) => set('email', e.target.value)}
          className={errors.email ? 'border-red-400' : ''}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Organização / Escola *</Label>
        <Input placeholder="Nome ou identificador da escola" value={fields.organizationKey}
          onChange={(e) => set('organizationKey', e.target.value)} className={errors.organizationKey ? 'border-red-400' : ''} />
        {errors.organizationKey && <p className="text-xs text-red-500">{errors.organizationKey}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Senha *</Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={fields.password}
            onChange={(e) => set('password', e.target.value)}
            className={`pr-10 ${errors.password ? 'border-red-400' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <PasswordStrength password={fields.password} />
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Confirmar Senha *</Label>
        <div className="relative">
          <Input
            type={showConfirma ? 'text' : 'password'}
            placeholder="••••••••"
            value={fields.confirma}
            onChange={(e) => set('confirma', e.target.value)}
            className={`pr-10 ${errors.confirma ? 'border-red-400' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirma((p) => !p)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showConfirma ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.confirma && <p className="text-xs text-red-500">{errors.confirma}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <input
            id="termos"
            type="checkbox"
            checked={termos}
            onChange={(e) => { setTermos(e.target.checked); setErrors((p) => ({ ...p, termos: '' })); }}
            className="mt-0.5 accent-purple-600"
          />
          <label htmlFor="termos" className="text-sm text-gray-600 cursor-pointer">
            Li e aceito a{' '}
            <button
              type="button"
              onClick={() => window.open('about:blank', '_blank')}
              className="text-purple-600 underline hover:text-purple-800"
            >
              Política de Privacidade
            </button>
          </label>
        </div>
        {errors.termos && <p className="text-xs text-red-500">{errors.termos}</p>}
      </div>

      <div ref={captchaRef}>
        <CaptchaField
          value={captchaVal}
          onChange={(v) => { setCaptchaVal(v); setCaptchaError(false); }}
          error={captchaError}
        />
      </div>

      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
        Cadastrar Admin
      </Button>
    </form>
  );
}

// ── Register root ─────────────────────────────────────────────────────────────

type Step = 'form' | 'success';

export function Register({ onBack }: RegisterProps) {
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');

  const handleRegister = async (fields: { email: string; password: string; name: string; organizationKey: string }) => {
    try {
      setError('');
      await api.register(fields.email, fields.password, fields.name, fields.organizationKey);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a solicitação');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            {step === 'form' && (
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <CardTitle className="text-xl">
              {step === 'form' && 'Cadastro de Administrador'}
              {step === 'success' && 'Cadastro Realizado'}
            </CardTitle>
          </div>
          {step === 'form' && (
            <CardDescription>Preencha os dados para criar sua conta de administrador</CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {step === 'form' && <AdminForm onSubmit={handleRegister} />}
          {step === 'success' && <SuccessStep onBack={onBack} />}
        </CardContent>
      </Card>
    </div>
  );
}
