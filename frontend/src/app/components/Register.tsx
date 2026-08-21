import { useState, useEffect, useRef } from 'react';
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
  Clock,
} from 'lucide-react';

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

function maskCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{1,3})$/, '$1-$2');
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
      {/* Store answer in a data attribute trick — expose via closure */}
      <input type="hidden" data-captcha-answer={captcha.answer} />
    </div>
  );
}

// ── Code verification step ────────────────────────────────────────────────────

function VerifyStep({ onConfirmed }: { onConfirmed: () => void }) {
  const [phoneCode, setPhoneCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    // Mock: any 6-digit code works
    if (phoneCode.length !== 6 || emailCode.length !== 6) {
      setError('Digite os 6 dígitos de cada código.');
      return;
    }
    onConfirmed();
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <p className="font-medium">Verificação de contato</p>
        <p className="text-sm text-gray-500">
          Enviamos um código de 6 dígitos para o seu telefone e e-mail cadastrados.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Código por SMS</Label>
          <Input
            placeholder="000000"
            maxLength={6}
            value={phoneCode}
            onChange={(e) => { setPhoneCode(e.target.value.replace(/\D/g, '')); setError(''); }}
            className="tracking-widest text-center text-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Código por E-mail</Label>
          <Input
            placeholder="000000"
            maxLength={6}
            value={emailCode}
            onChange={(e) => { setEmailCode(e.target.value.replace(/\D/g, '')); setError(''); }}
            className="tracking-widest text-center text-lg"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <p className="text-xs text-gray-400 text-center">
        Demo: use qualquer sequência de 6 números.
      </p>

      <Button onClick={handleVerify} className="w-full bg-purple-600 hover:bg-purple-700">
        Confirmar
      </Button>
    </div>
  );
}

// ── Pending step ──────────────────────────────────────────────────────────────

function PendingStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="text-center space-y-5 py-4">
      <div className="flex justify-center">
        <div className="bg-yellow-100 p-4 rounded-full">
          <Clock className="size-10 text-yellow-600" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-lg">Cadastro Pendente</p>
        <p className="text-sm text-gray-500">
          Aguarde um Super Admin aceitar sua solicitação de acesso.
          <br />
          Você será notificado por e-mail quando aprovado.
        </p>
      </div>
      <Button variant="outline" onClick={onBack} className="w-full">
        Voltar ao login
      </Button>
    </div>
  );
}

// ── Pessoa Física form ────────────────────────────────────────────────────────

