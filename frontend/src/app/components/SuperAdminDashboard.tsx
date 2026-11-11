import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useChatHistory } from '../hooks/useChatHistory';
import { useChatPolling } from '../hooks/useChatPolling';
import { useMessageDraft } from '../hooks/useMessageDraft';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { AuthenticatedUser } from '../../types';
import type { Registration } from '../types/school';
import { Badge } from './ui/badge';
import {
  LogOut,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  User,
  ChevronDown,
  ChevronUp,
  KeyRound,
  LifeBuoy,
  Send,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { api } from '../../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

function SupportInbox() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  const draft = useMessageDraft();
  const chats = useChatPolling('support', api.getSupportChats, revision);
  const selectedChat = chats.data?.find((chat) => chat.id === selectedId);
  const history = useChatHistory(selectedChat?.id ?? null, revision);
  const chatError = error || history.error || chats.error;

  const reply = async (event: FormEvent) => {
    event.preventDefault();
    const content = message.trim();
    if (!selectedChat || !content || pending) return;
    setPending(true);
    setError('');
    try {
      await api.sendSupportMessage(selectedChat.id, draft.prepare(String(selectedChat.id), content));
      draft.clear();
      setMessage('');
      setRevision((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a resposta');
    } finally {
      setPending(false);
    }
  };

  const close = async () => {
    if (!selectedChat || pending) return;
    setPending(true);
    setError('');
    try {
      await api.closeSupportChat(selectedChat.id);
      setRevision((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível encerrar o atendimento');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LifeBuoy className="size-5 text-blue-600" />Atendimentos</CardTitle>
          <CardDescription>Atendimentos criados nos últimos 7 dias.</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[24rem] space-y-2 overflow-y-auto lg:max-h-[34rem]">
          {chats.loading && <p role="status" className="text-sm text-gray-500">Carregando atendimentos…</p>}
          {chats.data?.length === 0 && <p className="text-sm text-gray-500">Nenhum atendimento encontrado.</p>}
          {chats.data?.map((chat) => (
            <button key={chat.id} type="button" disabled={pending} aria-pressed={selectedId === chat.id}
              onClick={() => { setSelectedId(chat.id); setMessage(''); setError(''); }}
              className={`w-full rounded-md border p-3 text-left ${selectedId === chat.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="flex justify-between gap-2">
                <span className="truncate text-sm font-medium">{chat.requester.name}</span>
                <Badge variant={chat.status === 'OPEN' ? 'default' : 'secondary'}>{chat.status === 'OPEN' ? 'Aberto' : 'Encerrado'}</Badge>
              </div>
              <p className="truncate text-xs text-gray-500">{chat.requester.email}</p>
              <p className="mt-1 text-xs text-gray-400">Atendimento #{chat.id}</p>
            </button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{selectedChat ? `Atendimento de ${selectedChat.requester.name}` : 'Selecione um atendimento'}</CardTitle>
          {selectedChat && <CardDescription>{selectedChat.requester.email} · {selectedChat.requester.role}</CardDescription>}
        </CardHeader>
        <CardContent className="min-w-0">
          {chatError && <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{chatError}</p>}
          {selectedChat && <>
            <div role="log" aria-label="Histórico do atendimento" className="h-80 space-y-3 overflow-y-auto rounded-md bg-gray-50 p-3 sm:p-4">
              {history.loading && <p role="status" className="text-sm text-gray-500">Carregando mensagens…</p>}
              {history.data?.map((item) => (
                <div key={item.id} className="rounded-md border bg-white p-3">
                  <p className="break-words whitespace-pre-wrap text-sm">{item.content}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.sender.name} · {new Date(item.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
            {selectedChat.status === 'OPEN' && <form onSubmit={reply} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input className="min-h-10" aria-label="Resposta" placeholder="Responder ao atendimento…" maxLength={4000}
                disabled={pending} value={message} onChange={(event) => setMessage(event.target.value)} />
              <div className="flex shrink-0 gap-2">
                <Button type="submit" aria-label="Enviar resposta" disabled={pending || !message.trim()} className="min-h-10 bg-blue-600 hover:bg-blue-700">
                  <Send className="size-4" />
                </Button>
                <Button type="button" variant="outline" disabled={pending} onClick={() => void close()} className="min-h-10">
                  <CheckCircle className="mr-1 size-4" />Encerrar
                </Button>
              </div>
            </form>}
          </>}
        </CardContent>
      </Card>
    </div>
  );
}interface SuperAdminDashboardProps {
  user: AuthenticatedUser;
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

function RegistrationCard({
  reg,
  onApprove,
  onReject,
}: {
  reg: Registration;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayName = reg.name;
  const displaySub = reg.email;

  const statusColor =
    reg.status === 'PENDING'
      ? 'bg-yellow-500'
      : reg.status === 'APPROVED'
      ? 'bg-green-500'
      : 'bg-red-500';
  const statusLabel =
    reg.status === 'PENDING' ? 'Pendente' : reg.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado';

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div
          className={`w-1 shrink-0 ${
            reg.status === 'PENDING'
              ? 'bg-yellow-400'
              : reg.status === 'APPROVED'
              ? 'bg-green-400'
              : 'bg-red-400'
          }`}
        />
        <div className="flex-1 p-4">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <div
              className={`size-9 rounded-full flex items-center justify-center shrink-0 ${
                'bg-blue-100'
              }`}
            >
              <User className="size-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{displaySub}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="hidden sm:inline-flex text-xs" variant="outline">
                Admin
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
              <div>
                <FieldRow label="E-mail" value={reg.email} />
                <FieldRow label="Organização" value={reg.organizationKey} />
              </div>

              {reg.status === 'PENDING' && (
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
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    api.getRegistrations()
      .then(setRegistrations)
      .catch((error: unknown) => setActionError(error instanceof Error ? error.message : 'Não foi possível carregar os cadastros'));
  }, []);

  const approve = async (id: number) => {
    try {
      setActionError('');
      await api.approveRegistration(id);
      setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'APPROVED' } : r));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível aprovar o cadastro');
    }
  };

  const reject = async (id: number) => {
    try {
      setActionError('');
      await api.rejectRegistration(id);
      setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'REJECTED' } : r));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível rejeitar o cadastro');
    }
  };

  const pendingCount = registrations.filter((r) => r.status === 'PENDING').length;
  const approvedCount = registrations.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = registrations.filter((r) => r.status === 'REJECTED').length;

  const filtered = registrations.filter((r) => filter === 'all' || r.status.toLowerCase() === filter);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}

      {/* Header */}
      <header className="bg-white border-b shrink-0">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 bg-purple-700 rounded-full flex items-center justify-center">
              <ShieldCheck className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm leading-tight truncate max-w-[12rem] sm:max-w-none">{user.name}</p>
              <p className="text-xs text-purple-600 flex items-center gap-1">
                <ShieldCheck className="size-3" />
                Super Administrador
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setShowChangePwd(true)} className="min-h-10 flex items-center gap-2">
              <KeyRound className="size-4" />
              Trocar Senha
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout} className="min-h-10 flex items-center gap-2">
              <LogOut className="size-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="registrations">
          <TabsList className="mb-6 max-w-full overflow-x-auto flex-nowrap justify-start">
            <TabsTrigger value="registrations">Cadastros</TabsTrigger>
            <TabsTrigger value="support"><LifeBuoy className="size-4" />Suporte</TabsTrigger>
          </TabsList>
          <TabsContent value="registrations">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
            {actionError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p>}
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
          </TabsContent>
          <TabsContent value="support">
            <SupportInbox />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
