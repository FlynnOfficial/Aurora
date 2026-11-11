import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { LifeBuoy, MessageCircle, Plus, Send, X } from 'lucide-react';
import { api } from '../../services/api';
import { useChatHistory } from '../hooks/useChatHistory';
import { useChatPolling } from '../hooks/useChatPolling';
import { useMessageDraft } from '../hooks/useMessageDraft';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface SupportChatProps {
  user: { id: number };
  userType: 'student' | 'teacher' | 'admin';
}

type Destination = { kind: 'support' } | { kind: 'contact' | 'chat'; id: number };

const formatTime = (value: string) => new Date(value).toLocaleString('pt-BR', {
  dateStyle: 'short', timeStyle: 'short',
});

export function SupportChat({ user, userType }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState<Destination>();
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const end = useRef<HTMLDivElement>(null);
  const messageDraft = useMessageDraft();
  const academicChat = userType !== 'admin';
  const selectedId = destination?.kind === 'chat' ? destination.id : null;
  const chats = useChatPolling(isOpen ? 'chats' : null, api.getSupportChats, revision);
  const contacts = useChatPolling(isOpen && academicChat ? 'contacts' : null, api.getChatContacts, 0, 30000);
  const history = useChatHistory(isOpen ? selectedId : null, revision);
  const selectedChat = chats.data?.find((chat) => chat.id === selectedId);
  const direct = selectedChat?.recipient;
  const recipient = direct && selectedChat
    ? direct.id === user.id ? selectedChat.requester : direct
    : null;
  const contact = destination?.kind === 'contact' ? contacts.data?.find((item) => item.id === destination.id) : undefined;
  const canSend = Boolean(contact || destination?.kind === 'support' || selectedChat?.status === 'OPEN');
  const lastMessage = history.data?.at(-1)?.id;
  const chatError = error || history.error || chats.error || contacts.error;

  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [isOpen, selectedId, lastMessage]);

  const select = (target: Destination) => {
    setDestination(target);
    setInput('');
    setError('');
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!destination || !canSend || !content || pending) return;
    setPending(true);
    setError('');
    const key = destination.kind === 'support' ? 'support' : `${destination.kind}:${destination.id}`;
    const draft = messageDraft.prepare(key, content);
    try {
      if (destination.kind === 'chat') {
        await api.sendSupportMessage(destination.id, draft);
      } else {
        const chat = destination.kind === 'support'
          ? await api.createSupportChat(draft)
          : await api.startDirectChat(destination.id, draft);
        setDestination({ kind: 'chat', id: chat.id });
      }
      messageDraft.clear();
      setInput('');
      setRevision((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem');
    } finally {
      setPending(false);
    }
  };

  const closeChat = async () => {
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
    <div className="fixed bottom-3 right-3 z-50 sm:bottom-4 sm:right-4">
      {!isOpen ? (
        <Button aria-label="Abrir mensagens" onClick={() => setIsOpen(true)} className="size-14 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700">
          {academicChat ? <MessageCircle className="size-6" /> : <LifeBuoy className="size-6" />}
        </Button>
      ) : (
        <Card className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden py-0 shadow-2xl sm:w-[min(92vw,28rem)]">
          <CardHeader className="flex flex-row items-center justify-between bg-blue-600 p-4 text-white">
            <CardTitle className="text-lg">{academicChat ? 'Mensagens Aurora' : 'Suporte Aurora'}</CardTitle>
            <Button aria-label="Fechar mensagens" variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-blue-700 hover:text-white">
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-col p-0">
            <div className="flex shrink-0 gap-2 overflow-x-auto border-b p-2">
              <Button variant="outline" size="sm" disabled={pending} onClick={() => select({ kind: 'support' })}>
                <Plus className="size-4" /> Novo atendimento
              </Button>
              {chats.data?.map((chat) => (
                <Button key={chat.id} variant={chat.id === selectedId ? 'default' : 'outline'} size="sm"
                  aria-pressed={chat.id === selectedId} disabled={pending} onClick={() => select({ kind: 'chat', id: chat.id })}>
                  {chat.recipient
                    ? chat.recipient.id === user.id ? chat.requester.name : chat.recipient.name
                    : `Atendimento #${chat.id}`}
                </Button>
              ))}
            </div>
            {academicChat && (
              <div className="shrink-0 border-b p-2">
                <label htmlFor="chat-contact" className="sr-only">Iniciar conversa</label>
                <select id="chat-contact" className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                  disabled={pending || !contacts.data?.length || !chats.data} value={contact?.id ?? ''}
                  onChange={(event) => {
                    const id = Number(event.target.value);
                    if (!id) return;
                    const existing = chats.data?.find((chat) => chat.recipient &&
                      (chat.recipient.id === id || chat.requester.id === id));
                    select(existing ? { kind: 'chat', id: existing.id } : { kind: 'contact', id });
                  }}>
                  <option value="">{contacts.loading ? 'Carregando contatos…'
                    : contacts.data?.length ? 'Iniciar conversa' : 'Nenhum contato disponível'}</option>
                  {contacts.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 border-b px-4 py-2 text-sm">
              <span className="min-w-0 truncate font-medium">{recipient?.name ?? contact?.name
                ?? (destination ? 'Suporte Aurora' : 'Conversas')}</span>
              {selectedChat && !direct && (selectedChat.status === 'CLOSED'
                ? <span className="text-xs text-gray-500">Encerrado</span>
                : <Button variant="ghost" size="sm" disabled={pending} onClick={() => void closeChat()}>Encerrar</Button>)}
            </div>
            <div className="min-h-0 h-[clamp(10rem,42dvh,18rem)] space-y-3 overflow-y-auto p-3 sm:p-4" role="log" aria-label="Histórico">
              {(chats.loading || history.loading) && <p role="status" className="text-sm text-gray-500">Carregando…</p>}
              {!destination && !chats.loading && <p className="text-sm text-gray-500">Selecione uma conversa ou inicie um atendimento.</p>}
              {history.data?.map((message) => {
                const sent = message.sender.id === user.id;
                return <div key={message.id} className={`flex ${sent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 ${sent ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <p className="break-words whitespace-pre-wrap text-sm">{message.content}</p>
                    <span className="mt-1 block text-[10px] opacity-75">{message.sender.name} · {formatTime(message.createdAt)}</span>
                  </div>
                </div>;
              })}
              <div ref={end} />
            </div>
            {chatError && <p role="alert" className="px-4 py-2 text-xs text-red-600">{chatError}</p>}
            {canSend && <form onSubmit={send} className="flex shrink-0 gap-2 border-t p-3">
              <Input aria-label="Mensagem" placeholder="Escreva uma mensagem…" maxLength={4000}
                disabled={pending} value={input} onChange={(event) => setInput(event.target.value)} />
              <Button type="submit" aria-label="Enviar mensagem" disabled={pending || !input.trim()} className="bg-blue-600 hover:bg-blue-700">
                <Send className="size-4" />
              </Button>
            </form>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
