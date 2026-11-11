import { useEffect, useState } from 'react';

export function useChatPolling<T>(
  resource: string | number | null,
  load: (signal: AbortSignal) => Promise<T>,
  revision = 0,
  interval = 4000,
) {
  const [result, setResult] = useState<{ resource: string | number; data?: T; error?: string }>();

  useEffect(() => {
    if (resource === null) return;
    const controller = new AbortController();
    let timer: number;

    const refresh = async () => {
      try {
        const data = await load(controller.signal);
        if (!controller.signal.aborted) setResult({ resource, data });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({
            resource,
            error: error instanceof Error ? error.message : 'Não foi possível atualizar as mensagens',
          });
        }
      } finally {
        if (!controller.signal.aborted) timer = window.setTimeout(refresh, interval);
      }
    };

    void refresh();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [resource, load, revision, interval]);

  const current = result?.resource === resource ? result : undefined;
  return { data: current?.data, error: current?.error, loading: resource !== null && !current };
}
