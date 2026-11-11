import { useCallback, useRef } from 'react';
import { api } from '../../services/api';
import type { ChatMessage } from '../types/chat';
import { useChatPolling } from './useChatPolling';

export function useChatHistory(chatId: number | null, revision: number) {
  const cache = useRef<{ chatId: number; cursor: number; messages: ChatMessage[] }>();

  const load = useCallback(async (signal: AbortSignal) => {
    if (chatId === null) return [];
    const previous = cache.current?.chatId === chatId ? cache.current : undefined;
    let cursor = previous?.cursor ?? 0;
    const received: ChatMessage[] = [];
    try {
      for (;;) {
        const page = await api.getChatMessages(chatId, cursor, signal);
        const last = page.at(-1);
        if (!last) break;
        received.push(...page);
        cursor = last.id;
        if (page.length < 100) break;
      }
      const messages = received.length
        ? [...previous?.messages ?? [], ...received].sort((left, right) =>
            left.createdAt.localeCompare(right.createdAt) || left.id - right.id)
        : previous?.messages ?? [];
      if (!signal.aborted) cache.current = { chatId, cursor, messages };
      return messages;
    } catch (error) {
      if (!signal.aborted) cache.current = undefined;
      throw error;
    }
  }, [chatId]);

  return useChatPolling(chatId, load, revision);
}
