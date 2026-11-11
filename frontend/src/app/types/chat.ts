export interface ChatContact {
  id: number;
  name: string;
}

export interface Chat {
  id: number;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  closedAt: string | null;
  requester: ChatContact & { email: string | null; role: string };
  recipient: ChatContact | null;
}

export interface ChatMessage {
  id: number;
  content: string;
  createdAt: string;
  sender: ChatContact;
}

export interface MessageDraft {
  content: string;
  requestId: string;
}
