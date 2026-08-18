import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  LogOut,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  KeyRound,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import {
  mockPendingRegistrations,
  PendingRegistration,
  PendingRegistrationFisica,
  PendingRegistrationJuridica,
} from '../data/mockData';

interface SuperAdminDashboardProps {
  user: any;
  onLogout: () => void;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 py-1.5 border-b last:border-0">
      <span className="text-xs text-gray-400 sm:w-44 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

function FisicaDetail({ data }: { data: PendingRegistrationFisica }) {
  return (
    <div>
      <FieldRow label="CPF" value={data.cpf} />
      <FieldRow label="Nome completo" value={`${data.nome} ${data.sobrenome}`} />
      <FieldRow label="Data de nascimento" value={new Date(data.dataNascimento).toLocaleDateString('pt-BR')} />
      <FieldRow label="E-mail" value={data.email} />
      <FieldRow label="Telefone" value={data.telefone} />
    </div>
  );
}

function JuridicaDetail({ data }: { data: PendingRegistrationJuridica }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 mt-1">Empresa</p>
      <FieldRow label="CNPJ" value={data.cnpj} />
      <FieldRow label="Nome da empresa" value={data.nomeEmpresa} />
      <FieldRow label="Razão social" value={data.razaoSocial} />
      <FieldRow label="Endereço" value={data.endereco} />
      <FieldRow label="Telefone comercial" value={data.telefoneComercial} />
      <FieldRow label="E-mail institucional" value={data.emailInstitucional} />
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 mt-3">Representante Legal</p>
      <FieldRow label="Nome" value={`${data.nomeRepresentante} ${data.sobrenomeRepresentante}`} />
      <FieldRow label="CPF" value={data.cpfRepresentante} />
      <FieldRow label="Cargo" value={data.cargoRepresentante} />
      <FieldRow label="Telefone" value={data.telefoneRepresentante} />
    </div>
  );
}

function RegistrationCard({
  reg,
  onApprove,
  onReject,
}: {
  reg: PendingRegistration;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFisica = reg.data.type === 'fisica';
  const displayName =
    isFisica
      ? `${(reg.data as PendingRegistrationFisica).nome} ${(reg.data as PendingRegistrationFisica).sobrenome}`
      : (reg.data as PendingRegistrationJuridica).nomeEmpresa;
  const displaySub = isFisica
    ? (reg.data as PendingRegistrationFisica).email
    : (reg.data as PendingRegistrationJuridica).emailInstitucional;

  const statusColor =
    reg.status === 'pending'
      ? 'bg-yellow-500'
      : reg.status === 'approved'
      ? 'bg-green-500'
      : 'bg-red-500';
  const statusLabel =
    reg.status === 'pending' ? 'Pendente' : reg.status === 'approved' ? 'Aprovado' : 'Rejeitado';

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div
          className={`w-1 shrink-0 ${
            reg.status === 'pending'
              ? 'bg-yellow-400'
              : reg.status === 'approved'
              ? 'bg-green-400'
              : 'bg-red-400'
          }`}
        />
        <div className="flex-1 p-4">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <div
              className={`size-9 rounded-full flex items-center justify-center shrink-0 ${
                isFisica ? 'bg-blue-100' : 'bg-indigo-100'
              }`}
            >
              {isFisica ? (
                <User className="size-4 text-blue-600" />
              ) : (
                <Building2 className="size-4 text-indigo-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{displaySub}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="hidden sm:inline-flex text-xs" variant="outline">
                {isFisica ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </Badge>
              <Badge className={`${statusColor} text-white text-xs`}>{statusLabel}</Badge>
              <button
                onClick={() => setExpanded((p) => !p)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            </div>
          </div>

          {/* Expanded detail */}
          {expanded && (
            <div className="mt-4 border-t pt-4">
              <p className="text-xs text-gray-400 mb-3">
                Enviado em{' '}
                {new Date(reg.submittedAt).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
              {isFisica ? (
                <FisicaDetail data={reg.data as PendingRegistrationFisica} />
              ) : (
                <JuridicaDetail data={reg.data as PendingRegistrationJuridica} />
              )}

              {reg.status === 'pending' && (
                <div className="flex gap-2 mt-4 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReject}
                    className="flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="size-4" />
                    Rejeitar
                  </Button>
                  <Button
                    size="sm"
                    onClick={onApprove}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="size-4" />
                    Aprovar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function SuperAdminDashboard({ user, onLogout }: SuperAdminDashboardProps) {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>(mockPendingRegistrations);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const approve = (id: string) =>
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );

  const reject = (id: string) =>
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const rejectedCount = registrations.filter((r) => r.status === 'rejected').length;

  const filtered = registrations.filter((r) => filter === 'all' || r.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}

      {/* Header */}
      <header className="bg-white border-b shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-purple-700 rounded-full flex items-center justify-center">
              <ShieldCheck className="size-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm leading-tight">{user.name}</p>
              <p className="text-xs text-purple-600 flex items-center gap-1">
                <ShieldCheck className="size-3" />
                Super Administrador
              </p>
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

      <main className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <Clock className="size-8 text-yellow-500 shrink-0" />
              <div>
                <p className="text-2xl font-semibold">{pendingCount}</p>
                <p className="text-xs text-gray-500">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <CheckCircle className="size-8 text-green-500 shrink-0" />
              <div>
                <p className="text-2xl font-semibold">{approvedCount}</p>
                <p className="text-xs text-gray-500">Aprovados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <XCircle className="size-8 text-red-400 shrink-0" />
              <div>
                <p className="text-2xl font-semibold">{rejectedCount}</p>
                <p className="text-xs text-gray-500">Rejeitados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter + list */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Solicitações de cadastro</CardTitle>
                <CardDescription>Aprove ou rejeite cadastros de novos administradores</CardDescription>
              </div>
              <div className="flex gap-1 flex-wrap">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : 'Rejeitados'}
                    {f === 'pending' && pendingCount > 0 && (
                      <span className="ml-1 bg-yellow-400 text-yellow-900 rounded-full px-1">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShieldCheck className="size-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma solicitação encontrada.</p>
              </div>
            ) : (
              filtered.map((reg) => (
                <RegistrationCard
                  key={reg.id}
                  reg={reg}
                  onApprove={() => approve(reg.id)}
                  onReject={() => reject(reg.id)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
