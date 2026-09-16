import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
  LifeBuoy,
  Send,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { api } from '../../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SupportInboxChat {
  id: number;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  requester: { name: string; email: string; role: string };
  messages: { id: number; content: string; createdAt: string; sender: { name: string } }[];
}

function normalizeSupportChats(value: unknown): SupportInboxChat[] {
  if (!Array.isArray(value)) return [];
  return value.map((chat: any) => ({
    ...chat,
    requester: chat.requester ?? { name: 'Usuário', email: '', role: '' },
    messages: Array.isArray(chat.messages) ? chat.messages.map((message: any) => ({
      ...message,
      sender: message.sender ?? { name: 'Usuário' },
    })) : [],
  }));
}

function SupportInbox() {
  const [chats, setChats] = useState<SupportInboxChat[]>([]);
  const [selectedId, setSelectedId] = useState<number>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selectedChat = chats.find((chat) => chat.id === selectedId);

  const load = async () => {
    try { setChats(normalizeSupportChats(await api.getSupportChats())); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível carregar os atendimentos'); }
  };

  useEffect(() => { void load(); }, []);

  const reply = async () => {
    if (!selectedChat || !message.trim()) return;
    try {
      const updated = await api.sendSupportMessage(selectedChat.id, message.trim()) as SupportInboxChat;
      setChats((current) => current.map((chat) => chat.id === updated.id ? updated : chat));
      setMessage('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível enviar a resposta'); }
  };

  const close = async () => {
    if (!selectedChat) return;
    try {
      const updated = await api.closeSupportChat(selectedChat.id) as SupportInboxChat;
      setChats((current) => current.map((chat) => chat.id === updated.id ? updated : chat));
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível encerrar o atendimento'); }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><LifeBuoy className="size-5 text-blue-600" />Atendimentos</CardTitle><CardDescription>Histórico aberto e encerrado nos últimos 7 dias.</CardDescription></CardHeader>
        <CardContent className="space-y-2 max-h-[34rem] overflow-y-auto">
          {chats.length === 0 && <p className="text-sm text-gray-500">Nenhum atendimento encontrado.</p>}
          {chats.map((chat) => <button key={chat.id} onClick={() => setSelectedId(chat.id)} className={`w-full text-left rounded-md border p-3 ${selectedId === chat.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}><div className="flex justify-between gap-2"><span className="text-sm font-medium truncate">{chat.requester.name}</span><Badge variant={chat.status === 'OPEN' ? 'default' : 'secondary'}>{chat.status === 'OPEN' ? 'Aberto' : 'Encerrado'}</Badge></div><p className="text-xs text-gray-500 truncate">{chat.requester.email}</p><p className="text-xs text-gray-400 mt-1">Atendimento #{chat.id}</p></button>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{selectedChat ? `Atendimento de ${selectedChat.requester.name}` : 'Selecione um atendimento'}</CardTitle>{selectedChat && <CardDescription>{selectedChat.requester.email} · {selectedChat.requester.role}</CardDescription>}</CardHeader>
        <CardContent>
          {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {!selectedChat ? <p className="py-16 text-center text-sm text-gray-500">As mensagens do atendimento selecionado aparecerão aqui.</p> : <><div className="h-80 overflow-y-auto space-y-3 rounded-md bg-gray-50 p-4">{selectedChat.messages.map((item) => <div key={item.id} className="rounded-md bg-white border p-3"><p className="text-sm">{item.content}</p><p className="mt-1 text-xs text-gray-400">{item.sender.name} · {new Date(item.createdAt).toLocaleString('pt-BR')}</p></div>)}</div>{selectedChat.status === 'OPEN' && <div className="mt-4 flex gap-2"><Input placeholder="Responder ao atendimento..." value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void reply(); }} /><Button onClick={() => void reply()} className="bg-blue-600 hover:bg-blue-700"><Send className="size-4" /></Button><Button variant="outline" onClick={() => void close()}><CheckCircle className="size-4 mr-1" />Encerrar</Button></div>}</>}
        </CardContent>
      </Card>
    </div>
  );
}

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

function RegistrationCard({
  reg,
  onApprove,
  onReject,
}: {
  reg: any;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayName = reg.name;
  const displaySub = reg.email;

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
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    api.getRegistrations()
      .then((items: any[]) => setRegistrations(items.map((item) => ({
        ...item,
        status: String(item.status).toLowerCase(),
      }))))
      .catch(() => setRegistrations([]));
  }, []);

  const approve = async (id: number) => {
    try {
      setActionError('');
      await api.approveRegistration(id);
      setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível aprovar o cadastro');
    }
  };

  const reject = async (id: number) => {
    try {
      setActionError('');
      await api.rejectRegistration(id);
      setRegistrations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível rejeitar o cadastro');
    }
  };

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

      <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="registrations">
          <TabsList className="mb-6">
            <TabsTrigger value="registrations">Cadastros</TabsTrigger>
            <TabsTrigger value="support"><LifeBuoy className="size-4" />Suporte</TabsTrigger>
          </TabsList>
          <TabsContent value="registrations">
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