function FisicaForm({ onSubmit }: { onSubmit: (fields: { email: string; senha: string; nome: string }) => void | Promise<void> }) {
  const [fields, setFields] = useState({
    cpf: '', nome: '', sobrenome: '', nascimento: '',
    email: '', telefone: '', senha: '', confirma: '',
  });
  const [showSenha, setShowSenha] = useState(false);
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

  const allPasswordRulesPassed = passwordRules.every((r) => r.test(fields.senha));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!fields.cpf || fields.cpf.replace(/\D/g, '').length < 11) errs.cpf = 'CPF inválido';
    if (!fields.nome.trim()) errs.nome = 'Obrigatório';
    if (!fields.sobrenome.trim()) errs.sobrenome = 'Obrigatório';
    if (!fields.nascimento) errs.nascimento = 'Obrigatório';
    if (!fields.email.includes('@')) errs.email = 'E-mail inválido';
    if (fields.telefone.replace(/\D/g, '').length < 10) errs.telefone = 'Telefone inválido';
    if (!allPasswordRulesPassed) errs.senha = 'Senha não atende os requisitos';
    if (fields.senha !== fields.confirma) errs.confirma = 'As senhas não coincidem';
    if (!termos) errs.termos = 'Aceite os termos para continuar';

    // check captcha via DOM
    const answerEl = captchaRef.current?.querySelector('[data-captcha-answer]') as HTMLInputElement | null;
    const correctAnswer = answerEl?.dataset.captchaAnswer ?? '';
    if (captchaVal.trim() !== correctAnswer) {
      setCaptchaError(true);
      errs.captcha = 'CAPTCHA incorreto';
    } else {
      setCaptchaError(false);
    }

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    await onSubmit({ email: fields.email, senha: fields.senha, nome: `${fields.nome} ${fields.sobrenome}` });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>CPF *</Label>
        <Input
          placeholder="000.000.000-00"
          value={fields.cpf}
          onChange={(e) => set('cpf', maskCPF(e.target.value))}
          className={errors.cpf ? 'border-red-400' : ''}
        />
        {errors.cpf && <p className="text-xs text-red-500">{errors.cpf}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Nome *</Label>
          <Input
            placeholder="Maria"
            value={fields.nome}
            onChange={(e) => set('nome', e.target.value)}
            className={errors.nome ? 'border-red-400' : ''}
          />
          {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Sobrenome *</Label>
          <Input
            placeholder="Silva"
            value={fields.sobrenome}
            onChange={(e) => set('sobrenome', e.target.value)}
            className={errors.sobrenome ? 'border-red-400' : ''}
          />
          {errors.sobrenome && <p className="text-xs text-red-500">{errors.sobrenome}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Data de Nascimento *</Label>
        <Input
          type="date"
          value={fields.nascimento}
          onChange={(e) => set('nascimento', e.target.value)}
          className={errors.nascimento ? 'border-red-400' : ''}
        />
        {errors.nascimento && <p className="text-xs text-red-500">{errors.nascimento}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>E-mail *</Label>
        <Input
          type="email"
          placeholder="seu@email.com"
          value={fields.email}
          onChange={(e) => set('email', e.target.value)}
          className={errors.email ? 'border-red-400' : ''}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Telefone *</Label>
        <Input
          placeholder="(00) 00000-0000"
          value={fields.telefone}
          onChange={(e) => set('telefone', maskPhone(e.target.value))}
          className={errors.telefone ? 'border-red-400' : ''}
        />
        {errors.telefone && <p className="text-xs text-red-500">{errors.telefone}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Senha *</Label>
        <div className="relative">
          <Input
            type={showSenha ? 'text' : 'password'}
            placeholder="••••••••"
            value={fields.senha}
            onChange={(e) => set('senha', e.target.value)}
            className={`pr-10 ${errors.senha ? 'border-red-400' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowSenha((p) => !p)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <PasswordStrength password={fields.senha} />
        {errors.senha && <p className="text-xs text-red-500">{errors.senha}</p>}
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
            id="termos-fisica"
            type="checkbox"
            checked={termos}
            onChange={(e) => { setTermos(e.target.checked); setErrors((p) => ({ ...p, termos: '' })); }}
            className="mt-0.5 accent-purple-600"
          />
          <label htmlFor="termos-fisica" className="text-sm text-gray-600 cursor-pointer">
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
        Cadastrar
      </Button>
    </form>
  );
}

// ── Pessoa Jurídica form ──────────────────────────────────────────────────────

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
];

function JuridicaForm({ onSubmit }: { onSubmit: () => void }) {
  const [fields, setFields] = useState({
    cnpj: '', nomeRep: '', sobrenomeRep: '', nomeEmpresa: '',
    razaoSocial: '', rua: '', numero: '', cep: '', estado: '',
    telComercial: '', emailInst: '', cpfRep: '', cargoRep: '', telRep: '',
  });
  const [termos, setTermos] = useState(false);
  const [captchaVal, setCaptchaVal] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const captchaRef = useRef<HTMLDivElement>(null);

  const set = (k: string, v: string) => {
    setFields((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (fields.cnpj.replace(/\D/g, '').length < 14) errs.cnpj = 'CNPJ inválido';
    if (!fields.nomeRep.trim()) errs.nomeRep = 'Obrigatório';
    if (!fields.sobrenomeRep.trim()) errs.sobrenomeRep = 'Obrigatório';
    if (!fields.nomeEmpresa.trim()) errs.nomeEmpresa = 'Obrigatório';
    if (!fields.razaoSocial.trim()) errs.razaoSocial = 'Obrigatório';
    if (!fields.rua.trim()) errs.rua = 'Obrigatório';
    if (!fields.numero.trim()) errs.numero = 'Obrigatório';
    if (fields.cep.replace(/\D/g, '').length < 8) errs.cep = 'CEP inválido';
    if (!fields.estado) errs.estado = 'Obrigatório';
    if (fields.telComercial.replace(/\D/g, '').length < 10) errs.telComercial = 'Telefone inválido';
    if (!fields.emailInst.includes('@')) errs.emailInst = 'E-mail inválido';
    if (fields.cpfRep.replace(/\D/g, '').length < 11) errs.cpfRep = 'CPF inválido';
    if (!fields.cargoRep.trim()) errs.cargoRep = 'Obrigatório';
    if (fields.telRep.replace(/\D/g, '').length < 10) errs.telRep = 'Telefone inválido';
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
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>CNPJ *</Label>
        <Input
          placeholder="00.000.000/0000-00"
          value={fields.cnpj}
          onChange={(e) => set('cnpj', maskCNPJ(e.target.value))}
          className={errors.cnpj ? 'border-red-400' : ''}
        />
        {errors.cnpj && <p className="text-xs text-red-500">{errors.cnpj}</p>}
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Representante Legal</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Nome *</Label>
          <Input
            placeholder="Ana"
            value={fields.nomeRep}
            onChange={(e) => set('nomeRep', e.target.value)}
            className={errors.nomeRep ? 'border-red-400' : ''}
          />
          {errors.nomeRep && <p className="text-xs text-red-500">{errors.nomeRep}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Sobrenome *</Label>
          <Input
            placeholder="Souza"
            value={fields.sobrenomeRep}
            onChange={(e) => set('sobrenomeRep', e.target.value)}
            className={errors.sobrenomeRep ? 'border-red-400' : ''}
          />
          {errors.sobrenomeRep && <p className="text-xs text-red-500">{errors.sobrenomeRep}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>CPF do representante *</Label>
          <Input
            placeholder="000.000.000-00"
            value={fields.cpfRep}
            onChange={(e) => set('cpfRep', maskCPF(e.target.value))}
            className={errors.cpfRep ? 'border-red-400' : ''}
          />
          {errors.cpfRep && <p className="text-xs text-red-500">{errors.cpfRep}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Cargo *</Label>
          <Input
            placeholder="Diretor(a)"
            value={fields.cargoRep}
            onChange={(e) => set('cargoRep', e.target.value)}
            className={errors.cargoRep ? 'border-red-400' : ''}
          />
          {errors.cargoRep && <p className="text-xs text-red-500">{errors.cargoRep}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Telefone do representante *</Label>
        <Input
          placeholder="(00) 00000-0000"
          value={fields.telRep}
          onChange={(e) => set('telRep', maskPhone(e.target.value))}
          className={errors.telRep ? 'border-red-400' : ''}
        />
        {errors.telRep && <p className="text-xs text-red-500">{errors.telRep}</p>}
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Dados da Empresa</p>

      <div className="space-y-1.5">
        <Label>Nome da Empresa *</Label>
        <Input
          placeholder="Escola Exemplo"
          value={fields.nomeEmpresa}
          onChange={(e) => set('nomeEmpresa', e.target.value)}
          className={errors.nomeEmpresa ? 'border-red-400' : ''}
        />
        {errors.nomeEmpresa && <p className="text-xs text-red-500">{errors.nomeEmpresa}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Razão Social *</Label>
        <Input
          placeholder="Exemplo Educação LTDA"
          value={fields.razaoSocial}
          onChange={(e) => set('razaoSocial', e.target.value)}
          className={errors.razaoSocial ? 'border-red-400' : ''}
        />
        {errors.razaoSocial && <p className="text-xs text-red-500">{errors.razaoSocial}</p>}
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Endereço Comercial</p>

      <div className="space-y-1.5">
        <Label>Rua / Avenida *</Label>
        <Input
          placeholder="Av. Paulista"
          value={fields.rua}
          onChange={(e) => set('rua', e.target.value)}
          className={errors.rua ? 'border-red-400' : ''}
        />
        {errors.rua && <p className="text-xs text-red-500">{errors.rua}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Número *</Label>
          <Input
            placeholder="1000"
            value={fields.numero}
            onChange={(e) => set('numero', e.target.value)}
            className={errors.numero ? 'border-red-400' : ''}
          />
          {errors.numero && <p className="text-xs text-red-500">{errors.numero}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>CEP *</Label>
          <Input
            placeholder="00000-000"
            value={fields.cep}
            onChange={(e) => set('cep', maskCEP(e.target.value))}
            className={errors.cep ? 'border-red-400' : ''}
          />
          {errors.cep && <p className="text-xs text-red-500">{errors.cep}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Estado *</Label>
          <select
            value={fields.estado}
            onChange={(e) => set('estado', e.target.value)}
            className={`w-full border rounded-md h-10 px-3 text-sm bg-white ${errors.estado ? 'border-red-400' : 'border-input'}`}
          >
            <option value="">UF</option>
            {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
          {errors.estado && <p className="text-xs text-red-500">{errors.estado}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Telefone Comercial *</Label>
        <Input
          placeholder="(00) 0000-0000"
          value={fields.telComercial}
          onChange={(e) => set('telComercial', maskPhone(e.target.value))}
          className={errors.telComercial ? 'border-red-400' : ''}
        />
        {errors.telComercial && <p className="text-xs text-red-500">{errors.telComercial}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>E-mail Institucional *</Label>
        <Input
          type="email"
          placeholder="contato@empresa.com.br"
          value={fields.emailInst}
          onChange={(e) => set('emailInst', e.target.value)}
          className={errors.emailInst ? 'border-red-400' : ''}
        />
        {errors.emailInst && <p className="text-xs text-red-500">{errors.emailInst}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <input
            id="termos-juridica"
            type="checkbox"
            checked={termos}
            onChange={(e) => { setTermos(e.target.checked); setErrors((p) => ({ ...p, termos: '' })); }}
            className="mt-0.5 accent-purple-600"
          />
          <label htmlFor="termos-juridica" className="text-sm text-gray-600 cursor-pointer">
            Li e aceito o{' '}
            <button
              type="button"
              onClick={() => window.open('about:blank', '_blank')}
              className="text-purple-600 underline hover:text-purple-800"
            >
              Contrato de Serviço e Termos de Uso
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
        Cadastrar
      </Button>
    </form>
  );
}

// ── Register root ─────────────────────────────────────────────────────────────

type Step = 'form' | 'verify' | 'pending';

export function Register({ onBack }: RegisterProps) {
  const [step, setStep] = useState<Step>('form');
  const [regType, setRegType] = useState<'fisica' | 'juridica'>('fisica');

  const registerAdmin = async (fields: { email: string; senha: string; nome: string }) => {
    const { api } = await import('../../services/api');
    await api.register(fields.email, fields.senha, fields.nome, 'ADMIN');
    setStep('verify');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
              {step === 'form' && 'Criar conta de Administrador'}
              {step === 'verify' && 'Verificar contato'}
              {step === 'pending' && 'Solicitação enviada'}
            </CardTitle>
          </div>
          {step === 'form' && (
            <CardDescription>Preencha os dados para solicitar acesso ao sistema</CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {step === 'form' && (
            <>
              <Tabs value={regType} onValueChange={(v) => setRegType(v as 'fisica' | 'juridica')}>
                <TabsList className="grid w-full grid-cols-2 mb-5">
                  <TabsTrigger value="fisica" className="flex items-center gap-2">
                    <User className="size-4" />
                    Pessoa Física
                  </TabsTrigger>
                  <TabsTrigger value="juridica" className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    Pessoa Jurídica
                  </TabsTrigger>
                </TabsList>

                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  <TabsContent value="fisica">
                    <FisicaForm onSubmit={registerAdmin} />
                  </TabsContent>
                  <TabsContent value="juridica">
                    <JuridicaForm onSubmit={() => setStep('verify')} />
                  </TabsContent>
                </div>
              </Tabs>
            </>
          )}

          {step === 'verify' && (
            <VerifyStep onConfirmed={() => setStep('pending')} />
          )}

          {step === 'pending' && (
            <PendingStep onBack={onBack} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
