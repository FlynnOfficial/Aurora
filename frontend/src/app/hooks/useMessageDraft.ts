import { useRef } from 'react';
import type { MessageDraft } from '../types/chat';

export function useMessageDraft() {
  const draft = useRef<(MessageDraft & { destination: string }) | null>(null);

  const prepare = (destination: string, content: string): MessageDraft => {
    if (draft.current?.destination !== destination || draft.current.content !== content) {
      draft.current = { destination, content, requestId: crypto.randomUUID() };
    }
    return { content, requestId: draft.current.requestId };
  };

  return { prepare, clear: () => { draft.current = null; } };
}
