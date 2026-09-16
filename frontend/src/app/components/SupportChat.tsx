import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { LifeBuoy, X, Send, Plus, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

interface SupportMessage {
  id: number;
  content: string;
  createdAt: string;
  sender: { id: number; name: string };
}

interface SupportChatRecord {
  id: number;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  closedAt?: string;
  requester: { id: number; name: string; email: string; role: string };
  messages: SupportMessage[];
}

interface SupportChatProps {
  user: { id?: number; name: string };
  userType: 'student' | 'teacher' | 'admin' | 'super_admin';
}

const formatTime = (value: string) => new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export function SupportChat({ user, userType }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<SupportChatRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number>();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSuperAdmin = userType === 'super_admin';
  const selectedChat = chats.find((chat) => chat.id === selectedId);

  const loadChats = async () => {
    try {
      setChats(await api.getSupportChats() as SupportChatRecord[]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os atendimentos');
    }
  };

  useEffect(() => { if (isOpen) void loadChats(); }, [isOpen]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedChat?.messages.length]);

  const send = async () => {
    if (!input.trim()) return;
    try {
      const chat = selectedChat
        ? await api.sendSupportMessage(selectedChat.id, input.trim())
        : await api.createSupportChat(input.trim());
      setChats((current) => {
        const next = current.filter((item) => item.id !== (chat as SupportChatRecord).id);
        return [chat as SupportChatRecord, ...next];
      });
      setSelectedId((chat as SupportChatRecord).id);
      setInput('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem');
    }
  };

  const closeChat = async () => {
    if (!selectedChat) return;
    try {
      const closed = await api.closeSupportChat(selectedChat.id) as SupportChatRecord;
      setChats((current) => current.map((chat) => chat.id === closed.id ? closed : chat));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível encerrar o atendimento');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button aria-label="Abrir suporte" onClick={() => setIsOpen(true)} className="rounded-full size-14 bg-blue-600 hover:bg-blue-700 shadow-lg">
          <LifeBuoy className="size-6" />
        </Button>
      ) : (
        <Card className="w-[min(92vw,28rem)] shadow-2xl">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><LifeBuoy className="size-5" />Suporte Aurora</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700 h-8 w-8 p-0"><X className="size-4" /></Button>
            </div>
            <p className="text-xs text-blue-100">Fale com a equipe de suporte. O histórico encerrado fica disponível por 7 dias.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex border-b overflow-x-auto p-2 gap-2">
              {chats.map((chat) => (
                <button key={chat.id} onClick={() => setSelectedId(chat.id)} className={`shrink-0 rounded-md border px-2 py-1 text-xs text-left ${selectedId === chat.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                  <span className="block font-medium">Atendimento #{chat.id}</span>
                  <span className="text-gray-500">{chat.status === 'OPEN' ? 'Aberto' : 'Encerrado'}</span>
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setSelectedId(undefined)} className="shrink-0"><Plus className="size-4" />Novo</Button>
            </div>
            {selectedChat && (
              <div className="flex items-center justify-between px-4 py-2 border-b text-xs">
                <div><span className="font-medium">{isSuperAdmin ? selectedChat.requester.name : 'Seu atendimento'}</span><span className="ml-2 text-gray-400">{formatTime(selectedChat.createdAt)}</span></div>
                <div className="flex items-center gap-2"><Badge variant={selectedChat.status === 'OPEN' ? 'default' : 'secondary'}>{selectedChat.status === 'OPEN' ? 'Aberto' : 'Encerrado'}</Badge>{selectedChat.status === 'OPEN' && <Button variant="ghost" size="sm" onClick={closeChat} className="h-7 px-2 text-gray-500"><CheckCircle className="size-3 mr-1" />Encerrar</Button>}</div>
              </div>
            )}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {!selectedChat && <p className="text-sm text-gray-500 text-center py-10">Descreva sua dúvida para iniciar um atendimento.</p>}
              {selectedChat?.messages.map((message) => <div key={message.id} className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-lg p-3 ${message.sender.id === user.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}><p className="text-sm">{message.content}</p><span className="text-[10px] opacity-70 mt-1 block">{message.sender.name} · {formatTime(message.createdAt)}</span></div></div>)}
              <div ref={messagesEndRef} />
            </div>
            {error && <p className="px-4 pb-2 text-xs text-red-600">{error}</p>}
            {(!selectedChat || selectedChat.status === 'OPEN') && <div className="border-t p-3 flex gap-2"><Input placeholder="Escreva para o suporte..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void send(); }} /><Button aria-label="Enviar mensagem" onClick={() => void send()} className="bg-blue-600 hover:bg-blue-700"><Send className="size-4" /></Button></div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}